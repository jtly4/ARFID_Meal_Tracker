import { useState, useEffect } from 'react'
import { getMealsForMonth } from '../db/meals'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // JS months are 0-indexed!
  const [loggedDays, setLoggedDays] = useState(new Set())
  const [selected, setSelected]     = useState(null) // selected day's date string

  useEffect(() => {
    loadMonth()
  }, [year, month]) // 💡 HINT: Re-runs whenever year or month changes

  async function loadMonth() {
    const data = await getMealsForMonth(year, month)
    // 💡 HINT: Extract just the unique dates into a Set for O(1) lookup
    const days = new Set(data.map(m => m.date))
    setLoggedDays(days)
  }

  // Build the grid of days for this month
  function buildCalendarDays() {
    const firstDay = new Date(year, month - 1, 1).getDay() // 0 = Sunday
    const offset = (firstDay + 6) % 7 // shift so Monday = 0
    const daysInMonth = new Date(year, month, 0).getDate()

    // 💡 HINT: Fill empty slots at the start with nulls so the grid lines up correctly
    const cells = Array(offset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }

  function toDateStr(day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const cells = buildCalendarDays()
  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-xl px-2">‹</button>
        <h1 className="text-xl font-bold">{monthLabel}</h1>
        <button onClick={nextMonth} className="text-xl px-2">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      {/* 💡 HINT: Person A — you can add a green dot or background to days that have logs.
          Check: loggedDays.has(toDateStr(day)) */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const dateStr = toDateStr(day)
          const hasLog  = loggedDays.has(dateStr)
          const isToday = dateStr === now.toISOString().split('T')[0]

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(dateStr === selected ? null : dateStr)}
              className={`
                aspect-square flex items-center justify-center rounded-full text-sm font-medium relative
                ${hasLog    ? 'bg-green-100 text-green-800' : 'text-gray-600'}
                ${isToday   ? 'ring-2 ring-green-400' : ''}
                ${selected === dateStr ? 'bg-green-500 text-white' : ''}
              `}
            >
              {day}
              {hasLog && selected !== dateStr && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {/* 💡 HINT: Stretch goal — fetch and show the meals for the selected day here */}
      {selected && (
        <div className="mt-6 p-4 bg-white border rounded-xl">
          <p className="font-semibold text-gray-700">{selected}</p>
          {loggedDays.has(selected)
            ? <p className="text-green-600 text-sm mt-1">✅ Meals were logged this day</p>
            : <p className="text-gray-400 text-sm mt-1">No meals logged this day</p>
          }
        </div>
      )}
    </div>
  )
}