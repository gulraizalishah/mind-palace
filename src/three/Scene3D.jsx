import { useEffect, useRef } from 'react'
import { Stage } from './core'
import { buildExterior, buildHall } from './house'
import { buildRoom } from './rooms'

// The 3D palace. Draws whichever view is chosen (outside, a hall, or a room) and reports taps.
// view: {t:'out'} | {t:'hall', f} | {t:'room', id}
export default function Scene3D({ view, floors, rooms, items, stickerOf, cnt, onGo, onItem, onFail }) {
  const host = useRef(null), stage = useRef(null), lastKey = useRef('')
  const cb = useRef({}); cb.current = { onGo, onItem }

  useEffect(() => {
    let st
    try {
      st = new Stage(host.current, (pick) => {
        if (pick.type === 'item') return cb.current.onItem(pick.item)
        const go = () => cb.current.onGo(pick.token)
        const fly = () => st.flyTo(pick.fly.pos, pick.fly.target, 600, go)
        if (pick.pivot) { // a door: swing it open, then walk through
          const a = pick.angle
          st.free = true
          st.tween(380, (k) => { pick.pivot.rotation.y = a * k }, fly)
        } else fly()
      })
    } catch (e) { onFail?.(e); return }
    stage.current = st
    if (import.meta.env.DEV) window.__st = st
    return () => { st.dispose(); stage.current = null; lastKey.current = '' }
  }, [])

  useEffect(() => {
    const st = stage.current
    if (!st) return
    let v
    if (view.t === 'out') v = buildExterior(floors, cnt)
    else if (view.t === 'hall') v = buildHall(floors[view.f], view.f, floors.length, cnt)
    else {
      const room = rooms.find((r) => r.id === view.id)
      v = buildRoom(room, items.filter((i) => i.room_id === view.id).map((i) => ({ item: i, emoji: stickerOf(i) })))
    }
    const key = view.t + (view.f ?? view.id ?? '')
    st.show(v, key === lastKey.current)
    lastKey.current = key
  }, [view, floors, rooms, items])

  return <div className="three-host" ref={host} data-noswipe="" role="img" aria-label="3D view of your palace. Use the buttons below the picture to move around." />
}
