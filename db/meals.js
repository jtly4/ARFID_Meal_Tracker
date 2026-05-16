import { supabase } from '../supabase'

// 💡 HINT: All these functions are async — always use await when calling them in components
// Example in a component: const meals = await getMeals()

// ── CREATE ──────────────────────────────────────────────

export async function logMeal({ date, meal_type, food_name, notes, mood }) {
  // 💡 HINT: .insert() adds a new row. Pass an object matching your table columns.
  const { data, error } = await supabase
    .from('meals')
    .insert({ date, meal_type, food_name, notes, mood })

  if (error) console.error('Error logging meal:', error)
  return data
}

// ── READ ─────────────────────────────────────────────────

export async function getMeals() {
  // 💡 HINT: .order() sorts results. 'created_at' descending = newest first.
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('created_at', { ascending: false })

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
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = `${year}-${String(month).padStart(2, '0')}-31`

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