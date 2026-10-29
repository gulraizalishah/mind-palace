import { THREE, texMat, metal, gloss, glassMat, grassTex, box, cyl, sph, plane, mat, glow, checkerTex, plankTex, tileTex, stripeTex, gradTex, stickerMat, hashOf, hitArea, labelTex, badgeTex, invisible } from './kit'
import { layoutRoom, LEFT_WALL, RIGHT_WALL } from '../lib/places'

// Room size in metres: x = width, z = depth, y = height. The camera stands by the open front.
const W = 7, D = 5.5, H = 3, HW = W / 2, HD = D / 2
const WOOD = '#8a6446', DARK = '#5b3d29', CREAM = '#f1ebdd', STEEL = '#b9c0c6'
const PI = Math.PI, LEFT = PI / 2, RIGHT = -PI / 2

function lights(g, color = 0xfff0d0, _legacy, y = H - 0.4) {
  g.add(new THREE.AmbientLight(0xffffff, 0.2))
  const p = new THREE.PointLight(color, 0.4, 12); p.position.set(0, Math.min(y, 2.2), 0.3); g.add(p)
  // a soft key light from the front corner, so furniture throws gentle shadows
  const key = new THREE.DirectionalLight(0xfff1d6, 1.1); key.position.set(1.8, 2.8, 2.4); key.target.position.set(-0.4, 0, -1.4)
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024)
  const c = key.shadow.camera; c.left = -5; c.right = 5; c.top = 4.5; c.bottom = -4; c.near = 0.5; c.far = 11
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.025; key.shadow.radius = 3
  g.add(key, key.target)
}

function shell(g, wall, floorMat, { stripe = false, ceil = '#d9d2c4' } = {}) {
  const wm = stripe ? texMat({ map: stripeTex(wall) }) : mat(wall)
  plane(W, H, wm, 0, H / 2, -HD, 0, 0, g)
  plane(D, H, wm, -HW, H / 2, 0, 0, PI / 2, g)
  plane(D, H, wm, HW, H / 2, 0, 0, -PI / 2, g)
  plane(W, D, floorMat, 0, 0, 0, -PI / 2, 0, g)
  plane(W, D, mat(ceil), 0, H, 0, PI / 2, 0, g)
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

// A proper four-legged chair. It faces local +z; rotate it with ry.
function chair(g, x, z, ry, color = '#6a4a32') {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c)
  box(0.46, 0.05, 0.46, color, 0, 0.46, 0, c)
  ;[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([dx, dz]) => box(0.05, 0.46, 0.05, DARK, dx, 0.23, dz, c))
  box(0.46, 0.46, 0.05, color, 0, 0.74, -0.205, c)
  ;[-0.19, 0.19].forEach((dx) => box(0.05, 0.5, 0.05, DARK, dx, 0.73, -0.205, c))
}

const BOOKS = ['#7a3b3b', '#3f5f7a', '#5f7a4a', '#a8863f', '#5b4a6a', '#8a5a3a', '#3f6a68', '#9a6a5a']
function books(g, x, rows, z0, z1, alongX = false) {
  const spots = []
  rows.forEach((y) => { for (let z = z0, i = 0; z < z1 - 0.1; i++) { const t = 0.05 + ((i * 7) % 5) * 0.012; spots.push([y, z + t / 2, t, 0.26 + ((i * 5 + y * 7) % 6) * 0.03]); z += t + 0.012 } })
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff'), spots.length)
  const d = new THREE.Object3D(), c = new THREE.Color()
  spots.forEach(([y, z, t, h], i) => {
    if (alongX) { d.position.set(z, y + h / 2, x); d.scale.set(t, h, 0.26) } else { d.position.set(x, y + h / 2, z); d.scale.set(0.26, h, t) }
    d.updateMatrix(); im.setMatrixAt(i, d.matrix)
    im.setColorAt(i, c.set(BOOKS[(i * 3 + Math.round(y * 5)) % BOOKS.length]))
  })
  g.add(im)
}
// A bookcase set against the back wall, between x0 and x1 (visible as soon as you walk in).
function backCase(g, x0, x1, rows) {
  const w = x1 - x0, cx = (x0 + x1) / 2
  box(w + 0.2, 2.6, 0.03, '#3a281c', cx, 1.3, -HD + 0.03, g)                  // back panel
  ;[x0 - 0.075, x1 + 0.075].forEach((x) => box(0.05, 2.6, 0.4, DARK, x, 1.3, -HD + 0.2, g)) // sides
  box(w + 0.2, 0.06, 0.4, DARK, cx, 2.63, -HD + 0.2, g)                         // top
  rows.forEach((y) => box(w + 0.1, 0.05, 0.38, '#7a5a3e', cx, y - 0.02, -HD + 0.2, g)) // shelves
  books(g, -HD + 0.18, rows, x0 + 0.04, x1 - 0.04, true)
}

