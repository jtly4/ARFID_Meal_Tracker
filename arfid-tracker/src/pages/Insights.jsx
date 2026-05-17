import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getMealsForWeek, getMostCommonMeal, getMoodCounts } from '../db/meals'

const MOOD_COLORS = {
  very_hard: '#f87171',
  hard:      '#fb923c',
  okay:      '#facc15',
  good:      '#4ade80',
  very_good: '#34d399',
}

const MOOD_LABELS = {
  very_hard: 'Very hard',
  hard:      'Hard',
  okay:      'Okay',
  good:      'Good',
  very_good: 'Very good',
}

const TABS = ['Overview', 'Foods', 'Feelings', 'Trends']

function getWeekRange(offset = 0) {
  const now    = new Date()
  console.log('today:', now.toDateString(), 'getDay():', now.getDay())
  const day    = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 5) % 7) + offset * 7)

  // 💡 HINT: Build YYYY-MM-DD manually from local date parts — avoids UTC timezone shift
  const fmt = d => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  // const fmt = d => d.toISOString().split('en-CA')[0]
  return { start: fmt(monday), end: fmt(sunday) }
}

function weekLabel(offset = 0) {
  const { start, end } = getWeekRange(offset)
  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function Insights() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [tab,        setTab]        = useState('Overview')
  const [meals,      setMeals]      = useState([])
  const [lastWeek,   setLastWeek]   = useState([])
  const [mostCommon, setMostCommon] = useState(null)
  const [moodData,   setMoodData]   = useState([])

  useEffect(() => { loadStats(weekOffset) }, [weekOffset])

  async function loadStats(offset = 0) {
    const { start, end } = getWeekRange(weekOffset)

    // This week
    const data = await getMealsForWeek(start, end)
    setMeals(data)
    setMostCommon(getMostCommonMeal(data))
    setMoodData(getMoodCounts(data))

    // Last week for comparison
    const lastStart = new Date(start); lastStart.setDate(lastStart.getDate() - 7)
    const lastEnd   = new Date(end);   lastEnd.setDate(lastEnd.getDate() - 7)
    const fmt = d => d.toLocaleDateString('en-CA')
    const prev = await getMealsForWeek(fmt(lastStart), fmt(lastEnd))
    setLastWeek(prev)
  }

  const diff = meals.length - lastWeek.length

  return (
    <div className="px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
        <button className="text-gray-400 text-xl">ℹ</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${tab === t ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div>
          {/* Week label */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setWeekOffset(w => w - 1)} className="text-gray-400 text-xl px-2">‹</button>
            <span className="text-xs text-gray-500">{weekLabel(weekOffset)}</span>
            <button
              onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} // 💡 can't go into the future
              className={`text-xl px-2 ${weekOffset === 0 ? 'text-gray-200' : 'text-gray-400'}`}
            >›</button>
        </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Meals logged</p>
              <p className="text-3xl font-bold text-gray-800">{meals.length}</p>
              {diff > 0 && (
                <p className={`text-xs mt-1 font-medium ${diff > 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {diff > 0 ? `+${diff}` : diff} from last week
                </p>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Most common</p>
              <p className="text-base font-bold text-gray-800 leading-tight">{mostCommon || '–'}</p>
              {mostCommon && (
                <p className="text-xs text-gray-400 mt-1">
                  {meals.filter(m => m.food_name === mostCommon).length}x this week
                </p>
              )}
            </div>
          </div>

          {/* Mood pie chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Meal experience breakdown</p>
            {moodData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No mood data yet this week</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={moodData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                      {moodData.map(entry => (
                        <Cell key={entry.name} fill={MOOD_COLORS[entry.name] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, MOOD_LABELS[n] || n]} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex flex-col gap-1.5">
                  {moodData.map(entry => {
                    const pct = Math.round((entry.value / meals.length) * 100)
                    return (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: MOOD_COLORS[entry.name] }} />
                        <span className="text-gray-600">{MOOD_LABELS[entry.name]}</span>
                        <span className="text-gray-400 ml-auto">{entry.value} ({pct}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Encouragement card */}
          {meals.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-3xl">🏔</span>
              <div>
                <p className="font-semibold text-purple-800 text-sm">Keep it up!</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  {diff > 0
                    ? `You logged more meals than last week. Consistency is a big win.`
                    : `You showed up this week. That matters more than you know.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 💡 HINT: These tabs are placeholders — build them out if you have time! */}
      {tab === 'Foods' && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽</p>
          <p className="font-medium">Foods breakdown coming soon</p>
        </div>
      )}
      {tab === 'Feelings' && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💭</p>
          <p className="font-medium">Feelings over time coming soon</p>
        </div>
      )}
      {tab === 'Trends' && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📈</p>
          <p className="font-medium">Trends coming soon</p>
        </div>
      )}
    </div>
  )
}