import { THREE } from './kit'

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// Owns the WebGL canvas: drawing on demand, look-around / orbit drag, tap picking and smooth camera flights.
export class Stage {
  constructor(host, onPick, onFade) {
    this.host = host; this.onPick = onPick; this.onFade = onFade
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }))
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    r.outputColorSpace = THREE.SRGBColorSpace
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'
    host.appendChild(r.domElement)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.05, 200)
    this.ray = new THREE.Raycaster()
    this.picks = []; this.tweens = []; this.timers = []; this.cam = null; this.free = false; this.dirty = true
    this.da = 0; this.dp = 0; this.az = 0; this.el = 0
    this.rtsCur = []; this.rtsNext = []
    this.bindEvents()
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host); this.resize()
    this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop)
  }

  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1, a = w / h
    this.renderer.setSize(w, h, false)
    this.camera.aspect = a
    const hfov = ((this.cam?.hfov ?? 68) * Math.PI) / 180
    this.camera.fov = Math.min(98, Math.max(48, (2 * Math.atan(Math.tan(hfov / 2) / a) * 180) / Math.PI))
    this.camera.updateProjectionMatrix(); this.applyCamera(); this.dirty = true
  }

  show(view, keepLook = false) {
    if (this.group) this.scene.remove(this.group)
    this.group = view.group; this.scene.add(view.group)
    this.scene.background = view.bg || null
    this.picks = view.picks || []; this.cam = view.cam
    this.rtsCur.forEach((rt) => rt.dispose()); this.rtsCur = this.rtsNext; this.rtsNext = []
    if (!keepLook) { this.da = 0; this.dp = 0; this.az = view.cam.az ?? 0; this.el = view.cam.el ?? 0.2 }
    this.free = false; this.tweens = []
    this.resize()
    if (view.cam.mode === 'look') {
      const [px, py, pz] = view.cam.pos, [tx, ty, tz] = view.cam.target
      this.a0 = Math.atan2(-(tx - px), -(tz - pz)); this.p0 = Math.atan2(ty - py, Math.hypot(tx - px, tz - pz))
    }
    this.applyCamera(); this.dirty = true
  }

  applyCamera() {
    const c = this.cam
    if (!c || this.free) return
    if (c.mode === 'look') {
      const a = this.a0 + this.da, p = this.p0 + this.dp
      this.camera.position.set(...c.pos)
      this.camera.lookAt(c.pos[0] - Math.sin(a) * Math.cos(p), c.pos[1] + Math.sin(p), c.pos[2] - Math.cos(a) * Math.cos(p))
    } else {
      const [tx, ty, tz] = c.target, r = c.r, az = this.az, el = this.el
      this.camera.position.set(tx + r * Math.sin(az) * Math.cos(el), ty + r * Math.sin(el), tz + r * Math.cos(az) * Math.cos(el))
      this.camera.lookAt(tx, ty, tz)
    }
  }

  tween(ms, fn, done) { this.tweens.push({ t0: performance.now(), ms, fn, done }); this.dirty = true }
  later(ms, fn) { this.timers.push(setTimeout(fn, ms)) }

  // Fly the camera to a spot. Position and turn are blended together, so there is no sudden swing.
  flyTo(pos, target, ms, done) {
    const p0 = this.camera.position.clone(), q0 = this.camera.quaternion.clone(), p1 = new THREE.Vector3(...pos)
    const q1 = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(p1, new THREE.Vector3(...target), new THREE.Vector3(0, 1, 0)))
    this.free = true
    this.tween(ms, (k) => { const e = ease(k); this.camera.position.lerpVectors(p0, p1, e); this.camera.quaternion.slerpQuaternions(q0, q1, e) }, done)
  }

  // Walk through a door or up a stair: open it, fly to it, fade to dark, then call done to change the view.
  transition(pick, done) {
    const ms = pick.ms || 1000
    this.free = true
    if (pick.pivot) this.tween(550, (k) => { pick.pivot.rotation.y = pick.angle * ease(k) })
    this.flyTo(pick.fly.pos, pick.fly.target, ms)
    this.later(ms - 330, () => this.onFade?.(1, 330))
    this.later(ms + 30, done)
  }

  // After the view changes: start a step back and ease forward.
  walkIn(dist = 0.9, ms = 600) {
    const f = new THREE.Vector3(); this.camera.getWorldDirection(f)
    const p1 = this.camera.position.clone(), flat = f.clone().setY(0).normalize(), p0 = p1.clone().addScaledVector(flat, -dist)
    this.free = true
    this.tween(ms, (k) => this.camera.position.lerpVectors(p0, p1, ease(k)), () => { this.free = false; this.applyCamera() })
  }

  // Turn the view to the left (+) or right (-) wall, or back to the middle.
  lookTo(da, dp, ms = 550) {
    if (this.cam?.mode !== 'look' || this.free) return
    const a0 = this.da, p0 = this.dp
    this.tween(ms, (k) => { const e = ease(k); this.da = a0 + (da - a0) * e; this.dp = p0 + (dp - p0) * e; this.applyCamera() })
  }

  // Draw a view into a texture. Used for the picture you see through a door as it opens.
  preview(group, cam, aspect = 0.46) {
    const w = 220, h = Math.round(w / aspect), rt = new THREE.WebGLRenderTarget(w, h)
    const sc = new THREE.Scene(); sc.background = new THREE.Color('#1a1410'); sc.add(group)
    const pc = new THREE.PerspectiveCamera(60, aspect, 0.05, 100); pc.position.set(...cam.pos); pc.lookAt(...cam.target)
    const prev = this.renderer.getRenderTarget()
    this.renderer.setRenderTarget(rt); this.renderer.render(sc, pc); this.renderer.setRenderTarget(prev)
    sc.remove(group); this.rtsNext.push(rt)
    return rt.texture
  }

  bindEvents() {
    const el = this.renderer.domElement
    let down = null
    el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); down = { lx: e.clientX, ly: e.clientY, t: performance.now(), moved: 0 } })
    el.addEventListener('pointermove', (e) => {
      if (!down || this.free || !this.cam) return
      const dx = e.clientX - down.lx, dy = e.clientY - down.ly
      down.lx = e.clientX; down.ly = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy)
      const c = this.cam
      if (c.mode === 'look') {
        this.da = Math.max(-c.yaw, Math.min(c.yaw, this.da + dx * 0.0045))
        this.dp = Math.max(-c.pitch, Math.min(c.pitch, this.dp + dy * 0.0035))
      } else {
        this.az = Math.max(c.azMin, Math.min(c.azMax, this.az - dx * 0.006))
        this.el = Math.max(c.elMin, Math.min(c.elMax, this.el + dy * 0.004))
      }
      this.applyCamera(); this.dirty = true
    })
    el.addEventListener('pointerup', (e) => {
      if (down && down.moved < 8 && performance.now() - down.t < 600) this.pick(e)
      down = null
    })
    el.addEventListener('pointercancel', () => { down = null })
    el.addEventListener('wheel', (e) => {
      const c = this.cam
      if (c?.mode === 'orbit' && !this.free) { c.r = Math.max(c.rMin, Math.min(c.rMax, c.r + e.deltaY * 0.01)); this.applyCamera(); this.dirty = true; e.preventDefault() }
    }, { passive: false })
  }

  pick(e) {
    if (this.free) return
    const r = this.renderer.domElement.getBoundingClientRect()
    this.ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera)
    const hit = this.ray.intersectObjects(this.picks, false)[0]
    if (hit?.object.userData.pick) this.onPick(hit.object.userData.pick, hit.object)
  }

  loop(now) {
    this.raf = requestAnimationFrame(this.loop)
    if (document.hidden) return
    if (this.tweens.length) {
      const finished = []
      this.tweens = this.tweens.filter((tw) => {
        const k = Math.min(1, (now - tw.t0) / tw.ms)
        tw.fn(k)
        if (k >= 1) { finished.push(tw.done); return false }
        return true
      })
      finished.forEach((f) => f?.())
      this.dirty = true
    }
    if (this.dirty) { this.dirty = false; this.renderer.render(this.scene, this.camera) }
  }

  dispose() {
    cancelAnimationFrame(this.raf); this.ro.disconnect(); this.timers.forEach(clearTimeout)
    this.rtsCur.concat(this.rtsNext).forEach((rt) => rt.dispose())
    this.renderer.dispose(); this.renderer.forceContextLoss?.()
    this.renderer.domElement.remove()
  }
}
