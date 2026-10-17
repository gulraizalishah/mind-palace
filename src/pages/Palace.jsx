import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { addMemory, fetchPalace, moveSavedCard, setSticker } from '../services/palace'
import { logEvent } from '../services/cards'
import { FLOOR_NAMES, exteriorRatio, exteriorSVG, hallSVG } from '../lib/houseSvg'
import { roomScene } from '../lib/roomScenes'
import { useStreak } from '../hooks/useStreak'
import PlaceSheet from '../components/PlaceSheet'
import MemoryForm from '../components/MemoryForm'
import StickerField from '../components/StickerField'
import Sticker from '../components/Sticker'

const bySort = (a, b) => a.sort_order - b.sort_order

// The 3D palace is loaded only when needed, so the rest of the app stays light.
const Scene3D = lazy(() => import('../three/Scene3D.jsx'))
const webglOK = () => {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))) } catch { return false }
}
const read3d = () => { try { return webglOK() && localStorage.getItem('mp-3d') !== '0' } catch { return webglOK() } }

// Sizes the picture to the biggest box of the right shape that fits the space left on screen.
function useFit(ratio, on = true) {
  const ref = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => { const w = Math.min(el.clientWidth, el.clientHeight * ratio); setBox({ w, h: w / ratio }) }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ratio, on])
  return [ref, box]
}

