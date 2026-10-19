import { useState } from 'react'
import StickerField from './StickerField'
import PlacePicker from './PlacePicker'
import { placeStarts } from '../lib/places'

// Add something from your own mind to the palace.
export default function MemoryForm({ rooms, defaultRoomId, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emoji, setEmoji] = useState('💡')
  const [roomId, setRoomId] = useState(defaultRoomId)
  const [place, setPlace] = useState(null)
  const [busy, setBusy] = useState(false)
  const room = rooms.find((r) => r.id === roomId)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onSave({ title: title.trim(), content: content.trim(), roomId, emoji, spot: place === null ? null : placeStarts(room.name)[place] })
    setBusy(false)
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="card sheet" role="dialog" aria-label="Add a memory" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Add a memory</h2>
        <p className="sub">Something from your own mind. You will be quizzed on it later.</p>
        <label>What do you want to remember?
          <input required maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wi-Fi password for Mum's house" />
        </label>
        <label>Details or a hint (optional)
          <textarea rows={3} maxLength={1000} value={content} onChange={(e) => setContent(e.target.value)} placeholder="The answer, or a trick that makes it stick" />
        </label>
        <h3 className="lbl">Sticker</h3>
        <StickerField value={emoji} onChange={setEmoji} />
        <h3 className="lbl">Room</h3>
        <div className="chips">
          {rooms.map((r) => (
            <button type="button" key={r.id} className="chip" aria-pressed={r.id === roomId} onClick={() => { setRoomId(r.id); setPlace(null) }}>{r.icon} {r.name}</button>
          ))}
        </div>
        {room && (<><h3 className="lbl">Where in the {room.name.toLowerCase()}?</h3><PlacePicker roomName={room.name} value={place} onChange={setPlace} /></>)}
        <button className="btn" disabled={busy || !title.trim()}>Add to palace</button>{' '}
        <button type="button" className="ghost" style={{ marginTop: 0 }} onClick={onClose}>Cancel</button>
      </form>
    </div>
  )
}
