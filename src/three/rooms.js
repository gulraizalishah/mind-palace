import { THREE, box, cyl, sph, plane, mat, glow, checkerTex, plankTex, tileTex, stripeTex, gradTex, stickerSprite } from './kit'

// Room size in metres: x = width, z = depth, y = height. The camera stands by the open front.
const W = 7, D = 5.5, H = 3, HW = W / 2, HD = D / 2
const WOOD = '#8a6446', DARK = '#5b3d29', CREAM = '#f1ebdd', STEEL = '#b9c0c6'

function lights(g, color = 0xfff0d0, ambient = 1.25, y = H - 0.4) {
  g.add(new THREE.AmbientLight(0xffffff, ambient))
  const p = new THREE.PointLight(color, 0.45, 12); p.position.set(0, Math.min(y, 2.0), 0.3); g.add(p)
}

function shell(g, wall, floorMat, { stripe = false, ceil = '#d9d2c4' } = {}) {
  const wm = stripe ? new THREE.MeshLambertMaterial({ map: stripeTex(wall) }) : mat(wall)
  plane(W, H, wm, 0, H / 2, -HD, 0, 0, g)
  plane(D, H, wm, -HW, H / 2, 0, 0, Math.PI / 2, g)
  plane(D, H, wm, HW, H / 2, 0, 0, -Math.PI / 2, g)
  plane(W, D, floorMat, 0, 0, 0, -Math.PI / 2, 0, g)
  plane(W, D, mat(ceil), 0, H, 0, Math.PI / 2, 0, g)
  box(W, 0.14, 0.05, '#00000040', 0, 0.07, -HD + 0.03, g)
  box(0.05, 0.14, D, '#00000040', -HW + 0.03, 0.07, 0, g)
  box(0.05, 0.14, D, '#00000040', HW - 0.03, 0.07, 0, g)
  box(W, 0.1, 0.07, CREAM, 0, H - 0.05, -HD + 0.04, g)
}

function windowPane(g, x, y, z, w, h) {
  box(w + 0.14, h + 0.14, 0.05, CREAM, x, y, z, g)
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: gradTex('#7fa6c9', '#e8cfa3') }))
  m.position.set(x, y, z + 0.03); g.add(m)
  box(0.05, h, 0.06, CREAM, x, y, z + 0.04, g); box(w, 0.05, 0.06, CREAM, x, y, z + 0.04, g)
}

function rug(g, x, z, rx, rz, color) {
  const m = cyl(1, 1, 0.02, color, x, 0.011, z, g, 32); m.scale.set(rx, 1, rz)
}

const BOOKS = ['#7a3b3b', '#3f5f7a', '#5f7a4a', '#a8863f', '#5b4a6a', '#8a5a3a', '#3f6a68', '#9a6a5a']
// Rows of books on a shelf: one instanced mesh for the whole case.
function books(g, x, rows, z0, z1) {
  const spots = []
  rows.forEach((y) => { for (let z = z0, i = 0; z < z1 - 0.1; i++) { const t = 0.05 + ((i * 7) % 5) * 0.012; spots.push([y, z + t / 2, t, 0.26 + ((i * 5 + y * 7) % 6) * 0.03]); z += t + 0.012 } })
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff'), spots.length)
  const d = new THREE.Object3D(), c = new THREE.Color()
  spots.forEach(([y, z, t, h], i) => {
    d.position.set(x, y + h / 2, z); d.scale.set(0.26, h, t); d.updateMatrix(); im.setMatrixAt(i, d.matrix)
    im.setColorAt(i, c.set(BOOKS[(i * 3 + Math.round(y * 5)) % BOOKS.length]))
  })
  g.add(im)
}
function bookcase(g, side, rows, z0, z1, depth = 0.4) {
  const x = side * (HW - depth / 2 - 0.02)
  box(depth, 2.6, z1 - z0 + 0.2, DARK, x, 1.3, (z0 + z1) / 2, g)
  rows.forEach((y) => box(depth - 0.04, 0.05, z1 - z0 + 0.14, '#7a5a3e', x - side * 0.01, y - 0.02, (z0 + z1) / 2, g))
  box(0.04, 2.6, z1 - z0 + 0.14, '#3a281c', side * (HW - 0.02), 1.3, (z0 + z1) / 2, g)
  books(g, x - side * 0.02, rows, z0 + 0.04, z1 - 0.04)
}

