import { useState, useEffect } from 'react'
import { getSafeFoods, addSafeFood, deleteSafeFood } from '../db/safeFoods'

export default function SafeFoods() {
  const [foods,   setFoods]   = useState([])
  const [newFood, setNewFood] = useState('')

  useEffect(() => { loadFoods() }, [])

  async function loadFoods() {
    const data = await getSafeFoods()
    setFoods(data)
  }

  async function handleAdd() {
    if (!newFood.trim()) return
    await addSafeFood(newFood.trim())
    setNewFood('')
    loadFoods()
  }

  async function handleDelete(id) {
    await deleteSafeFood(id)
    loadFoods()
  }

  return (
    <div className="px-4 pt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Safe Foods</h1>
      <p className="text-sm text-gray-400 mb-6">Foods you know and trust.</p>

      {/* Add input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newFood}
          onChange={e => setNewFood(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a safe food..."
          className="flex-1 border border-gray-100 bg-white rounded-xl px-4 py-2.5 text-sm shadow-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm"
        >
          Add
        </button>
      </div>

      {/* List */}
      {foods.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">⭐</p>
          <p className="font-medium">No safe foods yet</p>
          <p className="text-sm mt-1">Add foods you feel comfortable eating</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {foods.map(food => (
            <li
              key={food.id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400">⭐</span>
                <span className="font-medium text-gray-700 text-sm">{food.food_name}</span>
              </div>
              <button
                onClick={() => handleDelete(food.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}