// ---------------------------------------------------------------- rooms: each returns its spots [x, y, z, rotationY]
const ROOMS = {
  Kitchen(g, wall) {
    shell(g, wall, texMat({ map: checkerTex('#d8d3c8', '#b9b3a6', 4, 3) })); lights(g)
    box(0.95, 2.15, 0.8, metal('#d5dade'), -2.8, 1.075, -2.35, g); box(0.92, 0.03, 0.02, '#8a9299', -2.8, 1.45, -1.94, g)
    box(0.05, 0.5, 0.05, '#8a9299', -2.4, 1.8, -1.92, g); box(0.05, 0.8, 0.05, '#8a9299', -2.4, 0.9, -1.92, g)
    box(5.2, 0.9, 0.7, '#a9835a', 0.7, 0.45, -2.4, g); box(5.3, 0.06, 0.78, gloss('#e7e1d6'), 0.7, 0.93, -2.38, g)
    ;[-1.6, -0.3, 0.9, 2.3].forEach((x) => box(0.02, 0.8, 0.02, '#7a5a3e', x, 0.45, -2.04, g))
    box(0.8, 0.9, 0.72, metal('#3b4046'), 1.6, 0.45, -2.4, g); box(0.6, 0.4, 0.02, '#1f2327', 1.6, 0.5, -2.03, g); box(0.6, 0.03, 0.04, '#9aa2a8', 1.6, 0.78, -2.0, g)
    ;[[-0.2, -0.1], [0.2, -0.1], [-0.2, 0.15], [0.2, 0.15]].forEach(([dx, dz]) => cyl(0.11, 0.11, 0.02, '#14171a', 1.6 + dx, 0.97, -2.4 + dz, g))
    box(0.9, 0.45, 0.5, metal(STEEL), 1.6, 1.95, -2.5, g); box(0.3, 0.9, 0.3, '#aab2b8', 1.6, 2.6, -2.6, g)
    box(0.8, 0.02, 0.45, '#8f979d', -0.6, 0.965, -2.4, g); cyl(0.025, 0.025, 0.3, '#8d959b', -0.6, 1.1, -2.6, g); box(0.04, 0.04, 0.2, '#8d959b', -0.6, 1.25, -2.5, g)
    windowPane(g, -0.6, 1.8, -HD + 0.03, 1.2, 0.9)
    // open pantry shelf with jars
    box(1.95, 1.05, 0.04, '#8a6a4a', 2.85, 2.0, -2.7, g); box(0.05, 1.05, 0.4, '#a9835a', 1.9, 2.0, -2.5, g); box(0.05, 1.05, 0.4, '#a9835a', 3.8, 2.0, -2.5, g)
    ;[1.75, 2.4].forEach((y) => box(1.95, 0.05, 0.4, '#a9835a', 2.85, y, -2.5, g))
    ;[[2.2, '#c0463c'], [3.5, '#6f93b3']].forEach(([x, c]) => cyl(0.1, 0.1, 0.24, c, x, 2.54, -2.5, g)); cyl(0.12, 0.12, 0.2, '#c9a44a', 2.85, 2.52, -2.5, g)
    cyl(0.7, 0.7, 0.05, WOOD, 0.3, 0.75, -0.5, g, 28); cyl(0.05, 0.08, 0.72, DARK, 0.3, 0.37, -0.5, g)
    chair(g, -0.7, -0.5, LEFT); chair(g, 1.3, -0.5, RIGHT)
    cyl(0.01, 0.01, 0.9, '#333', 0.3, 2.55, -0.5, g); cyl(0.12, 0.38, 0.3, '#d8b46a', 0.3, 2.0, -0.5, g, 24); sph(0.1, glow('#fff2c0'), 0.3, 1.95, -0.5, g)
    rug(g, 0.3, -0.5, 1.7, 1.3, '#8c5a4a')
    return [
      [-2.8, 1.6, -1.92], [-2.8, 1.05, -1.92], [-2.8, 0.5, -1.92],
      [-1.6, 1.22, -2.3], [0.1, 1.22, -2.3], [2.5, 1.22, -2.3], [3.1, 1.22, -2.3],
      [-1.0, 0.5, -2.02], [3.0, 0.5, -2.02],
      [2.2, 1.93, -2.5], [2.85, 1.93, -2.5], [3.5, 1.93, -2.5],
      [0.0, 1.1, -0.6], [0.7, 1.1, -0.4],
    ]
  },

  Garage(g, wall) {
    shell(g, wall, texMat({ map: tileTex('#8d9298', '#7b8086', 6, 4) })); lights(g, 0xf4f4ff, 0.8)
    box(3.8, 2.55, 0.08, metal('#d7dade'), 0, 1.275, -2.7, g); for (let i = 1; i < 8; i++) box(3.82, 0.03, 0.09, '#b5babf', 0, i * 0.31, -2.66, g)
    box(4.0, 0.1, 0.12, '#8f959b', 0, 2.6, -2.68, g)
    const car = new THREE.Group(); car.position.set(0.1, 0, -1.3); car.scale.setScalar(0.9); g.add(car)
    box(2.4, 0.5, 1.05, mat('#6f89a6', { metalness: 0.55, roughness: 0.28 }), 0, 0.55, 0, car); box(1.3, 0.5, 0.95, mat('#6f89a6', { metalness: 0.55, roughness: 0.28 }), -0.1, 1.05, 0, car); box(1.2, 0.3, 0.97, glassMat('#cfe0ee'), -0.1, 1.08, 0, car)
    box(0.04, 0.2, 0.2, glow('#f1e3b0'), 1.2, 0.62, 0.35, car); box(0.04, 0.2, 0.2, glow('#f1e3b0'), 1.2, 0.62, -0.35, car)
    ;[[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(([x, z]) => { const w = cyl(0.3, 0.3, 0.2, '#25282c', x, 0.3, z, car); w.rotation.x = PI / 2; const h = cyl(0.14, 0.14, 0.22, '#9aa0a6', x, 0.3, z, car); h.rotation.x = PI / 2 })
    box(0.8, 0.08, 2.4, '#7a5a3e', 3.0, 0.92, -0.8, g); box(0.7, 0.9, 0.1, '#5b4a3a', 3.0, 0.45, 0.3, g); box(0.7, 0.9, 0.1, '#5b4a3a', 3.0, 0.45, -1.9, g); box(0.5, 0.25, 2.0, '#8a6a4a', 3.05, 0.5, -0.8, g)
    box(0.05, 1.3, 1.8, '#c9b48a', 3.45, 1.95, -1.1, g); box(0.08, 0.06, 0.5, '#555', 3.4, 2.2, -1.6, g); box(0.08, 0.06, 0.7, '#6b6f75', 3.4, 1.9, -1.1, g); box(0.08, 0.06, 0.5, '#555', 3.4, 1.6, -0.6, g)
    ;[0.15, 0.4, 0.65].forEach((y) => cyl(0.38, 0.38, 0.23, '#2b2e33', -2.9, y, -1.8, g))
    box(0.5, 0.05, 1.8, '#7a5a3e', -3.2, 1.6, -1.2, g); box(0.1, 0.5, 0.1, '#5b4a3a', -3.2, 1.35, -2.0, g); box(0.1, 0.5, 0.1, '#5b4a3a', -3.2, 1.35, -0.4, g)
    return [
      [0.0, 1.8, -1.3], [1.1, 1.25, -1.3],
      [3.0, 1.3, -1.4], [3.0, 1.3, -0.3],
      [3.38, 2.0, -1.4, RIGHT], [3.38, 2.0, -0.2, RIGHT],
      [-1.1, 1.6, -2.62], [1.4, 1.6, -2.62],
      [-3.15, 1.78, -1.55, LEFT], [-3.15, 1.78, -0.85, LEFT],
      [-2.9, 1.1, -1.8],
      [-1.6, 0.35, 0.2],
    ]
  },

  Study(g, wall) {
    shell(g, wall, texMat({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) }), { stripe: true }); lights(g, 0xffe9c8)
    backCase(g, -3.3, -1.0, [0.42, 0.95, 1.5, 2.05])
    box(2.1, 0.08, 0.9, '#7a5a3e', 0.5, 0.78, -2.15, g); box(0.07, 0.75, 0.8, DARK, -0.45, 0.4, -2.15, g); box(0.6, 0.7, 0.8, '#6b4a32', 1.2, 0.4, -2.15, g); box(0.5, 0.18, 0.02, '#5b3d29', 1.2, 0.55, -1.74, g)
    cyl(0.1, 0.12, 0.04, '#3b3b3b', -0.2, 0.84, -2.2, g); box(0.03, 0.4, 0.03, '#3b3b3b', -0.2, 1.04, -2.2, g); cyl(0.08, 0.2, 0.2, '#d8b46a', -0.2, 1.3, -2.15, g, 24)
    const lamp = new THREE.PointLight(0xffe9a8, 0.6, 5); lamp.position.set(-0.2, 1.2, -2.0); g.add(lamp)
    sph(0.2, gloss('#5e8aa6'), 1.45, 1.12, -2.35, g); cyl(0.02, 0.05, 0.12, '#3b3b3b', 1.45, 0.88, -2.35, g)
    box(0.9, 0.7, 0.05, DARK, 0.5, 1.9, -2.68, g); box(0.78, 0.58, 0.02, '#8c9e8a', 0.5, 1.9, -2.65, g); box(0.5, 0.2, 0.02, '#4b5b66', 0.4, 1.78, -2.64, g)
    windowPane(g, 2.4, 1.7, -HD + 0.03, 1.1, 1.2); box(0.25, 1.6, 0.1, '#7d6a8e', 1.7, 1.7, -2.65, g); box(0.25, 1.6, 0.1, '#7d6a8e', 3.1, 1.7, -2.65, g)
    chair(g, 0.4, -1.35, PI, '#5a4a6a')
    rug(g, 0.6, -0.4, 1.9, 1.3, '#6a5a7e')
    const out = []
    ;[2.05, 1.5, 0.95, 0.42].forEach((y) => [-2.7, -1.65].forEach((x) => out.push([x, y + 0.23, -2.3, 0])))
    out.push([0.1, 1.15, -1.95], [0.75, 1.15, -1.95], [0.5, 1.9, -2.6], [2.4, 1.7, -2.62], [0.6, 0.35, 0.2])
    return out
  },

  Office(g, wall) {
    shell(g, wall, texMat({ map: plankTex('#9a7650', '#8a6646', 2, 2) })); lights(g, 0xf4f8ff, 0.9)
    box(2.2, 1.2, 0.05, '#9aa2a8', -2.0, 1.85, -2.7, g); box(2.06, 1.06, 0.03, '#f4f4f0', -2.0, 1.85, -2.67, g)
    ;[[2.3, 0.04], [1.7, 0.04], [1.0, 0.04]].forEach(([w, h], i) => box(w * 0.7, h, 0.02, ['#7a8aa0', '#c0463c', '#3f6a68'][i], -2.0, 2.15 - i * 0.28, -2.65, g))
    box(2.2, 0.06, 0.12, '#9aa2a8', -2.0, 1.22, -2.62, g)
    box(2.5, 0.08, 0.9, '#6f5a46', 1.2, 0.76, -2.15, g); box(0.7, 0.72, 0.8, '#5b4a3a', 2.1, 0.38, -2.15, g); box(0.07, 0.72, 0.8, '#5b4a3a', 0.05, 0.38, -2.15, g)
    box(1.0, 0.6, 0.05, '#2b3138', 1.2, 1.3, -2.35, g); box(0.92, 0.5, 0.02, glow('#6f93b3'), 1.2, 1.3, -2.32, g); box(0.1, 0.3, 0.08, '#2b3138', 1.2, 0.95, -2.35, g); box(0.6, 0.02, 0.2, '#cfd3d6', 1.2, 0.81, -1.9, g)
    box(0.7, 1.3, 0.6, metal('#8d979e'), -0.45, 0.65, -2.4, g); [0.25, 0.65, 1.05].forEach((y) => { box(0.6, 0.01, 0.02, '#6b757c', -0.45, y + 0.2, -2.09, g); box(0.16, 0.03, 0.03, '#d8dde0', -0.45, y, -2.08, g) })
    cyl(0.18, 0.14, 0.4, '#a86f4a', 3.0, 0.2, -2.4, g); [[0, 0.7], [-0.15, 0.95], [0.15, 0.95]].forEach(([dx, y]) => sph(0.22, '#5f8a5a', 3.0 + dx, y, -2.4, g))
    const clk = cyl(0.3, 0.3, 0.05, '#f4f0e6', 1.2, 2.3, -2.7, g, 32); clk.rotation.x = PI / 2; box(0.02, 0.2, 0.02, '#333', 1.2, 2.38, -2.66, g); box(0.15, 0.02, 0.02, '#333', 1.27, 2.3, -2.66, g)
    cyl(0.06, 0.06, 0.4, '#333', 1.2, 0.22, -1.2, g); box(0.55, 0.08, 0.5, '#3f4a55', 1.2, 0.5, -1.2, g); box(0.5, 0.6, 0.08, '#3f4a55', 1.2, 0.85, -0.95, g)
    rug(g, 1.0, -0.6, 1.9, 1.2, '#5b6a7a')
    return [[-2.4, 1.95, -2.62], [-1.6, 1.95, -2.62], [-2.0, 1.5, -2.62], [0.5, 1.15, -2.0], [1.9, 1.15, -2.0], [1.2, 2.3, -2.62], [-0.45, 1.62, -2.4], [1.2, 1.95, -2.3], [3.0, 1.55, -2.4]]
  },

  Library(g, wall) {
    shell(g, wall, texMat({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) }), { stripe: true }); lights(g, 0xffe3b8, 0.8)
    const rows = [0.4, 0.9, 1.4, 1.9]
    backCase(g, -3.35, -1.05, rows); backCase(g, 1.05, 3.35, rows)
    box(1.6, 2.3, 0.06, '#efe8da', 0, 1.5, -2.7, g)
    const arch = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshBasicMaterial({ map: gradTex('#7fa6c9', '#e8cfa3') })); arch.position.set(0, 1.5, -2.66); g.add(arch)
    box(0.05, 2.1, 0.04, CREAM, 0, 1.5, -2.64, g); box(1.4, 0.05, 0.04, CREAM, 0, 1.6, -2.64, g)
    box(1.2, 0.5, 0.9, '#8a4646', 0, 0.3, -1.4, g); box(1.2, 0.8, 0.2, '#7a3b3b', 0, 0.85, -1.8, g); box(0.2, 0.55, 0.9, '#6a3030', -0.7, 0.45, -1.4, g); box(0.2, 0.55, 0.9, '#6a3030', 0.7, 0.45, -1.4, g)
    cyl(0.03, 0.03, 1.6, '#3b3b3b', 1.0, 0.8, -1.2, g); cyl(0.1, 0.22, 0.28, '#d8b46a', 1.0, 1.7, -1.2, g, 24)
    const lamp = new THREE.PointLight(0xffe0a8, 0.7, 6); lamp.position.set(1.0, 1.6, -1.0); g.add(lamp)
    box(0.06, 1.3, 0.9, '#7a5a3e', -3.4, 1.4, -1.6, g); box(0.04, 0.8, 0.6, '#8c9e8a', -3.38, 1.5, -1.6, g)
    rug(g, 0, -0.2, 2.2, 1.4, '#7a3b3b')
    const out = []
    const xs = [-2.9, -2.2, -1.5]
    ;[1.9, 1.4, 0.9, 0.4].forEach((y) => xs.forEach((x) => out.push([x, y + 0.23, -2.3, 0])))
    ;[1.9, 1.4, 0.9, 0.4].forEach((y) => xs.forEach((x) => out.push([-x, y + 0.23, -2.3, 0])))
    out.push([0, 1.3, -1.35], [0, 2.2, -2.6])
    return out
  },

  Workshop(g, wall) {
    shell(g, wall, texMat({ map: tileTex('#8d9298', '#7b8086', 6, 4) })); lights(g, 0xfff4e0, 0.8)
    box(3.8, 1.6, 0.05, '#c9b48a', -0.6, 1.9, -2.7, g)
    box(0.25, 0.08, 0.05, '#4b4f55', -1.9, 2.4, -2.65, g); box(0.06, 0.45, 0.04, '#8a5a35', -1.9, 2.15, -2.65, g)
    box(0.7, 0.2, 0.03, '#aeb4ba', -0.9, 2.3, -2.66, g); box(0.2, 0.2, 0.04, '#8a5a35', -0.5, 2.3, -2.65, g)
    box(0.5, 0.05, 0.03, '#4b4f55', 0.3, 2.0, -2.66, g); box(0.05, 0.5, 0.03, '#6b6f75', 0.8, 2.1, -2.66, g); box(0.1, 0.14, 0.04, '#c9503f', 0.8, 1.8, -2.65, g)
    box(3.4, 0.08, 0.8, '#8a6a4a', -0.6, 0.92, -2.3, g); box(0.1, 0.9, 0.7, '#5b4a3a', -2.2, 0.45, -2.3, g); box(0.1, 0.9, 0.7, '#5b4a3a', 1.0, 0.45, -2.3, g); box(3.3, 0.05, 0.7, '#7a5a3e', -0.6, 0.35, -2.3, g)
    box(0.25, 0.25, 0.2, '#4b4f55', 0.75, 1.1, -2.1, g)
    box(1.9, 0.05, 0.4, '#7a5a3e', 2.6, 1.9, -2.5, g); box(0.05, 0.4, 0.3, '#5b4a3a', 1.7, 1.7, -2.5, g); box(0.05, 0.4, 0.3, '#5b4a3a', 3.5, 1.7, -2.5, g)
    cyl(0.15, 0.15, 0.3, '#b9553f', 3.4, 2.07, -2.5, g); cyl(0.13, 0.13, 0.25, '#4f7a8a', 3.15, 2.05, -2.5, g)
    box(1.1, 1.0, 0.6, '#a23b3b', 2.6, 0.5, -2.3, g); [0.25, 0.5, 0.75].forEach((y) => { box(1.0, 0.02, 0.02, '#7c2b2b', 2.6, y, -1.99, g); box(0.3, 0.04, 0.04, '#d8c08a', 2.6, y - 0.1, -1.98, g) })
    box(1.0, 0.08, 0.3, '#8a6a4a', 0, 0.8, 0.8, g); [-0.4, 0.4].forEach((x) => { box(0.08, 0.8, 0.3, '#8a6a4a', x, 0.4, 0.8, g) })
    ;[0, 0.12, 0.24].forEach((o, i) => box(0.1, 1.8, 0.04, ['#c9a56a', '#b98f5a', '#d6b57a'][i], 3.4, 0.9, -1.9 + o * 3, g))
    return [[-1.9, 2.0, -2.62], [-0.6, 2.0, -2.62], [0.6, 2.35, -2.62], [-1.9, 1.3, -2.3], [-0.9, 1.3, -2.3], [0.1, 1.3, -2.3], [2.15, 2.1, -2.5], [2.65, 2.1, -2.5], [3.1, 2.1, -2.5], [2.6, 1.3, -2.3], [0, 1.2, 0.8], [-1.5, 0.35, -0.6]]
  },

  Bathroom(g, wall) {
    shell(g, wall, texMat({ map: checkerTex('#e6eef0', '#c9d8dc', 4, 3) })); lights(g, 0xf4faff, 0.9)
    const tw = texMat({ map: tileTex('#e6eef0', '#c0cfd4', 6, 3) })
    plane(W, 1.5, tw, 0, 0.75, -HD + 0.01, 0, 0, g); plane(D, 1.5, tw, -HW + 0.01, 0.75, 0, 0, PI / 2, g); plane(D, 1.5, tw, HW - 0.01, 0.75, 0, 0, -PI / 2, g)
    box(1.0, 0.55, 2.2, gloss('#eef1f2'), -2.9, 0.3, -1.2, g); box(0.76, 0.02, 1.96, '#a9d3e3', -2.9, 0.58, -1.2, g); cyl(0.03, 0.03, 0.4, '#aab3b8', -2.9, 0.9, -2.2, g); box(0.04, 0.04, 0.2, '#aab3b8', -2.9, 1.08, -2.1, g)
    box(1.4, 0.85, 0.55, '#a9835a', 0.6, 0.425, -2.45, g); box(1.5, 0.06, 0.62, '#e7e1d6', 0.6, 0.88, -2.42, g); box(0.5, 0.02, 0.36, '#cfd6da', 0.6, 0.92, -2.4, g)
    cyl(0.02, 0.02, 0.22, '#aab3b8', 0.6, 1.02, -2.6, g); box(1.0, 1.1, 0.04, '#8a6a4a', 0.6, 1.9, -2.7, g); box(0.9, 1.0, 0.02, mat('#e6eef2', { metalness: 1, roughness: 0.04 }), 0.6, 1.9, -2.67, g)
    box(0.55, 0.65, 0.22, gloss('#eef1f2'), 2.8, 0.75, -2.55, g); cyl(0.3, 0.2, 0.4, '#eef1f2', 2.8, 0.3, -2.1, g, 24).scale.set(1, 1, 1.3); box(0.6, 0.06, 0.4, '#e4e8ea', 2.8, 0.5, -2.1, g)
    box(1.1, 1.0, 0.05, '#dfeaf0', 1.9, 1.9, -2.7, g); box(0.05, 1.0, 0.06, CREAM, 1.9, 1.9, -2.68, g)
    box(0.9, 0.04, 0.06, '#aab3b8', -1.4, 1.6, -2.7, g); box(0.3, 0.55, 0.05, '#e8d9c4', -1.65, 1.3, -2.68, g); box(0.3, 0.5, 0.05, '#7ea6b8', -1.2, 1.32, -2.68, g)
    rug(g, 0.3, -0.7, 1.4, 0.8, '#6f93b3')
    return [[-2.9, 0.95, -0.6], [-2.9, 0.95, -1.5], [0.2, 1.22, -2.4], [0.95, 1.22, -2.4], [0.6, 2.0, -2.64], [2.8, 1.35, -2.55], [1.9, 1.9, -2.64], [-1.45, 1.75, -2.64], [2.0, 0.35, -1.2]]
  },

  Garden(g, wall, ctx) {
    g.add(new THREE.HemisphereLight(0xcfe3ff, 0x4a6a3a, 0.7)); const sun = new THREE.DirectionalLight(0xfff0c8, 1.7); sun.position.set(5, 9, 6); sun.target.position.set(0, 0, -2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 30; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; g.add(sun, sun.target)
    plane(70, 70, texMat({ map: grassTex(24, 24) }), 0, 0, -10, -PI / 2, 0, g); box(1.6, 0.02, 12, '#cdbf9d', 0, 0.01, -1, g)
    for (let i = -12; i <= 12; i++) box(0.2, 1.1, 0.05, '#e8e0d0', i * 0.5, 0.55, -4.2, g)
    box(12, 0.06, 0.08, '#d8d0c0', 0, 0.35, -4.2, g); box(12, 0.06, 0.08, '#d8d0c0', 0, 0.8, -4.2, g)
    // the shed: a real room, entered through its door
    box(2.2, 1.7, 1.8, '#a9835a', 3.4, 0.85, -3.0, g)
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.7, 3), mat('#6f4f36')); rf.rotation.z = PI / 2; rf.rotation.x = PI / 2; rf.scale.set(1, 1, 0.55); rf.position.set(3.4, 2.1, -3.0); g.add(rf)
    box(0.8, 1.4, 0.06, '#e8dfcf', 3.4, 0.7, -2.09, g); box(0.62, 1.3, 0.04, glow('#d8b46a'), 3.4, 0.68, -2.08, g)
    const pivot = new THREE.Group(); pivot.position.set(3.05, 0, -2.04); g.add(pivot)
    const panel = box(0.7, 1.3, 0.06, '#7a5a3e', 0.35, 0.65, 0, pivot); sph(0.04, '#e0c98f', 0.6, 0.62, 0.05, pivot)
    if (ctx.shedId) {
      const pick = { type: 'door', token: `room:${ctx.shedId}`, pivot, angle: -1.7, ms: 1000, fly: { pos: [3.4, 1.4, -0.9], target: [3.4, 1.1, -3.5] } }
      panel.userData.pick = pick; ctx.picks.push(panel)
      hitArea(1.4, 1.9, 3.4, 0.95, -1.9, 0, pick, g, ctx.picks)
      plane(0.9, 0.22, new THREE.MeshBasicMaterial({ map: labelTex('Shed'), transparent: true }), 3.4, 1.62, -2.04, 0, 0, g)
    }
    cyl(0.25, 0.32, 2.6, '#6f4f36', -3.3, 1.3, -2.4, g); sph(1.25, '#5f8a5a', -3.3, 3.2, -2.4, g, 14); sph(0.9, '#6c9a64', -4.1, 2.7, -2.0, g, 14); sph(0.95, '#527a50', -2.6, 2.8, -2.2, g, 14)
    ;[[-1.8, -1.3], [-0.9, -1.5], [0, -1.3], [0.9, -1.5], [1.8, -1.3], [-2.4, -0.4], [2.4, -0.5]].forEach(([x, z], i) => { cyl(0.015, 0.015, 0.4, '#3f6a3a', x, 0.2, z, g); sph(0.12, ['#d96a6a', '#e8c15a', '#c58ad9', '#f0f0e8'][i % 4], x, 0.45, z, g, 10) })
    sph(0.45, '#2d4632', -1.8, 0.3, -3.6, g); sph(0.5, '#2d4632', 1.0, 0.3, -3.7, g)
    sph(0.7, glow('#f6ecc4'), 5, 7, -14, g, 20)
    return [[-3.5, 3.6, -1.9], [-2.6, 3.3, -1.8], [-3.7, 2.7, -1.6], [-1.0, 1.4, -4.1], [0.2, 1.4, -4.1], [1.4, 1.4, -4.1], [3.4, 1.95, -2.0], [-1.4, 0.9, -1.4], [0.45, 0.95, -1.3], [1.6, 0.95, -1.4], [-1.2, 0.5, 1.0], [1.2, 0.5, 1.0]]
  },

  // The storage room behind the garden door.
  Shed(g, wall) {
    shell(g, wall, texMat({ map: tileTex('#9a8c78', '#7f7260', 6, 4) }), { stripe: true, ceil: '#8a6a4a' }); lights(g, 0xffe6b8, 1.1)
    windowPane(g, -1.0, 1.7, -HD + 0.03, 0.9, 0.8)
    ;[[1.0, 1.4], [1.0, 2.0]].forEach(([, y]) => box(2.8, 0.05, 0.4, '#7a5a3e', 1.9, y, -2.5, g))
    ;[0.4, 3.4].forEach((x) => box(0.05, 1.1, 0.4, '#5b4a3a', x, 1.7, -2.5, g))
    ;[[0.5, '#b9553f'], [3.2, '#4f7a8a'], [3.4, '#c9a44a']].forEach(([x, c], i) => cyl(0.11, 0.11, 0.28, c, x, 1.58 + (i > 0 ? 0.6 : 0), -2.5, g))
    ;[-2.9, -2.45].forEach((x, i) => { box(0.04, 2.2, 0.04, '#8a5a35', x, 1.1, -2.62, g); box(0.4, 0.05, 0.12, '#8d9298', x, 2.2 - i * 0.25, -2.62, g) })
    box(2.2, 0.08, 0.7, '#8a6a4a', -0.1, 0.82, -1.9, g); [-1.1, 0.9].forEach((x) => box(0.08, 0.8, 0.6, '#5b4a3a', x, 0.4, -1.9, g))
    cyl(0.12, 0.1, 0.3, '#c0463c', -0.9, 1.0, -1.9, g); cyl(0.09, 0.09, 0.22, '#d8c08a', 0.2, 0.96, -1.9, g)
    const wb = box(0.8, 0.35, 0.6, '#3f6a3a', 2.4, 0.35, 0.3, g); box(0.05, 0.3, 0.5, '#555', 2.0, 0.55, 0.3, g); const wheel = cyl(0.15, 0.15, 0.05, '#222', 2.9, 0.15, 0.3, g); wheel.rotation.z = PI / 2
    box(0.6, 0.5, 0.35, '#c9b48a', -2.4, 0.25, 0.4, g); box(0.6, 0.5, 0.35, '#b8a47a', -2.4, 0.75, 0.4, g)
    return [[1.1, 2.17, -2.5], [1.9, 2.17, -2.5], [2.7, 2.17, -2.5], [1.1, 1.57, -2.5], [1.9, 1.57, -2.5], [2.7, 1.57, -2.5], [-2.9, 1.5, -2.58], [-2.45, 1.5, -2.58], [-1.7, 1.0, -2.58], [-0.6, 1.2, -1.9], [0.7, 1.2, -1.9], [0.8, 0.4, 0.6], [-1.6, 0.4, 0.6]]
  },
}

