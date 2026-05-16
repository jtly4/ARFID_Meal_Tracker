import { supabase } from '../supabase'

export async function getSafeFoods() {
  const { data, error } = await supabase
    .from('safe_foods')
    .select('*')
    .order('food_name', { ascending: true })

  if (error) console.error('Error fetching safe foods:', error)
  return data || []
}

export async function addSafeFood(food_name) {
  // 💡 HINT: The table has UNIQUE on food_name, so duplicates will error.
  // You can check for this and show the user a friendly message.
  const { data, error } = await supabase
    .from('safe_foods')
    .insert({ food_name })

  if (error) console.error('Error adding safe food:', error)
  return data
}

export async function deleteSafeFood(id) {
  const { error } = await supabase
    .from('safe_foods')
    .delete()
    .eq('id', id)

  if (error) console.error('Error deleting safe food:', error)
}