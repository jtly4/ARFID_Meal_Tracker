import { useState, useEffect } from 'react'
import { getSafeFoods, addSafeFood, deleteSafeFood } from '../db/safeFoods'

export default function SafeFoods() {
  const [foods, setFoods]     = useState([])
  const [newFood, setNewFood] = useState('')

  // 💡 HINT: useEffect with [] runs once when the page loads — perfect for fetching initial data
  useEffect(() => {
    loadFoods()
  }, [])

  async function loadFoods() {
    const data = await getSafeFoods()
    setFoods(data)
  }

  async function handleAdd() {
    if (!newFood.trim()) return
    await addSafeFood(newFood.trim())
    setNewFood('')
    loadFoods() // 💡 HINT: Reload the list after adding so it reflects the new item
  }

  async function handleDelete(id) {
    await deleteSafeFood(id)
    loadFoods()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⭐ Safe Foods</h1>

      {/* Add new safe food */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newFood}
          onChange={e => setNewFood(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()} // 💡 HINT: submit on Enter key
          placeholder="Add a safe food..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Add
        </button>
      </div>

      {/* List */}
      {foods.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No safe foods yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {foods.map(food => (
            <li
              key={food.id}
              className="flex items-center justify-between bg-white border rounded-xl px-4 py-3"
            >
              <span className="font-medium">{food.food_name}</span>
              {/* 💡 HINT: Person A — you can make this a trash icon using an emoji or
                  install lucide-react for a proper icon: npm install lucide-react */}
              <button
                onClick={() => handleDelete(food.id)}
                className="text-red-400 hover:text-red-600 text-sm"
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