ROOMS.Generic = (g, wall) => {
  shell(g, wall, texMat({ map: plankTex('#8a6446', '#7c5a3e', 2, 2) })); lights(g)
  windowPane(g, 1.8, 1.7, -HD + 0.03, 1.2, 1.1)
  box(2.2, 0.08, 0.9, WOOD, -1.0, 0.78, -2.2, g); box(0.08, 0.76, 0.8, DARK, -2.0, 0.4, -2.2, g); box(0.08, 0.76, 0.8, DARK, 0.0, 0.4, -2.2, g)
  rug(g, 0, 0, 2.0, 1.4, '#6a5a7e')
  return [[-1.5, 1.2, -2.2], [-0.5, 1.2, -2.2], [1.8, 1.7, -2.6], [0, 0.4, 0.6], [2.5, 0.4, -1], [-2.5, 0.4, -1]]
}

const GARDEN_CAM = { mode: 'look', pos: [0, 1.6, 3.6], target: [0, 1.5, -4], yaw: 0.9, pitch: 0.35, hfov: 78 }
const ROOM_CAM = { mode: 'look', pos: [0, 1.5, 2.55], target: [0, 0.82, -2.75], yaw: 1.0, pitch: 0.4, hfov: 84 }

// Tappable furniture: name -> [centre, size]. Memories kept there are listed in a dialog instead of lying around.
const HITS = {
  Kitchen: { Refrigerator: [[-2.8, 1.1, -2.0], [1.0, 2.2, 0.7]], Counter: [[0.9, 1.2, -2.25], [4.4, 0.5, 0.9]], Cupboards: [[0.7, 0.45, -2.0], [5.0, 0.9, 0.12]], 'Pantry shelf': [[2.85, 2.05, -2.45], [1.9, 1.0, 0.5]], Table: [[0.3, 0.8, -0.5], [1.5, 0.5, 1.5]] },
  Garage: { Car: [[0.1, 0.8, -1.3], [2.3, 1.3, 1.1]], Workbench: [[3.0, 0.55, -0.8], [0.9, 0.9, 2.4]], Pegboard: [[3.4, 1.95, -1.1], [0.2, 1.3, 1.8]], 'Garage door': [[0, 1.5, -2.62], [3.8, 2.3, 0.2]], Shelf: [[-3.2, 1.75, -1.2], [0.6, 0.5, 1.9]], Tires: [[-2.9, 0.4, -1.8], [0.8, 0.9, 0.8]] },
  Study: { Bookshelf: [[-2.15, 1.3, -2.55], [2.4, 2.6, 0.5]], Desk: [[0.5, 0.5, -2.15], [2.2, 1.0, 0.9]], 'Picture frame': [[0.5, 1.9, -2.6], [0.9, 0.7, 0.15]], Window: [[2.4, 1.7, -2.65], [1.2, 1.3, 0.15]], Rug: [[0.6, 0.05, -0.4], [3.5, 0.1, 2.4]] },
  Office: { Whiteboard: [[-2.0, 1.85, -2.65], [2.2, 1.2, 0.15]], Desk: [[1.2, 0.45, -2.15], [2.5, 0.95, 0.9]], 'Wall clock': [[1.2, 2.3, -2.65], [0.7, 0.7, 0.15]], 'Filing cabinet': [[-0.45, 0.65, -2.4], [0.75, 1.3, 0.65]], Monitor: [[1.2, 1.3, -2.3], [1.0, 0.6, 0.2]], Plant: [[3.0, 0.7, -2.4], [0.6, 1.4, 0.6]] },
  Library: { 'Left bookcase': [[-2.2, 1.3, -2.55], [2.5, 2.6, 0.5]], 'Right bookcase': [[2.2, 1.3, -2.55], [2.5, 2.6, 0.5]], Armchair: [[0, 0.5, -1.5], [1.4, 1.0, 1.1]], Window: [[0, 1.5, -2.65], [1.5, 2.2, 0.15]] },
  Workshop: { Pegboard: [[-0.6, 1.9, -2.65], [3.8, 1.6, 0.15]], Workbench: [[-0.6, 0.5, -2.3], [3.4, 1.0, 0.8]], Shelf: [[2.6, 1.9, -2.5], [1.9, 0.6, 0.5]], 'Tool chest': [[2.6, 0.5, -2.3], [1.1, 1.0, 0.6]], Sawhorse: [[0, 0.45, 0.8], [1.0, 0.9, 0.4]] },
  Bathroom: { Bathtub: [[-2.9, 0.3, -1.2], [1.0, 0.6, 2.2]], Vanity: [[0.6, 0.45, -2.45], [1.4, 0.9, 0.55]], Mirror: [[0.6, 1.9, -2.7], [1.0, 1.1, 0.1]], Toilet: [[2.8, 0.45, -2.3], [0.7, 0.9, 0.7]], Window: [[1.9, 1.9, -2.7], [1.1, 1.0, 0.1]], 'Towel rail': [[-1.4, 1.4, -2.65], [1.0, 0.7, 0.1]] },
  Garden: { Tree: [[-3.3, 1.8, -2.4], [2.6, 3.6, 2.6]], Fence: [[0, 0.6, -4.2], [12, 1.2, 0.2]], 'Flower bed': [[0, 0.3, -1.3], [4.8, 0.6, 1.2]], Lawn: [[0, 0.05, 1.0], [6, 0.1, 3]] },
  Shed: { 'Top shelf': [[1.9, 2.2, -2.5], [2.9, 0.5, 0.5]], 'Lower shelf': [[1.9, 1.6, -2.5], [2.9, 0.5, 0.5]], 'Tool wall': [[-2.7, 1.3, -2.6], [1.2, 2.4, 0.2]], Workbench: [[-0.1, 0.5, -1.9], [2.2, 1.0, 0.7]], Floor: [[2.4, 0.3, 0.3], [1.3, 0.6, 0.9]] },
  Generic: { Desk: [[-1.0, 0.5, -2.2], [2.2, 1.0, 0.9]], Window: [[1.8, 1.7, -2.7], [1.3, 1.2, 0.1]], Floor: [[0, 0.05, 0.6], [4, 0.1, 2]] },
}
const WALL_Z = [2.0, 1.15, 0.4], WALL_Y = [1.95, 1.25]
const BOX_SPOTS = [[-3.05, 1.9], [-3.05, 1.3], [-3.05, 0.7], [-3.05, 0.1], [3.05, 1.9], [3.05, 1.3], [3.05, 0.7], [3.05, 0.1]]

