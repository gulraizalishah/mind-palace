// Touch gestures, written as plain functions so they work on any screen without extra libraries.

// Swipe a bottom sheet down to close it. Works for every ".modal > .sheet" in the app:
// closing is done by clicking the dimmed backdrop, which each sheet already handles.
export function attachSheetSwipe(doc = document) {
  let sheet = null, modal = null, x0 = 0, y0 = 0, t0 = 0, dy = 0, locked = false, drag = false

  const start = (e) => {
    sheet = e.target.closest?.('.sheet') || null
    if (!sheet) return
    modal = sheet.parentElement
    const t = e.touches[0]
    x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); dy = 0; locked = false; drag = false
  }
  const move = (e) => {
    if (!sheet) return
    const t = e.touches[0], ddy = t.clientY - y0, ddx = t.clientX - x0
    if (!locked) {
      if (Math.abs(ddy) < 8 && Math.abs(ddx) < 8) return
      locked = true
      // Only a mostly vertical, downward pull from the top of the sheet counts. Otherwise let it scroll.
      drag = ddy > 0 && Math.abs(ddy) > Math.abs(ddx) && sheet.scrollTop <= 0
    }
    if (!drag) return
    if (e.cancelable) e.preventDefault()
    dy = Math.max(0, ddy)
    sheet.style.transition = 'none'
    sheet.style.transform = `translateY(${dy}px)`
    modal.style.background = `rgba(0,0,0,${0.47 * Math.max(0, 1 - dy / 420)})`
  }
  const end = () => {
    if (!sheet || !drag) { sheet = null; return }
    const s = sheet, m = modal, speed = dy / Math.max(1, Date.now() - t0)
    s.style.transition = 'transform .2s ease-out'
    if (dy > 110 || (dy > 40 && speed > 0.6)) {
      s.style.transform = 'translateY(100%)'
      m.style.transition = 'background .2s'
      m.style.background = 'transparent'
      setTimeout(() => m.click(), 190)
    } else {
      s.style.transform = ''
      m.style.background = ''
    }
    sheet = null; drag = false
  }
  const esc = (e) => {
    if (e.key !== 'Escape') return
    const all = doc.querySelectorAll('.modal')
    if (all.length) all[all.length - 1].click()
  }

  doc.addEventListener('touchstart', start, { passive: true })
  doc.addEventListener('touchmove', move, { passive: false })
  doc.addEventListener('touchend', end)
  doc.addEventListener('touchcancel', end)
  doc.addEventListener('keydown', esc)
  return () => {
    doc.removeEventListener('touchstart', start); doc.removeEventListener('touchmove', move)
    doc.removeEventListener('touchend', end); doc.removeEventListener('touchcancel', end)
    doc.removeEventListener('keydown', esc)
  }
}

// Swipe sideways to change tab. Finger moving right-to-left = next tab.
const NO_SWIPE = '.modal,input,textarea,select,.pfoot,.catbar,.gtabs,[data-noswipe]'
export function attachTabSwipe(el, onNext, onPrev) {
  let x0 = 0, y0 = 0, t0 = 0, ok = false
  const start = (e) => {
    ok = e.touches.length === 1 && !e.target.closest?.(NO_SWIPE)
    if (!ok) return
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now()
  }
  const end = (e) => {
    if (!ok) return
    ok = false
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0
    if (Date.now() - t0 > 700) return
    if (Math.abs(dx) < 70 || Math.abs(dx) < 1.8 * Math.abs(dy)) return
    dx < 0 ? onNext() : onPrev()
  }
  el.addEventListener('touchstart', start, { passive: true })
  el.addEventListener('touchend', end, { passive: true })
  return () => { el.removeEventListener('touchstart', start); el.removeEventListener('touchend', end) }
}
