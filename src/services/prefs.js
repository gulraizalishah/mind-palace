import { supabase } from './supabase'

export async function getMyPrefs(userId) {
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function saveTopics(userId, categoryIds, onboarded = true) {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, selected_categories: categoryIds, onboarded }, { onConflict: 'user_id' })
  if (error) throw error
}
