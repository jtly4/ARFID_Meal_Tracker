import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getMealsForWeek, getMostCommonMeal, getMoodCounts } from '../db/meals'

// 💡 HINT: These colors map to your mood values in order. Customize freely!
const MOOD_COLORS = {
  happy:   '#4ade80',
  proud:   '#60a5fa',
  neutral: '#facc15',
  anxious: '#f97316',
  refused: '#f87171',
}

function getWeekRange() {
  // 💡 HINT: Get Monday–Sunday of the current week as date strings
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = d => d.toISOString().split('T')[0]
  return { start: fmt(monday), end: fmt(sunday) }
}

export default function Stats() {
  const [meals, setMeals]           = useState([])
  const [mostCommon, setMostCommon] = useState(null)
  const [moodData, setMoodData]     = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { start, end } = getWeekRange()
    const data = await getMealsForWeek(start, end)
    setMeals(data)
    setMostCommon(getMostCommonMeal(data))
    setMoodData(getMoodCounts(data))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 This Week</h1>

      {/* Stat cards */}
      {/* 💡 HINT: Person A — style these cards however you like. Grid of 2 works well on mobile. */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-4xl font-bold text-green-500">{meals.length}</p>
          <p className="text-gray-500 text-sm mt-1">Meals logged</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-blue-500 truncate">{mostCommon || '–'}</p>
          <p className="text-gray-500 text-sm mt-1">Most common</p>
        </div>
      </div>

      {/* Mood pie chart */}
      <h2 className="text-lg font-semibold mb-3">Mood Breakdown</h2>
      {moodData.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No mood data yet this week</p>
      ) : (
        // 💡 HINT: ResponsiveContainer makes the chart fill its parent width automatically
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={moodData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {moodData.map((entry) => (
                <Cell key={entry.name} fill={MOOD_COLORS[entry.name] || '#ccc'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}