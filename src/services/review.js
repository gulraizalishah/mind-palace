import { supabase } from './supabase'

export async function fetchDue(limit = 20) {
  const { data, error } = await supabase.from('due_reviews').select('*').limit(limit)
  if (error) throw error
  return data
}

export async function answerReview(savedId, correct) {
  const { data, error } = await supabase.rpc('answer_review', { p_saved: savedId, p_correct: correct })
  if (error) throw error
  return data
}

export async function lifeStats() {
  const { data, error } = await supabase.rpc('life_manual_stats')
  if (error) throw error
  return data?.[0] ?? { things_saved: 0, memories_retained: 0, times_recalled: 0 }
}
