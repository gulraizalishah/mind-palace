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

// place = a piece of furniture ("Refrigerator") or a wall ("Left wall"); boxId = a storage box. Neither = the room's first container.
export async function saveCard(cardId, roomId, emoji = null, place = null, boxId = null) {
  const { data, error } = await supabase.rpc('save_card', { p_card: cardId, p_room: roomId, p_emoji: emoji, p_place: place, p_box: boxId })
  if (error) throw error
  return data
}

// Everything the palace needs: saved cards and your own memories, each with its sticker and place.
export async function fetchPalace() {
  const { data, error } = await supabase
    .from('saved_cards')
    .select('id,room_id,card_id,emoji,place,box_id,custom_title,custom_content,knowledge_cards(title,content,category_id)')
    .order('saved_at')
  if (error) throw error
  return data.map((r) => ({
    id: r.id, room_id: r.room_id, card_id: r.card_id, emoji: r.emoji, place: r.place, box_id: r.box_id, personal: !r.card_id,
    title: r.knowledge_cards?.title ?? r.custom_title,
    content: r.knowledge_cards?.content ?? r.custom_content,
    category_id: r.knowledge_cards?.category_id,
  }))
}

export async function addMemory({ title, content, roomId, emoji, place = null, boxId = null }) {
  const { error } = await supabase.rpc('add_memory', { p_title: title, p_content: content, p_room: roomId, p_emoji: emoji, p_place: place, p_box: boxId })
  if (error) throw error
}

export async function setSticker(savedId, emoji) {
  const { error } = await supabase.rpc('set_sticker', { p_saved: savedId, p_emoji: emoji })
  if (error) throw error
}

export async function moveSavedCard(savedId, roomId, place = null, boxId = null) {
  const { error } = await supabase.rpc('move_saved_card', { p_saved: savedId, p_room: roomId, p_place: place, p_box: boxId })
  if (error) throw error
}

// Move a memory to another piece of furniture, wall or box in the same room.
export async function setPlacement(savedId, place, boxId) {
  const { error } = await supabase.from('saved_cards').update({ place: boxId ? null : place, box_id: boxId || null }).eq('id', savedId)
  if (error) throw error
}

export async function fetchBoxes() {
  const { data, error } = await supabase.from('storage_boxes').select('id,room_id,name,icon').order('created_at')
  if (error) throw error
  return data
}
export async function createBox(roomId, name) {
  const { data, error } = await supabase.from('storage_boxes').insert({ room_id: roomId, name: name.trim() }).select('id,room_id,name,icon').single()
  if (error) throw error
  return data
}
export async function renameBox(id, name) {
  const { error } = await supabase.from('storage_boxes').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}
export async function deleteBox(id) {
  const { error } = await supabase.from('storage_boxes').delete().eq('id', id)
  if (error) throw error
}
