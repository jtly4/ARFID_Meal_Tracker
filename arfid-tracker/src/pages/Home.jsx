import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodayMeals, formatMealTime } from '../db/meals'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }
const GOAL = 3 // target meals per day
const MOOD_EMOJIS = { very_hard: '/very_hard.png', hard: '/hard.png', okay: '/ok.png', good: '/good.png', very_good: '/very_good.png'}


function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}


export default function Home() {
  const navigate  = useNavigate()
  const [meals, setMeals] = useState([])

  useEffect(() => { loadToday() }, [])

  async function loadToday() {
    const data = await getTodayMeals()
    setMeals(data)
  }

  const safeMeals           = meals.filter(m => m.is_safe_food).length
  const outsideComfortMeals = meals.filter(m => !m.is_safe_food).length
  const totalMeals          = meals.filter(m => m.meal_type !== 'snack').length

  const progress            = Math.min(totalMeals / GOAL, 1)

  // Which meal types have been logged today
  const loggedTypes  = new Set(meals.map(m => m.meal_type))

  return (
    <div className="px-4 pt-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{getGreeting()} 👋</h1>
          <p className="text-purple-500 font-medium text-sm mt-0.5">You're doing great.</p>
        </div>
      </div>

      {/* Today's Progress Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-sm font-semibold text-gray-500 mb-4">Today's Progress</p>
        <div className="flex items-center gap-4">

          {/* Circle progress */}
          {/* 💡 HINT: SVG circle trick — strokeDasharray is circumference, strokeDashoffset controls fill */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f0ff" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="40" fill="none"
                stroke="#7c3aed" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{totalMeals}</span>
              <span className="text-xs text-gray-400">of {GOAL} meals</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
              <span className="text-gray-600">{safeMeals} Safe meal{safeMeals !== 1 ? 's' : ''}</span>
            </div>
            {outsideComfortMeals > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-xs">★</span>
                <span className="text-gray-600">{outsideComfortMeals} Outside comfort</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">Every bite counts. You've got this. 💜</p>
          </div>
        </div>
      </div>

      {/* Log a Meal section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Log a Meal</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map(type => {
            const done = loggedTypes.has(type)
            return (
              <button
                key={type}
                onClick={() => navigate('/log', { state: { meal_type: type } })}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all
                  ${done
                    ? 'bg-purple-50 border-purple-200 text-purple-600'
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-purple-200'
                  }`}
              >
                <span className="text-xl">{MEAL_ICONS[type]}</span>
                <span className="capitalize">{type}</span>
                {done && <span className="text-purple-400 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Today's meal log */}
      <div className="flex flex-col gap-2 mb-4">
        {meals.map(meal => (
        <button key={meal.id}
          onClick={() => navigate('/log', { state: { editId: meal.id } })} 
          className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between w-full text-left">
          <div className="flex items-center gap-3">
            <span className="text-xl">{MEAL_ICONS[meal.meal_type]}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800 text-sm">{meal.food_name}</p>
                {meal.is_safe_food && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Safe</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {meal.time && (
                  <p className="text-xs text-gray-400">{formatMealTime(meal.date, meal.time)}</p>
                )}
                <p className="text-xs text-gray-400 capitalize">{meal.meal_type}</p>
              </div>
            </div>
          </div>
          {meal.mood && MOOD_EMOJIS[meal.mood] && (
            <img src={MOOD_EMOJIS[meal.mood]} alt={meal.mood} className="w-8 h-8 object-contain" />
          )}
        </button>
      ))}
      </div>
      

      {/* ARFID Support Card */}
      <div className="bg-purple-50 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-sm">ARFID Support</p>
          <p className="text-xs text-gray-500 mt-0.5">You are not alone.</p>
          <a href="https://www.nationaleatingdisorders.org/avoidant-restrictive-food-intake-disorder-arfid/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 text-xs font-medium mt-2 flex items-center gap-1">
            Learn more about ARFID →
          </a>
        </div>
        <span className="text-4xl">🌱</span>
      </div>

    </div>
  )
}