function badge(g, n, x, y, z) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex(n), transparent: true, depthTest: false }))
  s.scale.set(0.42, 0.42, 1); s.position.set(x, y, z); s.renderOrder = 10; g.add(s)
}

// A hanging picture: the memory's sticker in a wooden frame.
function frame(g, picks, item, emoji, side, index) {
  const z = WALL_Z[index % 3], y = WALL_Y[Math.floor(index / 3)]
  const root = new THREE.Group(); root.position.set(side * (HW - 0.05), y, z); root.rotation.y = side < 0 ? LEFT : RIGHT; g.add(root)
  const f = box(0.56, 0.56, 0.05, DARK, 0, 0, 0, root); box(0.46, 0.46, 0.02, '#efe8da', 0, 0, 0.03, root)
  const art = plane(0.34, 0.34, stickerMat(emoji), 0, 0, 0.045, 0, 0, root)
  ;[f, art].forEach((m) => { m.userData.pick = { type: 'item', item }; picks.push(m) })
}

// A small storage box with a name label and a count.
function storageBox(g, picks, b, count, index) {
  const [x, z] = BOX_SPOTS[index % BOX_SPOTS.length], side = x < 0 ? -1 : 1
  const root = new THREE.Group(); root.position.set(x, 0.19, z); root.rotation.y = side < 0 ? LEFT : RIGHT; g.add(root)
  const body = box(0.5, 0.38, 0.5, '#c7a46b', 0, 0, 0, root); box(0.52, 0.04, 0.52, '#b08d4f', 0, 0.2, 0, root)
  const tag = plane(0.4, 0.1, new THREE.MeshBasicMaterial({ map: labelTex(b.name.slice(0, 16), '#f1ebdd'), transparent: true }), 0, 0.02, 0.255, 0, 0, root)
  ;[body, tag].forEach((m) => { m.userData.pick = { type: 'box', id: b.id }; picks.push(m) })
  badge(g, count, x * 0.97, 0.62, z)
}

