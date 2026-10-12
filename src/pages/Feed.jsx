import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_SIZE, fetchFeed, logEvent, logViews } from '../services/cards'
import { fetchSaved, saveCard } from '../services/palace'
import KnowledgeCard from '../components/KnowledgeCard'
import PlaceSheet from '../components/PlaceSheet'
import CardDetail from '../components/CardDetail'
import { useStreak } from '../hooks/useStreak'

// Keeps neighbouring cards from sharing a category where possible.
function spread(rows, prev) {
  const pool = [...rows], out = []
  while (pool.length) { let i = pool.findIndex((r) => r.category_id !== prev); if (i < 0) i = 0; const [r] = pool.splice(i, 1); out.push(r); prev = r.category_id }
  return out
}

export default function Feed({ categories, rooms, categoryId }) {
  const { touch } = useStreak()
  const lastCat = useRef(null)
  const viewed = useRef(0)
  const [cards, setCards] = useState([])
  const [saved, setSaved] = useState({}) // cardId -> roomId
  const [sheet, setSheet] = useState(null)
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState('loading') // loading | idle | done | error
  const [error, setError] = useState('')
  const offset = useRef(0)
  const busy = useRef(false)
  const finished = useRef(false)
  const seen = useRef(new Set())
  const sentinel = useRef(null)

  const load = useCallback(async () => {
    if (busy.current || finished.current) return
    busy.current = true
    try {
      const raw = await fetchFeed(offset.current, PAGE_SIZE, categoryId)
      offset.current += raw.length
      const rows = spread(raw, lastCat.current)
      if (rows.length) lastCat.current = rows[rows.length - 1].category_id
      setCards((prev) => {
        const have = new Set(prev.map((c) => c.id))
        return [...prev, ...rows.filter((r) => !have.has(r.id))]
      })
      if (raw.length < PAGE_SIZE) { finished.current = true; setStatus('done') } else setStatus('idle')
    } catch (e) { setError(e.message); setStatus('error') }
    busy.current = false
  }, [categoryId])

  useEffect(() => {
    load()
    fetchSaved().then((rows) => setSaved(Object.fromEntries(rows.map((r) => [r.card_id, r.room_id]))))
  }, [load])

  // Load the next page when the bottom marker scrolls into view.
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [load])

  // Views are sent in one batch when you leave the feed, so the order stays stable while you scroll.
  useEffect(() => {
    const flush = () => { const ids = [...seen.current]; seen.current.clear(); logViews(ids) }
    const onHide = () => document.visibilityState === 'hidden' && flush()
    document.addEventListener('visibilitychange', onHide)
    return () => { document.removeEventListener('visibilitychange', onHide); flush() }
  }, [])

  const onSeen = useCallback((id) => { seen.current.add(id); viewed.current += 1; if (viewed.current === 5) touch() }, [touch])
  const openCard = (c) => { setDetail(c); logEvent('card_opened', c.id) }
  const closeDetail = useCallback(() => setDetail(null), [])
  const catOf = (id) => categories.find((c) => c.id === id)
  const roomOf = (id) => rooms.find((r) => r.id === id)

  async function pick(room, emoji) {
    const card = sheet
    setSheet(null)
    try {
      await saveCard(card.id, room.id, emoji)
      setSaved((s) => ({ ...s, [card.id]: room.id }))
      logEvent('card_saved', card.id, { room: room.name })
      touch()
      setToast(`Saved to ${room.name} ${room.icon}`)
    } catch (e) { setToast(e.message) }
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <main>
      {status === 'error' && <p className="note" role="alert">Could not load cards: {error}</p>}
      {status === 'done' && cards.length === 0 && <p className="sub">No published cards yet. In Supabase, run: update knowledge_cards set status = 'published' where status = 'draft';</p>}
      {cards.map((c) => (
        <KnowledgeCard key={c.id} card={c} category={catOf(c.category_id)} savedRoom={roomOf(saved[c.id])?.name}
          onSeen={onSeen} onSave={setSheet} onOpen={openCard} />
      ))}
      <div ref={sentinel} aria-hidden="true" style={{ height: 1 }} />
      {status === 'done' && cards.length > 0 && <p className="sub" style={{ textAlign: 'center' }}>You're all caught up.</p>}
      {detail && <CardDetail card={detail} category={catOf(detail.category_id)} savedRoom={roomOf(saved[detail.id])?.name} onSave={setSheet} onClose={closeDetail} />}
      {sheet && <PlaceSheet title="Save to your palace" subtitle={sheet.title} rooms={rooms} suggestedId={sheet.default_room_id} emoji={catOf(sheet.category_id)?.icon} onPick={pick} onClose={() => setSheet(null)} />}
      <div id="toast" className={toast ? 'on' : ''} role="status" aria-live="polite">{toast}</div>
    </main>
  )
}
