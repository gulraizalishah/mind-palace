import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Stage } from './core'
import { buildExterior, buildHall } from './house'
import { buildRoom } from './rooms'
import { resolveQuality } from '../lib/quality'

// The 3D palace. Draws whichever view is chosen (outside, a hall, or a room) and reports taps.
// view: {t:'out'} | {t:'hall', f} | {t:'room', id}
const Scene3D = forwardRef(function Scene3D({ view, floors, rooms, items, boxes, stickerOf, cnt, onGo, onItem, onPlace, onBox, onFail }, ref) {
  const host = useRef(null), fade = useRef(null), stage = useRef(null), lastKey = useRef(''), entering = useRef(false), safety = useRef(0)
  const cb = useRef({}); cb.current = { onGo, onItem, onPlace, onBox }

  useImperativeHandle(ref, () => ({ look: (dir) => stage.current?.lookTo(-dir * 0.9, dir === 0 ? 0 : 0.04) }))

  const setFade = (to, ms) => {
    const o = fade.current; if (!o) return
    o.style.transition = `opacity ${ms}ms ease`; o.style.opacity = String(to)
    clearTimeout(safety.current)
    if (to === 1) safety.current = setTimeout(() => setFade(0, 300), 3500) // never leave the screen dark
  }

  useEffect(() => {
    let st
    try {
      st = new Stage(host.current, (pick) => {
        if (pick.type === 'item') return cb.current.onItem(pick.item)
        if (pick.type === 'place') return cb.current.onPlace(pick.name)
        if (pick.type === 'box') return cb.current.onBox(pick.id)
        st.transition(pick, () => { entering.current = true; cb.current.onGo(pick.token) })
      }, setFade, resolveQuality())
    } catch (e) { onFail?.(e); return }
    stage.current = st
    if (import.meta.env.DEV) window.__st = st
    return () => { clearTimeout(safety.current); st.dispose(); stage.current = null; lastKey.current = '' }
  }, [])

  useEffect(() => {
    const st = stage.current
    if (!st) return
    const shed = rooms.find((r) => r.side === 'garden'), garden = rooms.find((r) => r.name === 'Garden')
    const dataFor = (room) => ({ items: items.filter((i) => i.room_id === room.id).map((i) => ({ item: i, emoji: stickerOf(i) })), boxes: (boxes || []).filter((b) => b.room_id === room.id) })
    const roomPicture = (room) => { const rv = buildRoom(room, dataFor(room), { shedId: shed?.id }); return st.preview(rv.group, rv.cam, 0.46) }
    let v
    if (view.t === 'out') {
      v = buildExterior(floors, cnt, () => { const hv = buildHall(floors[0], 0, floors.length, cnt, null); return st.preview(hv.group, hv.previewCam, 0.46) }, { gardenId: garden?.id, shedId: shed?.id })
    } else if (view.t === 'hall') {
      v = buildHall(floors[view.f], view.f, floors.length, cnt, roomPicture)
    } else {
      const room = rooms.find((r) => r.id === view.id)
      if (!room) return
      v = buildRoom(room, dataFor(room), { shedId: shed?.id })
    }
    const key = view.t + (view.f ?? view.id ?? '')
    st.show(v, key === lastKey.current)
    lastKey.current = key
    const o = fade.current
    if (o) { o.style.transition = 'none'; o.style.opacity = '1' }
    requestAnimationFrame(() => setFade(0, 500))
    if (entering.current) { entering.current = false; st.walkIn(0.9, 650) }
  }, [view, floors, rooms, items, boxes])

  return (
    <div className="three-wrap">
      <div className="three-host" ref={host} data-noswipe="" role="img" aria-label="3D view of your palace. Use the buttons below the picture to move around." />
      <div className="three-fade" ref={fade} aria-hidden="true" />
    </div>
  )
})
export default Scene3D
