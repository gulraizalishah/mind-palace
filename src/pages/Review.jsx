import { useEffect, useMemo, useState } from 'react'
import { answerReview, fetchDue } from '../services/review'
import { logEvent } from '../services/cards'
import Sticker from '../components/Sticker'
import { useStreak } from '../hooks/useStreak'

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function Review() {
  const { touch } = useStreak()
  const [queue, setQueue] = useState(null)
  const [pick, setPick] = useState(null)
  const [shown, setShown] = useState(false)
  const [error, setError] = useState('')
  const cur = queue?.[0]
  const options = useMemo(() => (cur && !cur.is_personal ? shuffle([cur.correct_answer, ...cur.wrong_answers]) : []), [cur?.saved_id])

  useEffect(() => { fetchDue().then((q) => { setQueue(q); if (q.length) logEvent('review_started') }).catch((e) => setError(e.message)) }, [])

  async function choose(opt) {
    if (pick) return
    setPick(opt)
    const ok = opt === cur.correct_answer
    try { await answerReview(cur.saved_id, ok); touch(); logEvent(ok ? 'review_correct' : 'review_incorrect', cur.card_id) } catch (e) { setError(e.message) }
  }

  const next = () => { setPick(null); setShown(false); setQueue((q) => q.slice(1)) }

  if (error) return <main><p className="note" role="alert">{error}</p></main>
  if (!queue) return <main><p className="sub">Loading…</p></main>
  if (!cur) return <main><h1>Review</h1><p className="sub">Nothing is due right now. Save more cards, or come back later: your next memory will be ready soon.</p></main>

  async function selfGrade(ok) {
    try { await answerReview(cur.saved_id, ok); touch(); logEvent(ok ? 'review_correct' : 'review_incorrect', cur.card_id) } catch (e) { setError(e.message) }
    next()
  }

  if (cur.is_personal) {
    return (
      <main>
        <div className="badge">{queue.length} ready to review</div>
        <div className="card" style={{ marginTop: 12 }}>
          <Sticker emoji={cur.emoji || '📝'} size={48} seed={cur.saved_id} />
          <h2 style={{ marginTop: 16 }}>Do you remember: {cur.title}?</h2>
          {!shown && <><p>Try to recall it first, then check.</p><button className="btn" onClick={() => setShown(true)}>Show answer</button></>}
          {shown && <>
            <p>{cur.content || 'No details saved. Did you remember it?'}</p>
            <button className="btn" onClick={() => selfGrade(true)}>I remembered</button>{' '}
            <button className="ghost" style={{ marginTop: 0 }} onClick={() => selfGrade(false)}>I forgot</button>
          </>}
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="badge">{queue.length} ready to review</div>
      <h2 style={{ margin: '8px 0 16px', fontSize: 26 }}>{cur.question}</h2>
      {options.map((o) => {
        const cls = pick ? (o === cur.correct_answer ? 'ok' : o === pick ? 'no' : '') : ''
        return <button key={o} className={`opt ${cls}`} disabled={!!pick} onClick={() => choose(o)}>{pick && o === cur.correct_answer ? '✓ ' : pick && o === pick ? '✗ ' : ''}{o}</button>
      })}
      {pick && (
        <div className="card" style={{ marginTop: 14 }}>
          <b>{pick === cur.correct_answer ? 'Correct! 🎯' : 'Not quite.'}</b>
          <p style={{ margin: '6px 0 14px' }}>{cur.content}</p>
          <button className="btn" onClick={next}>Next</button>
        </div>
      )}
    </main>
  )
}
