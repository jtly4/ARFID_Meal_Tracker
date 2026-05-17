import { supabase } from '../supabase'
import { addSafeFood } from './safeFoods'

// 💡 HINT: All these functions are async — always use await when calling them in components
// Example in a component: const meals = await getMeals()

// ── CREATE ──────────────────────────────────────────────

export async function logMeal({ date, time, meal_type, food_name, notes, mood, is_safe_food }) {
  // 💡 HINT: .insert() adds a new row. Pass an object matching your table columns.
  const { data, error } = await supabase
    .from('meals')
    .insert({ date, time, meal_type, food_name, notes, mood, is_safe_food })

  if (error) console.error('Error logging meal:', error)
  if (is_safe_food) await addSafeFood(food_name)

  return data
}

export async function searchMeals(query) {
  const {data, error} = await supabase
    .from('meals')
    .select('*')
    .ilike('food_name', `%${query}%`)
  
  if (error) console.error('Search error:', error)
  return data || []
}

// ── READ ─────────────────────────────────────────────────
export async function getTodayMeals() {
  const today = new Date().toLocaleDateString('en-CA')
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('date', today)
    .order('time', { ascending: true })
 
  if (error) console.error('Error fetching today meals:', error)
  return data || []
}

export async function getRecentMeals(limit = 3) {
  // 💡 HINT: .limit() caps results. Returns the most recently logged meals for quick-fill.
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
 
  if (error) console.error('Error fetching recent meals:', error)

  const map = new Map()

  for (const meal of data || []) {
    const key = meal.food_name.trim().toLowerCase()
    if (!map.has(key)) map.set(key, meal)
  }

  return Array.from(map.values()).slice(0, limit)
}

export async function getMealsForDate(date) {
  // 💡 HINT: Used by History page to show meals for a selected day
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true })
 
  if (error) console.error('Error fetching meals for date:', error)
  return data || []
}


export async function getMeals() {
  // 💡 HINT: .order() sorts results. 'created_at' descending = newest first.
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('time', { ascending: true })

  if (error) console.error('Error fetching meals:', error)
  return data || []
}

export async function getMealsForWeek(startDate, endDate) {
  // 💡 HINT: .gte() = greater than or equal, .lte() = less than or equal
  // startDate and endDate should be strings like '2024-01-01'
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) console.error('Error fetching week meals:', error)
  return data || []
}

export async function getMealsForMonth(year, month) {
  // 💡 HINT: String formatting trick — padStart ensures month is always 2 digits (01, 02, etc.)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  const start = startDate.toLocaleDateString('en-CA')
  const end = endDate.toLocaleDateString('en-CA')

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('date', start)
    .lte('date', end)

  if (error) console.error('Error fetching month meals:', error)
  return data || []
}

// ── DELETE ────────────────────────────────────────────────

export async function deleteMeal(id) {
  // 💡 HINT: .eq() filters by a column value — here it finds the row where id matches
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting meal:', error)
}

// ── STATS HELPERS ─────────────────────────────────────────

export function getMostCommonMeal(meals) {
  // 💡 HINT: This is pure JS — no Supabase needed. Count occurrences with a reduce,
  // then find the key with the highest count.
  if (!meals.length) return null

  const counts = meals.reduce((acc, meal) => {
    acc[meal.food_name] = (acc[meal.food_name] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export function getMoodCounts(meals) {
  // 💡 HINT: Returns an array like [{ name: 'happy', value: 5 }, ...]
  // This is the format Recharts PieChart expects!
  const counts = meals.reduce((acc, meal) => {
    if (meal.mood) acc[meal.mood] = (acc[meal.mood] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export function formatMealTime(date, mealTime) {
    if (!date || !mealTime) return ''
    const timestamp = `${date}T${mealTime}`
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}