import { useEffect, useRef } from 'react'
import { colorsFor } from '../lib/theme'
import SaveButton from './SaveButton'
import Sticker from './Sticker'

// Feed card: banner, title and a short preview. Tapping the card opens the full details.
export default function KnowledgeCard({ card, category, savedRoom, onSave, onOpen, onSeen }) {
  const ref = useRef(null)
  const [c1, c2] = colorsFor(category?.name)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { onSeen(card.id); io.disconnect() } }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [card.id, onSeen])

  return (
    <article className="card tap" ref={ref}>
      <div className="art" style={{ '--c1': c1, '--c2': c2 }}>
        {card.image_url && <img src={card.image_url} alt="" loading="lazy" />}
        <span className="pill">{category?.name}</span>
        {!card.image_url && <Sticker emoji={category?.icon} size={54} seed={card.id} />}
      </div>
      <h2><button className="stretch" onClick={() => onOpen(card)}>{card.title}</button></h2>
      <p className="excerpt">{card.content}</p>
      <span className="more" aria-hidden="true">Read more →</span>
      <SaveButton roomName={savedRoom} onClick={() => onSave(card)} />
    </article>
  )
}