export default function Palace({ categories, rooms }) {
  const { touch } = useStreak()
  const [items, setItems] = useState([])
  const [view, setView] = useState({ t: 'out' })
  const [open, setOpen] = useState(null)
  const [moving, setMoving] = useState(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [listOpen, setListOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [mode3d, setMode3d] = useState(read3d)
  const canDo3d = webglOK()
  const toggle3d = () => { const n = !mode3d; setMode3d(n); try { localStorage.setItem('mp-3d', n ? '1' : '0') } catch { /* ignore */ } }

  const load = useCallback(() => fetchPalace().then(setItems).catch((e) => setError(e.message)), [])
  useEffect(() => { load(); logEvent('palace_opened') }, [load])

  const floors = useMemo(() => {
    const nums = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b)
    return nums.map((n) => ({
      n, name: FLOOR_NAMES[n] || `Floor ${n}`,
      L: rooms.filter((r) => r.floor === n && r.side !== 'right').sort(bySort),
      R: rooms.filter((r) => r.floor === n && r.side === 'right').sort(bySort),
    }))
  }, [rooms])
  const ordered = useMemo(() => floors.flatMap((f) => [...f.L, ...f.R]), [floors])
  const cnt = (id) => items.filter((i) => i.room_id === id).length
  const iconOf = (catId) => categories.find((c) => c.id === catId)?.icon ?? '📌'
  const stickerOf = (it) => it.emoji || (it.personal ? '📝' : iconOf(it.category_id))
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200) }
  const floorIdxOf = (roomId) => floors.findIndex((f) => [...f.L, ...f.R].some((r) => r.id === roomId))

  const ratio = view.t === 'out' ? exteriorRatio(Math.max(1, floors.length)) : view.t === 'hall' ? 360 / 480 : 360 / 300
  const [stageRef, box] = useFit(ratio, !mode3d)

  function go(token) {
    const [kind, val] = token.split(':')
    if (kind === 'out') setView({ t: 'out' })
    if (kind === 'hall') setView({ t: 'hall', f: +val })
    if (kind === 'room') { setView({ t: 'room', id: +val }); logEvent('room_opened', null, { room_id: +val }) }
  }

  function activate(el) {
    const token = el.dataset.go, ext = el.closest('.ext')
    if (ext) { // front door: open, zoom in, then walk inside
      ext.classList.add('open')
      setTimeout(() => ext.classList.add('zoom'), 400)
      setTimeout(() => go(token), 1050)
    } else if (el.classList.contains('door')) {
      el.classList.add('open')
      setTimeout(() => go(token), 650)
    } else go(token)
  }
  const onClick = (e) => { const el = e.target.closest('[data-go]'); if (el) activate(el) }
  const onKey = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('g[role=button]')) { e.preventDefault(); activate(e.target) }
  }

  async function move(room) {
    const target = moving
    setMoving(null); setOpen(null)
    try { await moveSavedCard(target.id, room.id); await load() } catch (err) { setError(err.message) }
  }
  async function saveMemory(m) {
    setAdding(false)
    try { await addMemory(m); touch(); await load(); flash(`Added to ${rooms.find((r) => r.id === m.roomId)?.name} ${m.emoji}`) } catch (e) { setError(e.message) }
  }
  async function saveSticker(emoji) {
    const it = editing; setEditing(null); setOpen(null)
    try { await setSticker(it.id, emoji); await load() } catch (e) { setError(e.message) }
  }

  let left = <span />, title = 'My Palace', content = null, foot = null

  if (!floors.length) {
    content = <p className="sub">No rooms found. Check the rooms table in Supabase.</p>
  } else if (view.t === 'out') {
    content = <div className="ext" dangerouslySetInnerHTML={{ __html: exteriorSVG(floors, cnt) }} />
    foot = <p className="cap">{items.length} saved. {mode3d ? 'Drag to look around. Tap the front door.' : 'Open the front door; lit windows hold your knowledge.'}</p>
  } else if (view.t === 'hall') {
    const f = floors[view.f], total = floors.length
    title = f.name
    left = <button className="pbtn" data-go={view.f ? `hall:${view.f - 1}` : 'out'}>{view.f ? '↓ Down' : '← Outside'}</button>
    content = <div className="hallv" dangerouslySetInnerHTML={{ __html: hallSVG(f, view.f, total, cnt) }} />
    foot = (<>
      {f.L.map((r) => <button key={r.id} className="chip" data-go={`room:${r.id}`}>← {r.name} · {cnt(r.id)}</button>)}
      {f.R.map((r) => <button key={r.id} className="chip" data-go={`room:${r.id}`}>{r.name} → · {cnt(r.id)}</button>)}
      {view.f < total - 1 && <button className="chip" data-go={`hall:${view.f + 1}`}>↑ Upstairs</button>}
    </>)
  } else {
    const room = rooms.find((r) => r.id === view.id), i = ordered.findIndex((r) => r.id === view.id)
    const mine = items.filter((x) => x.room_id === view.id), pr = ordered[i - 1], nx = ordered[i + 1]
    const scene = roomScene(room.name, room.theme)
    title = room.name
    left = <button className="pbtn" data-go={`hall:${Math.max(0, floorIdxOf(room.id))}`}>⌂ Hall</button>
    content = (
      <div className="scene" aria-label={`${room.name}, ${mine.length} saved`}>
        <div className="scene-art" dangerouslySetInnerHTML={{ __html: scene.svg }} />
        {mine.slice(0, scene.slots.length).map((it, k) => (
          <button key={it.id} className="slot" title={it.title} aria-label={it.title}
            style={{ left: `${(scene.slots[k][0] / 360) * 100}%`, top: `${(scene.slots[k][1] / 300) * 100}%`, animationDelay: `${k * 60}ms` }}
            onClick={() => { setOpen(it); logEvent('palace_item_opened', it.card_id) }}>
            <Sticker emoji={stickerOf(it)} size="5.6cqw" seed={it.id} />
          </button>
        ))}
        {!mine.length && <p className="scene-hint">Nothing here yet. Save a card and choose {room.name}.</p>}
      </div>
    )
    foot = (<>
      {pr ? <button className="pbtn" data-go={`room:${pr.id}`}>← {pr.name}</button> : <span />}
      <button className="pbtn" onClick={() => setListOpen(true)}>All items ({mine.length})</button>
      {nx ? <button className="pbtn" data-go={`room:${nx.id}`}>{nx.name} →</button> : <span />}
    </>)
  }

  const mineList = view.t === 'room' ? items.filter((x) => x.room_id === view.id) : []

  return (
    <main className="palace zin" onClick={onClick} onKeyDown={onKey}>
      {error && <p className="note" role="alert">{error}</p>}
      <div className="pbar">
        {left}
        <h1>{title}</h1>
        <div className="pright">
          {canDo3d && <button className="pbtn" onClick={toggle3d} aria-pressed={mode3d} aria-label={mode3d ? 'Switch to the flat 2D palace' : 'Switch to the 3D palace'}>{mode3d ? '2D' : '3D'}</button>}
          <button className="pbtn add" onClick={() => setAdding(true)} aria-label="Add a memory from your own mind" title="Add a memory">＋</button>
        </div>
      </div>
      {mode3d && floors.length > 0 ? (
        <div className="stage3d">
          <Suspense fallback={<p className="cap" style={{ padding: 20 }}>Building your palace…</p>}>
            <Scene3D view={view} floors={floors} rooms={rooms} items={items} cnt={cnt} stickerOf={stickerOf}
              onGo={go} onItem={(it) => { setOpen(it); logEvent('palace_item_opened', it.card_id) }} onFail={() => setMode3d(false)} />
          </Suspense>
        </div>
      ) : (
        <div className="stage" ref={stageRef}>
          {box.w > 0 && <div className="fitbox" style={{ width: box.w, height: box.h }}>{content}</div>}
        </div>
      )}
      <div className="pfoot">{foot}</div>

      {listOpen && (
        <div className="modal" onClick={() => setListOpen(false)}>
          <div className="card sheet" role="dialog" aria-label="All items in this room" onClick={(e) => e.stopPropagation()}>
            <h2>In this room</h2>
            {mineList.length === 0 && <p className="sub">Nothing saved here yet.</p>}
            <ul className="itemlist">
              {mineList.map((it) => (
                <li key={it.id}><button onClick={() => { setListOpen(false); setOpen(it); logEvent('palace_item_opened', it.card_id) }}>
                  <Sticker emoji={stickerOf(it)} size={18} seed={it.id} /><span>{it.title}</span></button></li>
              ))}
            </ul>
            <button className="ghost" onClick={() => setListOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {open && !moving && !editing && (
        <div className="modal" onClick={() => setOpen(null)}>
          <div className="card sheet" role="dialog" aria-label={open.title} onClick={(e) => e.stopPropagation()}>
            <Sticker emoji={stickerOf(open)} size={44} seed={open.id} />
            <h2 style={{ marginTop: 14 }}>{open.title}</h2>{open.content && <p>{open.content}</p>}
            <button className="btn" onClick={() => setOpen(null)}>Got it</button>{' '}
            <button className="ghost" style={{ marginTop: 0 }} onClick={() => setEditing(open)}>Change sticker</button>{' '}
            <button className="ghost" style={{ marginTop: 0 }} onClick={() => setMoving(open)}>Move room</button>
          </div>
        </div>
      )}
      {editing && <StickerEdit item={editing} start={stickerOf(editing)} onSave={saveSticker} onClose={() => setEditing(null)} />}
      {moving && <PlaceSheet title="Move to which room?" subtitle={moving.title} rooms={rooms} suggestedId={moving.room_id} tag="current" allowSticker={false} onPick={move} onClose={() => setMoving(null)} />}
      {adding && <MemoryForm rooms={rooms} defaultRoomId={view.t === 'room' ? view.id : (rooms.find((r) => r.name === 'Study') || rooms[0]).id} onSave={saveMemory} onClose={() => setAdding(false)} />}
      <div id="toast" className={toast ? 'on' : ''} role="status" aria-live="polite">{toast}</div>
    </main>
  )
}

function StickerEdit({ item, start, onSave, onClose }) {
  const [e, setE] = useState(start)
  return (
    <div className="modal" onClick={onClose}>
      <div className="card sheet" role="dialog" aria-label="Change sticker" onClick={(ev) => ev.stopPropagation()}>
        <h2>Change sticker</h2><p className="sub">{item.title}</p>
        <StickerField value={e} onChange={setE} />
        <button className="btn" onClick={() => onSave(e)}>Save sticker</button>{' '}
        <button className="ghost" style={{ marginTop: 0 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