// ---------------------------------------------------------------- rooms
const ROOMS = {
  Kitchen(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: checkerTex('#d8d3c8', '#b9b3a6', 4, 3) })); lights(g)
    box(0.95, 2.15, 0.8, '#d5dade', -2.8, 1.075, -2.35, g); box(0.92, 0.03, 0.02, '#8a9299', -2.8, 1.45, -1.94, g)
    box(0.05, 0.5, 0.05, '#8a9299', -2.4, 1.8, -1.92, g); box(0.05, 0.8, 0.05, '#8a9299', -2.4, 0.9, -1.92, g)
    box(5.2, 0.9, 0.7, '#a9835a', 0.7, 0.45, -2.4, g); box(5.3, 0.06, 0.78, '#e7e1d6', 0.7, 0.93, -2.38, g)
    ;[-1.6, -0.3, 0.9, 2.3].forEach((x) => box(0.02, 0.8, 0.02, '#7a5a3e', x, 0.45, -2.04, g))
    box(0.8, 0.9, 0.72, '#3b4046', 1.6, 0.45, -2.4, g); box(0.6, 0.4, 0.02, '#1f2327', 1.6, 0.5, -2.03, g); box(0.6, 0.03, 0.04, '#9aa2a8', 1.6, 0.78, -2.0, g)
    ;[[-0.2, -0.1], [0.2, -0.1], [-0.2, 0.15], [0.2, 0.15]].forEach(([dx, dz]) => cyl(0.11, 0.11, 0.02, '#14171a', 1.6 + dx, 0.97, -2.4 + dz, g))
    box(0.9, 0.45, 0.5, STEEL, 1.6, 1.95, -2.5, g); box(0.3, 0.9, 0.3, '#aab2b8', 1.6, 2.6, -2.6, g)
    box(0.8, 0.02, 0.45, '#8f979d', -0.6, 0.965, -2.4, g); cyl(0.025, 0.025, 0.3, '#8d959b', -0.6, 1.1, -2.6, g); box(0.04, 0.04, 0.2, '#8d959b', -0.6, 1.25, -2.5, g)
    windowPane(g, -0.6, 1.8, -HD + 0.03, 1.2, 0.9)
    box(1.8, 0.8, 0.4, '#a9835a', 2.7, 2.0, -2.55, g); box(0.02, 0.76, 0.02, '#7a5a3e', 2.7, 2.0, -2.34, g)
    cyl(0.7, 0.7, 0.05, WOOD, 0.3, 0.75, -0.5, g, 28); cyl(0.05, 0.08, 0.72, DARK, 0.3, 0.37, -0.5, g)
    ;[-0.7, 1.3].forEach((x) => { box(0.45, 0.05, 0.45, '#6a4a32', x, 0.45, -0.5, g); box(0.45, 0.5, 0.05, '#6a4a32', x, 0.72, x < 0 ? -0.72 : -0.28, g); box(0.05, 0.45, 0.05, DARK, x - 0.2, 0.22, -0.7, g); box(0.05, 0.45, 0.05, DARK, x + 0.2, 0.22, -0.3, g) })
    cyl(0.01, 0.01, 0.9, '#333', 0.3, 2.55, -0.5, g); cyl(0.12, 0.38, 0.3, '#d8b46a', 0.3, 2.0, -0.5, g, 24); sph(0.1, glow('#fff2c0'), 0.3, 1.95, -0.5, g)
    rug(g, 0.3, -0.5, 1.7, 1.3, '#8c5a4a')
    return [[-2.8, 1.6, -1.92], [-2.8, 1.05, -1.92], [-2.8, 0.5, -1.92], [-1.6, 1.22, -2.3], [0.3, 1.22, -2.3], [2.3, 1.22, -2.3], [3.0, 1.22, -2.3], [2.4, 2.0, -2.33], [3.0, 2.0, -2.33], [0.0, 1.1, -0.6], [0.7, 1.1, -0.4]]
  },

  Garage(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: tileTex('#8d9298', '#7b8086', 6, 4) })); lights(g, 0xf4f4ff, 0.8)
    box(3.8, 2.55, 0.08, '#d7dade', 0, 1.275, -2.7, g); for (let i = 1; i < 8; i++) box(3.82, 0.03, 0.09, '#b5babf', 0, i * 0.31, -2.66, g)
    box(4.0, 0.1, 0.12, '#8f959b', 0, 2.6, -2.68, g)
    const car = new THREE.Group(); car.position.set(0.1, 0, -1.3); car.scale.setScalar(0.9); g.add(car)
    box(2.4, 0.5, 1.05, '#6f89a6', 0, 0.55, 0, car); box(1.3, 0.5, 0.95, '#6f89a6', -0.1, 1.05, 0, car); box(1.2, 0.3, 0.97, '#cfe0ee', -0.1, 1.08, 0, car)
    box(0.04, 0.2, 0.2, glow('#f1e3b0'), 1.2, 0.62, 0.35, car); box(0.04, 0.2, 0.2, glow('#f1e3b0'), 1.2, 0.62, -0.35, car)
    ;[[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(([x, z]) => { const w = cyl(0.3, 0.3, 0.2, '#25282c', x, 0.3, z, car); w.rotation.x = Math.PI / 2; const h = cyl(0.14, 0.14, 0.22, '#9aa0a6', x, 0.3, z, car); h.rotation.x = Math.PI / 2 })
    box(0.8, 0.08, 2.4, '#7a5a3e', 3.0, 0.92, -0.8, g); box(0.7, 0.9, 0.1, '#5b4a3a', 3.0, 0.45, 0.3, g); box(0.7, 0.9, 0.1, '#5b4a3a', 3.0, 0.45, -1.9, g); box(0.5, 0.25, 2.0, '#8a6a4a', 3.05, 0.5, -0.8, g)
    box(0.05, 1.3, 2.4, '#c9b48a', 3.45, 1.95, -0.8, g); box(0.08, 0.06, 0.5, '#555', 3.4, 2.2, -1.5, g); box(0.08, 0.06, 0.7, '#6b6f75', 3.4, 1.9, -0.8, g); box(0.08, 0.06, 0.5, '#555', 3.4, 1.6, -0.2, g)
    ;[0.15, 0.4, 0.65].forEach((y) => cyl(0.38, 0.38, 0.23, '#2b2e33', -2.9, y, -1.8, g))
    box(0.5, 0.05, 1.8, '#7a5a3e', -3.2, 1.6, -1.2, g); box(0.4, 0.3, 0.5, '#c7a46b', -3.2, 1.78, -1.7, g); box(0.4, 0.3, 0.5, '#b98f5a', -3.2, 1.78, -0.9, g)
    return [[0.4, 1.9, -0.5], [1.2, 1.35, -0.1], [-1.1, 1.6, -2.62], [1.3, 1.6, -2.62], [3.0, 1.3, -1.4], [3.0, 1.3, -0.3], [3.38, 2.0, -1.4], [3.38, 2.0, -0.2], [-3.2, 2.15, -1.7], [-3.2, 2.15, -0.9], [-2.9, 1.1, -1.8], [-1.9, 0.9, -0.5]]
  },

  Study(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) }), { stripe: true }); lights(g, 0xffe9c8)
    bookcase(g, -1, [0.42, 0.95, 1.5, 2.05], -1.9, 0.9)
    box(2.1, 0.08, 0.9, '#7a5a3e', 0.5, 0.78, -2.15, g); box(0.07, 0.75, 0.8, DARK, -0.45, 0.4, -2.15, g); box(0.6, 0.7, 0.8, '#6b4a32', 1.2, 0.4, -2.15, g); box(0.5, 0.18, 0.02, '#5b3d29', 1.2, 0.55, -1.74, g)
    cyl(0.1, 0.12, 0.04, '#3b3b3b', -0.2, 0.84, -2.2, g); box(0.03, 0.4, 0.03, '#3b3b3b', -0.2, 1.04, -2.2, g); cyl(0.08, 0.2, 0.2, '#d8b46a', -0.2, 1.3, -2.15, g, 24)
    const lamp = new THREE.PointLight(0xffe9a8, 0.6, 5); lamp.position.set(-0.2, 1.2, -2.0); g.add(lamp)
    sph(0.2, '#5e8aa6', 1.1, 1.12, -2.15, g); cyl(0.02, 0.05, 0.12, '#3b3b3b', 1.1, 0.88, -2.15, g)
    box(0.9, 0.7, 0.05, DARK, 0.5, 1.9, -2.68, g); box(0.78, 0.58, 0.02, '#8c9e8a', 0.5, 1.9, -2.65, g); box(0.5, 0.2, 0.02, '#4b5b66', 0.4, 1.78, -2.64, g)
    windowPane(g, 2.4, 1.7, -HD + 0.03, 1.1, 1.2); box(0.25, 1.6, 0.1, '#7d6a8e', 1.7, 1.7, -2.65, g); box(0.25, 1.6, 0.1, '#7d6a8e', 3.1, 1.7, -2.65, g)
    box(0.5, 0.06, 0.5, '#4a3b58', 0.4, 0.5, -1.3, g); box(0.5, 0.55, 0.06, '#5a4a6a', 0.4, 0.8, -1.07, g); cyl(0.04, 0.04, 0.5, '#333', 0.4, 0.25, -1.3, g)
    rug(g, 0.6, -0.4, 1.9, 1.3, '#6a5a7e')
    return [[-2.8, 0.75, -1.35], [-2.8, 0.75, -0.45], [-2.8, 1.3, -1.35], [-2.8, 1.3, -0.45], [-2.8, 1.85, -1.35], [-2.8, 1.85, -0.45], [0.2, 1.2, -2.1], [1.5, 1.2, -2.0], [0.5, 2.5, -2.66], [2.4, 1.7, -2.62], [0.6, 0.9, -1.4]]
  },

  Office(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: plankTex('#9a7650', '#8a6646', 2, 2) })); lights(g, 0xf4f8ff, 0.9)
    box(2.2, 1.2, 0.05, '#9aa2a8', -2.0, 1.85, -2.7, g); box(2.06, 1.06, 0.03, '#f4f4f0', -2.0, 1.85, -2.67, g)
    ;[[2.3, 0.04], [1.7, 0.04], [1.0, 0.04]].forEach(([w, h], i) => box(w * 0.7, h, 0.02, ['#7a8aa0', '#c0463c', '#3f6a68'][i], -2.0, 2.15 - i * 0.28, -2.65, g))
    box(2.2, 0.06, 0.12, '#9aa2a8', -2.0, 1.22, -2.62, g)
    box(2.5, 0.08, 0.9, '#6f5a46', 1.2, 0.76, -2.15, g); box(0.7, 0.72, 0.8, '#5b4a3a', 2.1, 0.38, -2.15, g); box(0.07, 0.72, 0.8, '#5b4a3a', 0.05, 0.38, -2.15, g)
    box(1.0, 0.6, 0.05, '#2b3138', 1.2, 1.3, -2.35, g); box(0.92, 0.5, 0.02, glow('#6f93b3'), 1.2, 1.3, -2.32, g); box(0.1, 0.3, 0.08, '#2b3138', 1.2, 0.95, -2.35, g); box(0.6, 0.02, 0.2, '#cfd3d6', 1.2, 0.81, -1.9, g)
    box(0.7, 1.3, 0.6, '#8d979e', -0.45, 0.65, -2.4, g); [0.25, 0.65, 1.05].forEach((y) => { box(0.6, 0.01, 0.02, '#6b757c', -0.45, y + 0.2, -2.09, g); box(0.16, 0.03, 0.03, '#d8dde0', -0.45, y, -2.08, g) })
    cyl(0.18, 0.14, 0.4, '#a86f4a', 3.0, 0.2, -2.4, g); [[0, 0.7], [-0.15, 0.95], [0.15, 0.95]].forEach(([dx, y]) => sph(0.22, '#5f8a5a', 3.0 + dx, y, -2.4, g))
    const clk = cyl(0.3, 0.3, 0.05, '#f4f0e6', 1.2, 2.3, -2.7, g, 32); clk.rotation.x = Math.PI / 2; box(0.02, 0.2, 0.02, '#333', 1.2, 2.38, -2.66, g); box(0.15, 0.02, 0.02, '#333', 1.27, 2.3, -2.66, g)
    cyl(0.06, 0.06, 0.4, '#333', 1.2, 0.22, -1.2, g); box(0.55, 0.08, 0.5, '#3f4a55', 1.2, 0.5, -1.2, g); box(0.5, 0.6, 0.08, '#3f4a55', 1.2, 0.85, -0.95, g)
    rug(g, 1.0, -0.6, 1.9, 1.2, '#5b6a7a')
    return [[-2.4, 1.95, -2.62], [-1.6, 1.95, -2.62], [-2.0, 1.5, -2.62], [0.5, 1.15, -2.0], [1.9, 1.15, -2.0], [-0.45, 1.62, -2.4], [1.2, 1.95, -2.3], [3.0, 1.55, -2.4], [2.1, 1.1, -2.0], [-1.5, 0.9, -1.2]]
  },

  Library(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) }), { stripe: true }); lights(g, 0xffe3b8, 0.8)
    const rows = [0.4, 0.9, 1.4, 1.9]
    bookcase(g, -1, rows, -2.1, 1.6); bookcase(g, 1, rows, -2.1, 1.6)
    box(1.6, 2.3, 0.06, '#efe8da', 0, 1.5, -2.7, g)
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshBasicMaterial({ map: gradTex('#7fa6c9', '#e8cfa3') })); arch.position.set(0, 1.5, -2.66); g.add(arch)
    box(0.05, 2.1, 0.04, CREAM, 0, 1.5, -2.64, g); box(1.4, 0.05, 0.04, CREAM, 0, 1.6, -2.64, g)
    box(1.2, 0.5, 0.9, '#8a4646', 0, 0.3, -1.7, g); box(1.2, 0.8, 0.2, '#7a3b3b', 0, 0.85, -2.1, g); box(0.2, 0.55, 0.9, '#6a3030', -0.7, 0.45, -1.7, g); box(0.2, 0.55, 0.9, '#6a3030', 0.7, 0.45, -1.7, g)
    cyl(0.03, 0.03, 1.6, '#3b3b3b', 1.6, 0.8, -2.0, g); cyl(0.1, 0.22, 0.28, '#d8b46a', 1.6, 1.7, -2.0, g, 24)
    const lamp = new THREE.PointLight(0xffe0a8, 0.7, 6); lamp.position.set(1.4, 1.6, -1.6); g.add(lamp)
    rug(g, 0, -0.2, 2.2, 1.4, '#7a3b3b')
    return [[-2.95, 0.75, -1.6], [-2.95, 0.75, -0.5], [-2.95, 1.25, -1.6], [-2.95, 1.25, -0.5], [-2.95, 1.75, -1.6], [-2.95, 1.75, -0.5], [2.95, 0.75, -1.6], [2.95, 0.75, -0.5], [2.95, 1.25, -1.6], [2.95, 1.75, -0.5], [0, 1.4, -2.6], [0, 1.4, -1.5]]
  },

  Workshop(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: tileTex('#8d9298', '#7b8086', 6, 4) })); lights(g, 0xfff4e0, 0.8)
    box(3.8, 1.6, 0.05, '#c9b48a', -0.6, 1.9, -2.7, g)
    box(0.25, 0.08, 0.05, '#4b4f55', -1.9, 2.4, -2.65, g); box(0.06, 0.45, 0.04, '#8a5a35', -1.9, 2.15, -2.65, g)
    box(0.7, 0.2, 0.03, '#aeb4ba', -0.9, 2.3, -2.66, g); box(0.2, 0.2, 0.04, '#8a5a35', -0.5, 2.3, -2.65, g)
    box(0.5, 0.05, 0.03, '#4b4f55', 0.3, 2.0, -2.66, g); box(0.05, 0.5, 0.03, '#6b6f75', 0.8, 2.1, -2.66, g); box(0.1, 0.14, 0.04, '#c9503f', 0.8, 1.8, -2.65, g)
    box(3.4, 0.08, 0.8, '#8a6a4a', -0.6, 0.92, -2.3, g); box(0.1, 0.9, 0.7, '#5b4a3a', -2.2, 0.45, -2.3, g); box(0.1, 0.9, 0.7, '#5b4a3a', 1.0, 0.45, -2.3, g); box(3.3, 0.05, 0.7, '#7a5a3e', -0.6, 0.35, -2.3, g)
    box(0.25, 0.25, 0.2, '#4b4f55', 0.75, 1.1, -2.1, g)
    box(1.8, 0.05, 0.4, '#7a5a3e', 2.6, 1.9, -2.5, g); cyl(0.15, 0.15, 0.3, '#b9553f', 2.1, 2.07, -2.5, g); cyl(0.13, 0.13, 0.25, '#4f7a8a', 2.5, 2.05, -2.5, g); cyl(0.17, 0.17, 0.36, '#c9a44a', 3.0, 2.1, -2.5, g)
    box(1.1, 1.0, 0.6, '#a23b3b', 2.6, 0.5, -2.3, g); [0.25, 0.5, 0.75].forEach((y) => { box(1.0, 0.02, 0.02, '#7c2b2b', 2.6, y, -1.99, g); box(0.3, 0.04, 0.04, '#d8c08a', 2.6, y - 0.1, -1.98, g) })
    box(1.0, 0.08, 0.3, '#8a6a4a', 0, 0.8, 0.8, g); [-0.4, 0.4].forEach((x) => { box(0.08, 0.8, 0.3, '#8a6a4a', x, 0.4, 0.8, g) })
    ;[0, 0.12, 0.24].forEach((o, i) => box(0.1, 1.8, 0.04, ['#c9a56a', '#b98f5a', '#d6b57a'][i], 3.4, 0.9, 1.0 + o * 3, g))
    return [[-1.9, 2.0, -2.62], [-0.6, 2.0, -2.62], [0.6, 2.35, -2.62], [-1.9, 1.3, -2.3], [-0.9, 1.3, -2.3], [0.1, 1.3, -2.3], [2.1, 2.5, -2.5], [3.0, 2.55, -2.5], [2.6, 1.3, -2.3], [0, 1.2, 0.0], [-1.5, 0.9, -0.6]]
  },

  Bathroom(g, wall) {
    shell(g, wall, new THREE.MeshLambertMaterial({ map: checkerTex('#e6eef0', '#c9d8dc', 4, 3) })); lights(g, 0xf4faff, 0.9)
    const tw = new THREE.MeshLambertMaterial({ map: tileTex('#e6eef0', '#c0cfd4', 6, 3) })
    plane(W, 1.5, tw, 0, 0.75, -HD + 0.01, 0, 0, g); plane(D, 1.5, tw, -HW + 0.01, 0.75, 0, 0, Math.PI / 2, g); plane(D, 1.5, tw, HW - 0.01, 0.75, 0, 0, -Math.PI / 2, g)
    box(1.0, 0.55, 2.2, '#eef1f2', -2.9, 0.3, -1.2, g); box(0.76, 0.02, 1.96, '#a9d3e3', -2.9, 0.58, -1.2, g); cyl(0.03, 0.03, 0.4, '#aab3b8', -2.9, 0.9, -2.2, g); box(0.04, 0.04, 0.2, '#aab3b8', -2.9, 1.08, -2.1, g)
    box(1.4, 0.85, 0.55, '#a9835a', 0.6, 0.425, -2.45, g); box(1.5, 0.06, 0.62, '#e7e1d6', 0.6, 0.88, -2.42, g); box(0.5, 0.02, 0.36, '#cfd6da', 0.6, 0.92, -2.4, g)
    cyl(0.02, 0.02, 0.22, '#aab3b8', 0.6, 1.02, -2.6, g); box(1.0, 1.1, 0.04, '#8a6a4a', 0.6, 1.9, -2.7, g); box(0.9, 1.0, 0.02, '#cfe3ea', 0.6, 1.9, -2.67, g)
    box(0.55, 0.65, 0.22, '#eef1f2', 2.8, 0.75, -2.55, g); cyl(0.3, 0.2, 0.4, '#eef1f2', 2.8, 0.3, -2.1, g, 24).scale.set(1, 1, 1.3); box(0.6, 0.06, 0.4, '#e4e8ea', 2.8, 0.5, -2.1, g)
    box(1.1, 1.0, 0.05, '#dfeaf0', 1.9, 1.9, -2.7, g); box(0.05, 1.0, 0.06, CREAM, 1.9, 1.9, -2.68, g)
    box(0.9, 0.04, 0.06, '#aab3b8', -1.4, 1.6, -2.7, g); box(0.3, 0.55, 0.05, '#e8d9c4', -1.65, 1.3, -2.68, g); box(0.3, 0.5, 0.05, '#7ea6b8', -1.2, 1.32, -2.68, g)
    rug(g, 0.3, -0.7, 1.4, 0.8, '#6f93b3')
    return [[-2.9, 0.95, -0.6], [-2.9, 0.95, -1.5], [0.2, 1.22, -2.4], [0.95, 1.22, -2.4], [0.6, 2.0, -2.64], [2.8, 1.35, -2.55], [1.9, 1.9, -2.64], [-1.45, 1.75, -2.64], [-2.9, 1.9, -1.2], [2.0, 0.9, -1.2]]
  },

  Garden(g) {
    g.add(new THREE.HemisphereLight(0xcfe3ff, 0x4a6a3a, 1.0)); const sun = new THREE.DirectionalLight(0xfff0c8, 1.0); sun.position.set(4, 8, 5); g.add(sun)
    box(60, 0.2, 60, '#5f8a52', 0, -0.1, -10, g); box(1.6, 0.02, 12, '#cdbf9d', 0, 0.01, -1, g)
    for (let i = -12; i <= 12; i++) { const x = i * 0.5; box(0.2, 1.1, 0.05, '#e8e0d0', x, 0.55, -4.2, g) }
    box(12, 0.06, 0.08, '#d8d0c0', 0, 0.35, -4.2, g); box(12, 0.06, 0.08, '#d8d0c0', 0, 0.8, -4.2, g)
    box(2.2, 1.7, 1.8, '#a9835a', 3.4, 0.85, -3.0, g); const roof = box(2.6, 0.12, 2.2, '#6f4f36', 3.4, 1.85, -3.0, g); roof.rotation.z = 0.0
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.7, 3), mat('#6f4f36')); rf.rotation.z = Math.PI / 2; rf.rotation.x = Math.PI / 2; rf.scale.set(1, 1, 0.55); rf.position.set(3.4, 2.1, -3.0); g.add(rf)
    box(0.7, 1.3, 0.05, '#7a5a3e', 3.4, 0.65, -2.08, g); sph(0.04, '#e0c98f', 3.6, 0.65, -2.04, g)
    cyl(0.25, 0.32, 2.6, '#6f4f36', -3.3, 1.3, -2.4, g); sph(1.25, '#5f8a5a', -3.3, 3.2, -2.4, g, 14); sph(0.9, '#6c9a64', -4.1, 2.7, -2.0, g, 14); sph(0.95, '#527a50', -2.6, 2.8, -2.2, g, 14)
    ;[[-1.8, -1.3], [-0.9, -1.5], [0, -1.3], [0.9, -1.5], [1.8, -1.3], [-2.4, -0.4], [2.4, -0.5]].forEach(([x, z], i) => { cyl(0.015, 0.015, 0.4, '#3f6a3a', x, 0.2, z, g); sph(0.12, ['#d96a6a', '#e8c15a', '#c58ad9', '#f0f0e8'][i % 4], x, 0.45, z, g, 10) })
    sph(0.45, '#2d4632', -1.8, 0.3, -3.6, g); sph(0.5, '#2d4632', 1.0, 0.3, -3.7, g)
    sph(0.7, glow('#f6ecc4'), 5, 7, -14, g, 20)
    return [[-3.5, 3.6, -1.9], [-2.6, 3.3, -1.8], [-3.7, 2.7, -1.6], [-1.0, 1.4, -4.1], [0.2, 1.4, -4.1], [1.4, 1.4, -4.1], [3.4, 1.6, -2.0], [-1.4, 0.9, -1.4], [0.45, 0.95, -1.3], [1.6, 0.95, -1.4], [-1.2, 0.5, 1.0], [1.2, 0.5, 1.0]]
  },
}

