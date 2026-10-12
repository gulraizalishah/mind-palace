import { supabase } from './supabase'

// The user's local calendar date, e.g. 2026-10-10 (not UTC).
export const localDate = () => new Date().toLocaleDateString('sv-SE')

export async function getStreak() {
  const { data, error } = await supabase.rpc('get_streak', { p_today: localDate() })
  if (error) throw error
  return data?.[0] ?? { current_streak: 0, longest_streak: 0, done_today: false }
}

export async function touchStreak() {
  const { data, error } = await supabase.rpc('touch_streak', { p_today: localDate() })
  if (error) throw error
  return data
}
