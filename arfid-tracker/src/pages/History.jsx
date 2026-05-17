import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getMealsForMonth, getMealsForDate, formatMealTime } from '../db/meals'

const DAYS    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

const MOOD_EMOJIS = {
  very_hard: '/very_hard.png', hard: '/hard.png', okay: '/ok.png', good: '/good.png', very_good: '/very_good.png'
}

export default function History() {
  const now   = new Date()
  const [year,       setYear]       = useState(now.getFullYear())
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [loggedDays, setLoggedDays] = useState(new Set())
  const [selected,   setSelected]   = useState(now.toLocaleDateString('en-CA'))
  const [dayMeals,   setDayMeals]   = useState([])

  const navigate = useNavigate()
  const location = useLocation()


  useEffect(() => { loadMonth() }, [year, month])
  useEffect(() => { if (selected) loadDayMeals(selected) }, [selected])
  useEffect(() => {
    if (selected) loadDayMeals(selected)
    loadMonth()
  }, [location.key])

  async function loadMonth() {
    const data = await getMealsForMonth(year, month)
    setLoggedDays(new Set(data.map(m => m.date)))
  }

  async function loadDayMeals(date) {
    const data = await getMealsForDate(date)
    setDayMeals(data)
  }

  function buildCalendarDays() {
    const firstDay    = new Date(year, month - 1, 1).getDay()
    const offset      = (firstDay + 6) % 7
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells       = Array(offset).fill(null)
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

  const cells     = buildCalendarDays()
  const today     = now.toLocaleDateString('en-CA')
  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  // Format selected date nicely
  const selectedLabel = selected
    ? new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <div className="px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">History</h1>
        <button className="text-gray-400 text-xl">📅</button>
      </div>

      {/* Month navigation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-gray-400 text-xl px-2">‹</button>
          <p className="font-semibold text-gray-700">{monthLabel}</p>
          <button onClick={nextMonth} className="text-gray-400 text-xl px-2">›</button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-gray-300 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const dateStr = toDateStr(day)
            const hasLog  = loggedDays.has(dateStr)
            const isToday = dateStr === today
            const isSel   = dateStr === selected

            return (
              <button
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium relative transition-all
                  ${isSel    ? 'bg-purple-600 text-white'         : ''}
                  ${!isSel && hasLog  ? 'bg-purple-50 text-purple-700'  : ''}
                  ${!isSel && !hasLog ? 'text-gray-400'                 : ''}
                  ${isToday && !isSel ? 'ring-2 ring-purple-400'        : ''}
                `}
              >
                {day}
                {/* Dot indicator for logged days */}
                {hasLog && !isSel && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day meal list */}
      {selected && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">{selectedLabel}</p>

          {dayMeals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-400 text-sm">
              No meals logged this day
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {dayMeals.map(meal => (
                <button key={meal.id} 
                onClick={() => navigate('/log', { state: { editId: meal.id } })}
                className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{MEAL_ICONS[meal.meal_type] || '🍽'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm">{meal.food_name}</p>
                        {meal.is_safe_food && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Safe Food</span>
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
          )}
        </div>
      )}
    </div>
  )
}