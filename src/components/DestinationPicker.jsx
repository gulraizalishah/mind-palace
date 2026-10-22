import { useState } from 'react'
import { MAX_BOXES, WALL_CAP, LEFT_WALL, RIGHT_WALL, containersOf, layoutRoom } from '../lib/places'

// "Where in the room?": furniture, the two walls (hanging pictures), or a small storage box.
// value = { place, boxId }. Nothing chosen = the room's first container.
export default function DestinationPicker({ room, items, boxes, value, onChange, onCreateBox }) {
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const mine = boxes.filter((b) => b.room_id === room.id)
  const lay = layoutRoom(room.name, items.filter((i) => i.room_id === room.id), mine)
  const list = containersOf(room.name)
  const current = value.boxId ? null : value.place || list[0][0]
  const wallsFull = lay.left.length >= WALL_CAP && lay.right.length >= WALL_CAP

  async function create() {
    if (!name.trim()) return
    try { const b = await onCreateBox(room.id, name); setNaming(false); setName(''); setErr(''); onChange({ place: null, boxId: b.id }) } catch (e) { setErr(e.message) }
  }

  const chip = (key, label, pressed, onClick, disabled = false, title) => (
    <button key={key} type="button" className="chip" aria-pressed={pressed} disabled={disabled} title={title} onClick={onClick}>{label}</button>
  )
  return (
    <div>
      <div className="chips" role="group" aria-label={`Where in the ${room.name}`}>
        {list.map(([n, icon]) => chip(n, `${icon} ${n} · ${lay.by[n].length}`, current === n, () => onChange({ place: n, boxId: null })))}
        {[[LEFT_WALL, lay.left], [RIGHT_WALL, lay.right]].map(([n, l]) => {
          const full = l.length >= WALL_CAP && current !== n
          return chip(n, `🖼️ ${n} pictures · ${l.length}/${WALL_CAP}`, current === n, () => onChange({ place: n, boxId: null }), full, full ? 'This wall is full' : undefined)
        })}
        {mine.map((b) => chip(b.id, `📦 ${b.name} · ${lay.boxes[b.id].length}`, value.boxId === b.id, () => onChange({ place: null, boxId: b.id })))}
        {mine.length < MAX_BOXES && chip('new', '＋ New storage box', naming, () => setNaming(!naming))}
      </div>
      {wallsFull && <p className="src">Both walls are full. Make a storage box to keep adding.</p>}
      {naming && (
        <div className="newbox">
          <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="Name the box, e.g. Receipts" aria-label="Storage box name" />
          <button type="button" className="btn" onClick={create} disabled={!name.trim()}>Create box</button>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}
    </div>
  )
}
