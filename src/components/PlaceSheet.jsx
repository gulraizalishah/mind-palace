import { useState } from 'react'
import StickerField from './StickerField'
import Sticker from './Sticker'

// Pick a sticker (optional) and a room. Tapping a room confirms.
export default function PlaceSheet({ title, subtitle, rooms, suggestedId, tag = 'suggested', emoji, allowSticker = true, onPick, onClose }) {
  const [e, setE] = useState(emoji)
  const ordered = [...rooms].sort((a, b) => (b.id === suggestedId) - (a.id === suggestedId))
  return (
    <div className="modal" onClick={onClose}>
      <div className="card sheet" role="dialog" aria-label={title} onClick={(ev) => ev.stopPropagation()}>
        <h2>{title}</h2>
        <p className="sub">{subtitle}</p>
        {allowSticker && (<>
          <h3 className="lbl">Pick a sticker to help you remember <Sticker emoji={e} size={20} seed={title} /></h3>
          <StickerField value={e} onChange={setE} />
        </>)}
        <h3 className="lbl">Room</h3>
        <div className="chips">
          {ordered.map((r) => (
            <button key={r.id} className="chip" aria-pressed={r.id === suggestedId} onClick={() => onPick(r, e)}>
              {r.icon} {r.name}{r.id === suggestedId ? ` (${tag})` : ''}
            </button>
          ))}
        </div>
        <button className="ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
