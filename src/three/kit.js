import * as THREE from 'three'
export { THREE }

// ---- shared geometry / material caches (many rooms reuse the same boxes) ----
const geos = new Map(), mats = new Map()
const geo = (k, make) => { if (!geos.has(k)) geos.set(k, make()); return geos.get(k) }
export const mat = (color, o = {}) => {
  const k = color + JSON.stringify(o)
  if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial({ color, ...o }))
  return mats.get(k)
}
export const glow = (color) => {
  const k = 'glow' + color
  if (!mats.has(k)) mats.set(k, new THREE.MeshBasicMaterial({ color }))
  return mats.get(k)
}
const asMat = (c) => (typeof c === 'string' ? mat(c) : c)

export function box(w, h, d, color, x = 0, y = 0, z = 0, p) {
  const m = new THREE.Mesh(geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), asMat(color))
  m.position.set(x, y, z); p?.add(m); return m
}
export function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, p, seg = 20) {
  const m = new THREE.Mesh(geo(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), asMat(color))
  m.position.set(x, y, z); p?.add(m); return m
}
export function sph(r, color, x = 0, y = 0, z = 0, p, seg = 16) {
  const m = new THREE.Mesh(geo(`s${r},${seg}`, () => new THREE.SphereGeometry(r, seg, seg)), asMat(color))
  m.position.set(x, y, z); p?.add(m); return m
}
export function plane(w, h, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, p) {
  const m = new THREE.Mesh(geo(`p${w},${h}`, () => new THREE.PlaneGeometry(w, h)), asMat(material))
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); p?.add(m); return m
}

// ---- canvas textures ----
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]) }
  return t
}
const tcache = new Map()
const cached = (k, make) => { if (!tcache.has(k)) tcache.set(k, make()); return tcache.get(k) }

export const checkerTex = (a, b, rx, ry) => cached(`ck${a}${b}${rx}${ry}`, () => canvasTex(128, 128, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 128, 128); g.fillStyle = b; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64)
}, [rx, ry]))
export const plankTex = (a, b, rx, ry) => cached(`pl${a}${b}${rx}${ry}`, () => canvasTex(256, 256, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, i * 32, 256, 32); g.strokeStyle = '#0004'; g.strokeRect(0, i * 32, 256, 32) }
}, [rx, ry]))
export const tileTex = (a, line, rx, ry) => cached(`tl${a}${line}${rx}${ry}`, () => canvasTex(128, 128, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 128, 128); g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128)
}, [rx, ry]))
export const brickTex = (rx, ry) => cached(`br${rx}${ry}`, () => canvasTex(128, 64, (g) => {
  g.fillStyle = '#8a6650'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#6f503d'; g.lineWidth = 2
  for (let r = 0; r < 4; r++) { const y = r * 16; g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); const o = r % 2 ? 0 : 32; for (let x = o; x < 128; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke() } }
}, [rx, ry]))
export const stripeTex = (c) => cached(`st${c}`, () => canvasTex(64, 8, (g) => {
  g.fillStyle = c; g.fillRect(0, 0, 64, 8); g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(30, 0, 4, 8)
}, [14, 1]))
export const gradTex = (top, bottom) => cached(`gr${top}${bottom}`, () => canvasTex(4, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, w, h)
}))
export const glowTex = () => cached('glowtex', () => canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,230,160,1)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64)
}))

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'
export const stickerTex = (emoji) => cached(`sk${emoji}`, () => canvasTex(128, 128, (g) => {
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.shadowOffsetY = 3
  g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 62, 50, 0, 7); g.fill()
  g.shadowColor = 'transparent'; g.font = `62px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(emoji, 64, 68)
}))
export const labelTex = (text, bg = '#b08d4f', fg = '#2c2415') => cached(`lb${text}${bg}`, () => canvasTex(320, 80, (g, w, h) => {
  g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 12); g.fill()
  g.fillStyle = fg; g.font = '600 38px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2)
}))

// A sticker floating in a room. Tilt is stable per item.
export function stickerSprite(emoji, seed = '') {
  let h = 0; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) | 0
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: stickerTex(emoji), rotation: (((Math.abs(h) % 13) - 6) * Math.PI) / 180, transparent: true }))
  s.scale.set(0.58, 0.58, 1)
  return s
}

// An invisible, generous tap target (small doors are hard to hit with a finger).
export function hitArea(w, h, x, y, z, ry, pick, p, picks) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }))
  m.position.set(x, y, z); m.rotation.y = ry; m.userData.pick = pick; p.add(m); picks.push(m); return m
}

const smats = new Map()
export const stickerMat = (emoji) => {
  if (!smats.has(emoji)) smats.set(emoji, new THREE.MeshBasicMaterial({ map: stickerTex(emoji), transparent: true }))
  return smats.get(emoji)
}
export const ringTex = () => cached('ring', () => canvasTex(64, 64, (g) => {
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.setLineDash([9, 7]); g.beginPath(); g.arc(32, 32, 24, 0, 7); g.stroke()
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(32, 32, 24, 0, 7); g.fill()
}))
export const hashOf = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) }

export const badgeTex = (n) => cached(`bd${n}`, () => canvasTex(64, 64, (g) => {
  g.fillStyle = '#23766f'; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.fill()
  g.lineWidth = 4; g.strokeStyle = '#fff'; g.stroke()
  g.fillStyle = '#fff'; g.font = 'bold 30px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n > 99 ? '99+' : n), 32, 34)
}))
export const invisible = () => cached('invisible-mat', () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
