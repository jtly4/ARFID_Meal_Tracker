import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
/* Example usage
// Log a meal
await supabase.from('meals').insert({
  date: new Date(),
  meal_type: 'lunch',
  food_name: 'mac and cheese',
  mood: 'happy'
})

// Fetch all meals
const { data } = await supabase.from('meals').select('*')

// Get meals this week (for stats)
const { data } = await supabase
  .from('meals')
  .select('*')
  .gte('date', startOfWeek)

*/