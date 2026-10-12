import { supabase } from './supabase'

export async function fetchRooms() {
  const { data, error } = await supabase
    .from('rooms').select('id,name,icon,floor,side,sort_order,theme')
    .order('floor').order('sort_order')
  if (error) throw error
  return data
}

export async function fetchSaved() {
  const { data, error } = await supabase.from('saved_cards').select('id,card_id,room_id')
  if (error) throw error
  return data
}

export async function saveCard(cardId, roomId, emoji = null) {
  const { data, error } = await supabase.rpc('save_card', { p_card: cardId, p_room: roomId, p_emoji: emoji })
  if (error) throw error
  return data
}

// Everything the palace needs: saved cards and your own memories, each with its sticker.
export async function fetchPalace() {
  const { data, error } = await supabase
    .from('saved_cards')
    .select('id,room_id,card_id,emoji,custom_title,custom_content,knowledge_cards(title,content,category_id)')
    .order('saved_at')
  if (error) throw error
  return data.map((r) => ({
    id: r.id, room_id: r.room_id, card_id: r.card_id, emoji: r.emoji, personal: !r.card_id,
    title: r.knowledge_cards?.title ?? r.custom_title,
    content: r.knowledge_cards?.content ?? r.custom_content,
    category_id: r.knowledge_cards?.category_id,
  }))
}

export async function addMemory({ title, content, roomId, emoji }) {
  const { error } = await supabase.rpc('add_memory', { p_title: title, p_content: content, p_room: roomId, p_emoji: emoji })
  if (error) throw error
}

export async function setSticker(savedId, emoji) {
  const { error } = await supabase.rpc('set_sticker', { p_saved: savedId, p_emoji: emoji })
  if (error) throw error
}

export async function moveSavedCard(savedId, roomId) {
  const { error } = await supabase.rpc('move_saved_card', { p_saved: savedId, p_room: roomId })
  if (error) throw error
}
