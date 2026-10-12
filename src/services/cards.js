import { supabase } from './supabase'

export const PAGE_SIZE = 10
// New on every app launch, so the feed is a different mix each time.
export const SESSION_SEED = Math.random().toString(36).slice(2)

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories').select('id,name,icon,is_primary,default_room_id').order('id')
  if (error) throw error
  return data
}

// Ranking happens in the database (get_feed): your topics first, unseen first, newest first.
export async function fetchFeed(offset, limit = PAGE_SIZE, categoryId = null) {
  const { data, error } = await supabase.rpc('get_feed', { p_limit: limit, p_offset: offset, p_category: categoryId, p_seed: SESSION_SEED })
  if (error) throw error
  return data
}

export async function logViews(cardIds) {
  if (!cardIds.length) return
  await supabase.from('events').insert(cardIds.map((card_id) => ({ event: 'card_viewed', card_id })))
}

export function logEvent(event, cardId = null, meta = {}) {
  supabase.from('events').insert({ event, card_id: cardId, meta }).then(() => {})
}
