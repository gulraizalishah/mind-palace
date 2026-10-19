import { useEffect, useRef } from 'react'
import { Stage } from './core'
import { buildExterior, buildHall } from './house'
import { buildRoom } from './rooms'

// The 3D palace. Draws whichever view is chosen (outside, a hall, or a room) and reports taps and drags.
// view: {t:'out'} | {t:'hall', f} | {t:'room', id}
export default function Scene3D({ view, floors, rooms, items, stickerOf, cnt, onGo, onItem, onMove, onFail }) {
  const host = useRef(null), stage = useRef(null), lastKey = useRef(''), entering = useRef(false)
  const cb = useRef({}); cb.current = { onGo, onItem, onMove }

  useEffect(() => {
    let st
    try {
      st = new Stage(host.current, (pick) => {
        if (pick.type === 'item') return cb.current.onItem(pick.item)
        const go = () => { entering.current = true; cb.current.onGo(pick.token) }
        const fly = () => st.flyTo(pick.fly.pos, pick.fly.target, 600, go)
        if (pick.pivot) { // a door: swing it open (you see the room inside), then walk through
          st.free = true
          st.tween(450, (k) => { pick.pivot.rotation.y = pick.angle * k }, fly)
        } else fly()
      }, (item, spot) => cb.current.onMove?.(item, spot))
    } catch (e) { onFail?.(e); return }
    stage.current = st
    if (import.meta.env.DEV) window.__st = st
    return () => { st.dispose(); stage.current = null; lastKey.current = '' }
  }, [])

  useEffect(() => {
    const st = stage.current
    if (!st) return
    const shed = rooms.find((r) => r.side === 'garden')
    const roomItems = (room) => items.filter((i) => i.room_id === room.id).map((i) => ({ item: i, emoji: stickerOf(i) }))
    const roomPicture = (room) => { const rv = buildRoom(room, roomItems(room), { shedId: shed?.id }); return st.preview(rv.group, rv.cam, 0.46) }
    let v
    if (view.t === 'out') {
      v = buildExterior(floors, cnt, () => { const hv = buildHall(floors[0], 0, floors.length, cnt, null); return st.preview(hv.group, hv.previewCam, 0.46) })
    } else if (view.t === 'hall') {
      v = buildHall(floors[view.f], view.f, floors.length, cnt, roomPicture)
    } else {
      const room = rooms.find((r) => r.id === view.id)
      if (!room) return
      v = buildRoom(room, roomItems(room), { shedId: shed?.id })
    }
    const key = view.t + (view.f ?? view.id ?? '')
    st.show(v, key === lastKey.current)
    lastKey.current = key
    const el = host.current
    el.style.transition = 'none'; el.style.opacity = '0'
    requestAnimationFrame(() => { el.style.transition = 'opacity .45s'; el.style.opacity = '1' })
    if (entering.current) { entering.current = false; st.walkIn(2.4, 650) }
  }, [view, floors, rooms, items])

  return <div className="three-host" ref={host} data-noswipe="" role="img" aria-label="3D view of your palace. Use the buttons below the picture to move around." />
}
