import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logMeal, getMealById, updateMeal, deleteMeal, searchMeals, getRecentMeals, formatMealTime } from '../db/meals'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const MOODS = [
  { value: 'very_hard', emoji: '/very_hard.png', label: 'Very hard' },
  { value: 'hard',      emoji: '/hard.png', label: 'Hard' },
  { value: 'okay',      emoji: '/ok.png', label: 'Okay' },
  { value: 'good',      emoji: '/good.png', label: 'Good' },
  { value: 'very_good', emoji: '/very_good.png', label: 'Very good' },
]

export default function LogMeal() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const preselected = location.state?.meal_type || 'breakfast'
  const editId = location.state?.editId || null
  const isEditing = !!editId

  const [mealType,    setMealType]    = useState(preselected)
  const [foodName,    setFoodName]    = useState('')
  const [selectedRecentId, setSelectedRecentId] = useState(null)

  const [notes,       setNotes]       = useState('')
  const [mood,        setMood]        = useState('')
  const [date,        setDate]        = useState(new Date().toLocaleDateString('en-CA'))
  const [mealTime,    setMealTime]    = useState(
    new Date().toTimeString().slice(0, 5)
  )
  const [isSafeFood,  setIsSafeFood]  = useState(false)
  const [recentMeals, setRecentMeals] = useState([])
  const [search,      setSearch]      = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [success,     setSuccess]     = useState(false)

  useEffect(() => { loadRecent() }, [])

  useEffect(() => {
    if (!editId) return
    getMealById(editId).then(meal => {
      if (!meal) return
      setMealType(meal.meal_type)
      setFoodName(meal.food_name)
      setNotes(meal.notes || '')
      setMood(meal.mood || '')
      setDate(meal.date)
      setMealTime(meal.time?.slice(0, 5) || '')
      setIsSafeFood(meal.is_safe_food || false)
    })
  }, [editId])

  useEffect(() => {
    if (!search.trim()) { 
      setSearchResults([])
      return
    }

    const delay = setTimeout(async () => {
      const results = await searchMeals(search)
      const unique = Array.from(new Map(results.map(meal => [meal.food_name, meal])).values())
      setSearchResults(unique)
    }, 300)

  return () => clearTimeout(delay)
  }, [search])

  async function handleDelete() {
    if (!confirm('Delete this meal entry?')) return
    await deleteMeal(editId)
    navigate('/')
  }

  async function loadRecent() {
    const data = await getRecentMeals(3) // last 3 meals
    setRecentMeals(data)
  }

  async function handleSubmit() {
    if (!foodName.trim()) return alert('Please enter a food name!')

    if (isEditing) {
      await updateMeal(editId, {
        date,
        time:    mealTime || null,
        meal_type:    mealType,
        food_name:    foodName.trim(),
        notes,
        mood:         mood || null,
        is_safe_food: isSafeFood,
      })
    } else {
    await logMeal({
      date,
      time:        mealTime,
      meal_type:   mealType,
      food_name:   foodName.trim(),
      notes,
      mood:        mood || null,
      is_safe_food: isSafeFood,
    }) }

    setSuccess(true)
  }

  function quickFill(meal) {
    if (selectedRecentId === meal.id) {
      setSelectedRecentId(null)
      setFoodName('')
      setIsSafeFood(false)
      return
    }
    
    setFoodName(meal.food_name)
    setIsSafeFood(meal.is_safe_food || false)
    setSelectedRecentId(meal.id)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl mb-4 shadow-lg">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Meal logged!</h2>
        <p className="text-gray-500 text-sm mb-6">Nice work taking care of yourself.</p>

        <div className="bg-white rounded-2xl p-4 w-full shadow-sm text-left mb-6">
          <p className="text-xs text-gray-400 mb-3">You logged</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{MEAL_ICONS[mealType]}</span>
            <div>
              <p className="font-semibold text-gray-800">{foodName}</p>
              {isSafeFood && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Safe Food</span>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><span className="text-gray-400">Meal</span><p className="capitalize font-medium text-gray-700">{mealType}</p></div>
            <div><span className="text-gray-400">Time</span><p className="font-medium text-gray-700">{formatMealTime(date, mealTime)}</p></div>
            {mood && <div><span className="text-gray-400">How it went</span>
              <div className="flex items-center gap-1 mt-0.5">
                <img src={MOODS.find(m => m.value === mood)?.emoji} alt={mood} className="w-5 h-5 object-contain" />
                <p className="font-medium text-gray-700">{MOODS.find(m => m.value === mood)?.label}</p>
              </div>
            </div>}
            {notes && <div className="col-span-2"><span className="text-gray-400">Notes</span><p className="font-medium text-gray-700">{notes}</p></div>}
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 w-full text-sm text-purple-700 font-medium mb-6">
          💜 Tiny wins matter. You logged a meal and showed up for yourself today.
        </div>

        <button onClick={() => navigate('/')} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold mb-3">
          Back to Home
        </button>
        <button onClick={() => { setSuccess(false); setFoodName(''); setNotes(''); setMood(''); loadRecent() }}
          className="text-purple-600 text-sm font-medium">
          Log another meal
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 text-xl">‹</button>
          <h1 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Edit Meal' : 'Log a Meal'}</h1>
        </div>
        {isEditing && (
          <button onClick={handleDelete} className="text-red-400 text-sm font-medium">
            Delete
          </button>
        )}
      </div>

      

      <p className="text-sm text-gray-400 mb-4">What did you have? It's okay if it's the same as always.</p>

      {/* Meal type */}
      <div className="flex gap-2 mb-5">
        {MEAL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`flex-1 flex flex-col items-center py-2 rounded-xl border text-xs font-medium transition-all
              ${mealType === type
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-500 border-gray-100'}`}
          >
            <span className="text-base mb-0.5">{MEAL_ICONS[type]}</span>
            <span className="capitalize">{type}</span>
          </button>
        ))}
      </div>

      {/* Date + Time row */}
      <div className="flex gap-3 mb-4">
        <label className="flex-1">
          <span className="text-xs text-gray-400 block mb-1">Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="flex-1">
          <span className="text-xs text-gray-400 block mb-1">Time eaten</span>
          <input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)}
            className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2 text-sm" />
        </label>
      </div>

      {/* Food name search/input */}
      <div className="mb-4 relative">
        <span className="text-xs text-gray-400 block mb-1">Food name</span>
        <input type="text" value={foodName} onChange={(e) => {setFoodName(e.target.value); setSearch(e.target.value)}}
          placeholder="Type or search foods..."
          className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2 text-sm"/>
        {search.trim() && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map(meal => (
              <div key={meal.id} onClick={() => {
                setFoodName(meal.food_name); setSearch(''); setSearchResults([]); setIsSafeFood(meal.is_safe_food || false)
              }}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">{meal.food_name}</p>
                  <p className="text-xs text-gray-400">{meal.meal_type} • {meal.date}</p>
                </div>
                <span className="text-xs text-gray-400">↵</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent meals quick-fill */}
      {recentMeals.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Recent — tap to quick-fill</p>
          <div className="flex flex-col gap-2">
            {recentMeals.map(meal => (
              <button
                key={meal.id}
                onClick={() => quickFill(meal)}
                className={`flex items-center justify-between bg-white border rounded-xl px-4 py-3 text-sm transition-all
                  ${selectedRecentId === meal.id ? 'border-purple-400 bg-purple-50' : 'border-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-medium text-gray-700">{meal.food_name}</p>
                    {meal.is_safe_food && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Safe Food</span>
                    )}
                  </div>
                </div>
                {selectedRecentId === meal.id && <span className="text-purple-500 text-base">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Safe food toggle */}
      <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4">
        <span className="text-sm text-gray-700">Safe food?</span>
        <button
          onClick={() => setIsSafeFood(prev => !prev)}
          className={`w-12 h-6 rounded-full transition-colors relative ${isSafeFood ? 'bg-purple-500' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
            ${isSafeFood ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Notes */}
      <label className="block mb-5">
        <span className="text-xs text-gray-400 block mb-1">Add notes (optional)</span>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did this meal go for you?"
          className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2 text-sm h-20 resize-none"
        />
      </label>

      {/* Mood / Meal experience */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Meal experience</p>
        <p className="text-xs text-gray-400 mb-3">How was this meal for you?</p>
        <div className="flex justify-between">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all
                ${mood === m.value ? 'bg-purple-50 border border-purple-300' : ''}`}
            >
              <img src={m.emoji} alt={m.label} className="w-10 h-10 object-contain" />
              <span className="text-xs text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl shadow-md"
      >
        {isEditing ? 'Save Changes' : 'Save Meal'}
      </button>
    </div>
  )
}