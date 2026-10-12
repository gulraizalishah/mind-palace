import { useEffect } from 'react'
import { colorsFor } from '../lib/theme'
import SaveButton from './SaveButton'
import Sticker from './Sticker'

// Everything about one card: image, full text, source, tags.
export default function CardDetail({ card, category, savedRoom, onSave, onClose }) {
  const [c1, c2] = colorsFor(category?.name)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" onClick={onClose}>
      <div className="card sheet detail" role="dialog" aria-modal="true" aria-label={card.title} onClick={(e) => e.stopPropagation()}>
        <div className="art tall" style={{ '--c1': c1, '--c2': c2 }}>
          {card.image_url && <img src={card.image_url} alt="" />}
          <span className="pill">{category?.name}</span>
          {!card.image_url && <Sticker emoji={category?.icon} size={64} seed={card.id} />}
          <button className="close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <h2>{card.title}</h2>
        <p className="full">{card.content}</p>
        {card.tags?.length > 0 && <p className="tags">{card.tags.map((t) => <span key={t}>#{t}</span>)}</p>}
        {card.source && (
          <p className="src">Source: {card.source_url ? <a href={card.source_url} target="_blank" rel="noreferrer">{card.source}</a> : card.source}</p>
        )}
        <SaveButton roomName={savedRoom} onClick={() => onSave(card)} />
      </div>
    </div>
  )
}