// Any room you add later gets a simple furnished room until it has its own model.
ROOMS.Generic = (g, wall) => {
  shell(g, wall, new THREE.MeshLambertMaterial({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) })); lights(g)
  windowPane(g, 1.8, 1.7, -HD + 0.03, 1.2, 1.1)
  box(2.2, 0.08, 0.9, WOOD, -1.0, 0.78, -2.2, g); box(0.08, 0.76, 0.8, DARK, -2.0, 0.4, -2.2, g); box(0.08, 0.76, 0.8, DARK, 0.0, 0.4, -2.2, g)
  rug(g, 0, 0, 2.0, 1.4, '#6a5a7e')
  return [[-1.5, 1.2, -2.2], [-0.5, 1.2, -2.2], [1.8, 1.7, -2.6], [0, 0.5, 0.6], [-2, 1.8, -2.6], [2.5, 0.5, -1]]
}

const GARDEN_CAM = { mode: 'look', pos: [0, 1.6, 3.6], target: [0, 1.5, -4], yaw: 0.9, pitch: 0.35, hfov: 78 }
const ROOM_CAM = { mode: 'look', pos: [0, 1.5, 2.55], target: [0, 1.0, -2.75], yaw: 1.0, pitch: 0.4, hfov: 84 }

// room = {name, theme}; items = [{item, emoji}] shown on that room's spots.
export function buildRoom(room, items) {
  const g = new THREE.Group(), picks = []
  const make = ROOMS[room.name] || ROOMS.Generic
  const slots = make(g, room.theme ? lighten(room.theme) : '#d9cbb2')
  items.slice(0, slots.length).forEach((it, i) => {
    const s = stickerSprite(it.emoji, it.item.id)
    const cam = room.name === 'Garden' ? GARDEN_CAM : ROOM_CAM
    const dist = Math.hypot(slots[i][0] - cam.pos[0], slots[i][1] - cam.pos[1], slots[i][2] - cam.pos[2])
    s.scale.setScalar(0.5 * Math.min(1.1, 0.45 + 0.11 * dist))
    s.position.set(...slots[i]); s.userData.pick = { type: 'item', item: it.item }
    g.add(s); picks.push(s)
  })
  const garden = room.name === 'Garden'
  return { group: g, picks, cam: garden ? GARDEN_CAM : ROOM_CAM, bg: garden ? gradTex('#7fa6c9', '#e8cfa3') : new THREE.Color('#1a1410') }
}

function lighten(hex) { return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), 0.22).getHexString() }