// data = { items: [{item, emoji}], boxes: [{id, name}] }
export function buildRoom(room, data, ctx = {}) {
  const g = new THREE.Group(), picks = []
  const make = ROOMS[room.name] || ROOMS.Generic
  make(g, room.theme ? lighten(room.theme) : '#d9cbb2', { picks, shedId: ctx.shedId })
  const garden = room.name === 'Garden'
  const emoji = new Map((data?.items || []).map((i) => [i.item.id, i.emoji]))
  const boxes = data?.boxes || []
  const lay = layoutRoom(room.name, (data?.items || []).map((i) => i.item), boxes)
  // furniture you can tap, with a count badge when it holds memories
  const hits = HITS[room.name] || HITS.Generic
  Object.entries(hits).forEach(([name, [c, sz]]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...sz), invisible()); m.position.set(...c); m.userData.pick = { type: 'place', name }; g.add(m); picks.push(m)
    const n = lay.by[name]?.length || 0
    if (n) badge(g, n, c[0], c[1] + sz[1] / 2 + 0.2, c[2] + sz[2] / 2 + 0.15)
  })
  lay.left.forEach((it, i) => frame(g, picks, it, emoji.get(it.id), -1, i))
  lay.right.forEach((it, i) => frame(g, picks, it, emoji.get(it.id), 1, i))
  boxes.forEach((b, i) => storageBox(g, picks, b, lay.boxes[b.id].length, i))
  return { group: g, picks, cam: garden ? GARDEN_CAM : ROOM_CAM, bg: garden ? gradTex('#7fa6c9', '#e8cfa3') : new THREE.Color('#1a1410'), envI: garden ? 0.55 : 0.32 }
}

function lighten(hex) { return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), 0.04).getHexString() }
