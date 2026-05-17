import { supabase } from '../supabase'
import { addSafeFood } from './safeFoods'

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
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true })
 
  if (error) console.error('Error fetching meals for date:', error)
  return data || []
}


export async function getMeals() {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .order('time', { ascending: true })

  if (error) console.error('Error fetching meals:', error)
  return data || []
}

export async function getMealsForWeek(startDate, endDate) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) console.error('Error fetching week meals:', error)
  return data || []
}

export async function getMealsForMonth(year, month) {
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

export async function getMealById(id) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single()
  if (error) console.error('Error fetching meal: ', error)
  return data
}

export async function updateMeal(id, updates){
  const { error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', id)
  if (error) console.error('Error updating meal: ', error)
}

export async function deleteMeal(id) {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting meal:', error)
}

export function getMostCommonMeal(meals) {
  if (!meals.length) return null

  const counts = meals.reduce((acc, meal) => {
    acc[meal.food_name] = (acc[meal.food_name] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export function getMoodCounts(meals) {
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