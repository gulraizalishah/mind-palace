import { useState } from 'react'
import StickerField from './StickerField'
import Sticker from './Sticker'
import DestinationPicker from './DestinationPicker'

// Choose a room, then where in it, then (optionally) a sticker. One button saves.
export default function PlaceSheet({ title, subtitle, rooms, suggestedId, emoji, allowSticker = true, confirmLabel = 'Save', items = [], boxes = [], onCreateBox, onPick, onClose }) {
  const [e, setE] = useState(emoji)
  const [roomId, setRoomId] = useState(suggestedId ?? rooms[0]?.id)
  const [dest, setDest] = useState({ place: null, boxId: null })
  const ordered = [...rooms].sort((a, b) => (b.id === suggestedId) - (a.id === suggestedId))
  const room = rooms.find((r) => r.id === roomId)

  return (
    <div className="modal" onClick={onClose}>
      <div className="card sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(ev) => ev.stopPropagation()}>
        <h2>{title}</h2>
        <p className="sub">{subtitle}</p>
        {allowSticker && (<>
          <h3 className="lbl">Sticker <Sticker emoji={e} size={20} seed={title} /></h3>
          <StickerField value={e} onChange={setE} />
        </>)}
        <h3 className="lbl">Room</h3>
        <div className="chips">
          {ordered.map((r) => (
            <button key={r.id} className="chip" aria-pressed={r.id === roomId} onClick={() => { setRoomId(r.id); setDest({ place: null, boxId: null }) }}>
              {r.icon} {r.name}{r.id === suggestedId ? ' (suggested)' : ''}
            </button>
          ))}
        </div>
        {room && (<>
          <h3 className="lbl">Where in the {room.name.toLowerCase()}?</h3>
          <DestinationPicker room={room} items={items} boxes={boxes} value={dest} onChange={setDest} onCreateBox={onCreateBox} />
        </>)}
        <button className="btn" disabled={!room} onClick={() => onPick(room, e, dest)}>{confirmLabel}</button>{' '}
        <button className="ghost" style={{ marginTop: 0 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
