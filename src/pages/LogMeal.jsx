import { useState } from 'react'
import { logMeal } from '../db/meals'

// 💡 HINT: mood options and meal types are defined as constants so they're easy to change
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MOODS = [
  { value: 'happy',   label: '😄 Happy' },
  { value: 'proud',   label: '🌟 Proud' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'refused', label: '🚫 Refused' },
]

export default function LogMeal() {
  // 💡 HINT: Each form field gets its own state variable
  const [mealType, setMealType] = useState('breakfast')
  const [foodName, setFoodName] = useState('')
  const [notes, setNotes]       = useState('')
  const [mood, setMood]         = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]) // today's date
  const [success, setSuccess]   = useState(false)

  async function handleSubmit() {
    if (!foodName.trim()) return alert('Please enter a food name!')

    // 💡 HINT: Call the db function, then reset the form
    await logMeal({ date, meal_type: mealType, food_name: foodName, notes, mood })

    setFoodName('')
    setNotes('')
    setMood('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000) // hide success message after 2s
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Log a Meal</h1>

      {/* Date */}
      <label className="block mb-4">
        <span className="text-gray-600 text-sm">Date</span>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="mt-1 block w-full border rounded-lg px-3 py-2"
        />
      </label>

      {/* Meal type selector */}
      {/* 💡 HINT: Person A — style the active button differently using a ternary:
          mealType === type ? 'bg-green-500 text-white' : 'bg-white text-gray-600' */}
      <div className="flex gap-2 mb-4">
        {MEAL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setMealType(type)}
            className={`flex-1 py-2 rounded-lg border capitalize text-sm font-medium
              ${mealType === type ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Food name */}
      <label className="block mb-4">
        <span className="text-gray-600 text-sm">What did you eat?</span>
        <input
          type="text"
          value={foodName}
          onChange={e => setFoodName(e.target.value)}
          placeholder="e.g. mac and cheese"
          className="mt-1 block w-full border rounded-lg px-3 py-2"
        />
      </label>

      {/* Mood */}
      <div className="mb-4">
        <span className="text-gray-600 text-sm block mb-2">How did it feel?</span>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`px-3 py-1 rounded-full border text-sm
                ${mood === m.value ? 'bg-blue-100 border-blue-400' : 'bg-white'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <label className="block mb-6">
        <span className="text-gray-600 text-sm">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything you want to remember..."
          className="mt-1 block w-full border rounded-lg px-3 py-2 h-20 resize-none"
        />
      </label>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl"
      >
        Save Meal
      </button>

      {success && (
        <p className="text-center text-green-600 mt-3 font-medium">✅ Meal logged!</p>
      )}
    </div>
  )
}