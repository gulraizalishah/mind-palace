import { THREE, box, cyl, sph, plane, mat, glow, brickTex, checkerTex, plankTex, gradTex, glowTex, labelTex, hitArea } from './kit'

const lit = (cnt, r) => (r ? cnt(r.id) > 0 : false)
const PI = Math.PI

// ---------------------------------------------------------------- the house from the street
export function buildExterior(floors, cnt, previewHall) {
  const g = new THREE.Group(), picks = []
  const nF = floors.length, fh = 2.6, HW = 4, HD = 2.6, top = fh * nF
  g.add(new THREE.HemisphereLight(0xbcd0e8, 0x3d4a3a, 1.0))
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.1); sun.position.set(6, 10, 9); g.add(sun)
  box(120, 0.2, 120, '#4a7344', 0, -0.1, 0, g); box(1.7, 0.03, 12, '#cdbf9d', 0, 0.015, HD + 6, g)
  box(2 * HW, top, 2 * HD, new THREE.MeshLambertMaterial({ map: brickTex(5, 1.6 * nF) }), 0, top / 2, 0, g)
  const shape = new THREE.Shape(); shape.moveTo(-HW - 0.4, 0); shape.lineTo(HW + 0.4, 0); shape.lineTo(0, 2.1); shape.closePath()
  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 2 * HD + 0.8, bevelEnabled: false }); roofGeo.translate(0, 0, -(HD + 0.4))
  const roof = new THREE.Mesh(roofGeo, mat('#323844')); roof.position.y = top; g.add(roof)
  box(0.7, 1.8, 0.7, '#5a4a42', 2.4, top + 1.2, -0.6, g)
  for (let i = 0; i < nF - 1; i++) box(2 * HW + 0.12, 0.1, 2 * HD + 0.12, '#6f5a48', 0, fh * (i + 1), 0, g)

  // windows: front (rooms, glow when they hold something), both sides and the back
  const pane = (x, y, z, ry, on) => {
    const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = ry; g.add(w)
    box(0.95, 1.15, 0.1, '#efe8da', 0, 0, 0.02, w); box(0.72, 0.92, 0.12, on ? glow('#f2c66d') : '#26344b', 0, 0, 0.03, w)
    box(0.04, 0.92, 0.14, '#efe8da', 0, 0, 0.04, w); box(0.72, 0.04, 0.14, '#efe8da', 0, 0, 0.04, w)
    if (on) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(2.6, 2.6, 1); s.position.set(0, 0, 0.35); w.add(s) }
  }
  floors.forEach((fl, i) => {
    const y = fh * i + 1.55
    ;[-2.9, -1.6].forEach((x, j) => pane(x, y, HD, 0, lit(cnt, fl.L[j]))); ;[1.6, 2.9].forEach((x, j) => pane(x, y, HD, 0, lit(cnt, fl.R[j])))
    ;[-1.4, 1.4].forEach((z, j) => { pane(-HW, y, z, -PI / 2, (i + j) % 2 === 0); pane(HW, y, z, PI / 2, (i + j) % 2 === 1) })
    ;[-2.9, -1.0, 1.0, 2.9].forEach((x, j) => pane(x, y, -HD, PI, (i * 3 + j) % 3 === 0))
    if (i > 0 && i < nF - 1) { box(0.85, 1.15, 0.1, '#efe8da', 0, y, HD + 0.02, g); box(0.66, 0.95, 0.12, '#26344b', 0, y, HD + 0.03, g); box(1.5, 0.08, 0.5, '#b08d4f', 0, y - 0.75, HD + 0.25, g) }
    if (i > 0 && i === nF - 1) { const c = cyl(0.5, 0.5, 0.1, '#26344b', 0, y, HD + 0.04, g, 24); c.rotation.x = PI / 2 }
  })

  // front door: opens onto a picture of the hall behind it
  ;[-0.62, 0.62].forEach((x) => box(0.16, 2.3, 0.16, '#e8dfcf', x, 1.15, HD + 0.04, g)); box(1.4, 0.16, 0.16, '#e8dfcf', 0, 2.3, HD + 0.04, g)
  const tex = previewHall?.()
  if (tex) plane(1.08, 2.15, new THREE.MeshBasicMaterial({ map: tex }), 0, 1.08, HD + 0.03, 0, 0, g); else box(1.0, 2.1, 0.05, glow('#f5d08a'), 0, 1.07, HD + 0.03, g)
  const pivot = new THREE.Group(); pivot.position.set(-0.5, 0, HD + 0.11); g.add(pivot)
  const panel = box(1.0, 2.1, 0.07, '#4a3022', 0.5, 1.05, 0, pivot)
  ;[0.62, 1.52].forEach((y) => box(0.62, 0.7, 0.03, '#3a2418', 0.5, y, 0.04, pivot)); sph(0.05, '#c9a24b', 0.85, 1.0, 0.07, pivot)
  const pick = { type: 'door', token: 'hall:0', pivot, angle: -1.75, fly: { pos: [0, 1.45, HD + 0.5], target: [0, 1.4, -4] } }
  panel.userData.pick = pick; picks.push(panel)
  hitArea(2.2, 3.0, 0, 1.5, HD + 0.6, 0, pick, g, picks)
  box(1.9, 0.14, 0.7, '#9a9387', 0, 0.07, HD + 0.5, g); box(2.4, 0.14, 0.7, '#857f74', 0, 0.0, HD + 1.0, g)
  ;[-4.3, 4.3].forEach((x) => sph(0.8, '#2d4632', x, 0.5, HD + 0.6, g))

  // trees: a few in front, and a full backdrop behind the palace
  const round = (x, z, s) => { cyl(0.18 * s, 0.26 * s, 2.2 * s, '#6f4f36', x, 1.1 * s, z, g, 8); sph(1.3 * s, '#3f6a3a', x, 2.9 * s, z, g, 10); sph(0.9 * s, '#4a7a44', x + 0.7 * s, 2.5 * s, z + 0.3 * s, g, 8) }
  const pine = (x, z, s) => { cyl(0.15 * s, 0.2 * s, 1.0 * s, '#5a4030', x, 0.5 * s, z, g, 8); [[1.5, 1.0], [1.15, 2.0], [0.8, 2.9]].forEach(([r, y], i) => { const c = new THREE.Mesh(new THREE.ConeGeometry(r * s, 1.5 * s, 9), mat(i % 2 ? '#2f5a3a' : '#2a4f34')); c.position.set(x, y * s + 0.5 * s, z); g.add(c) }) }
  round(-6.2, 1, 1); round(6.4, 0, 1.05)
  const back = [[-14, -9, 1.3, 0], [-10, -12, 1.2, 1], [-6, -9.5, 1.1, 1], [-2, -13, 1.4, 0], [3, -10, 1.2, 1], [7, -13, 1.3, 0], [11, -9.5, 1.15, 1], [15, -12, 1.4, 0], [-17, -5, 1.3, 1], [17, -4, 1.2, 1], [-12, -3, 1, 0], [12, -2, 1.1, 0], [-8, -6.5, 0.95, 1], [8.5, -6.5, 1, 1], [0, -8, 1.0, 0], [-4.5, -7, 0.9, 0], [5, -7.2, 0.95, 1], [-21, -9, 1.5, 1], [21, -8, 1.5, 0], [-6.5, -16, 1.6, 1], [6, -16.5, 1.5, 1]]
  back.forEach(([x, z, s, k]) => (k ? pine(x, z, s) : round(x, z, s)))
  ;[[-24, -26, 14], [-4, -30, 18], [20, -27, 15]].forEach(([x, z, r]) => { const h = sph(r, '#2f4a35', x, -r * 0.55, z, g, 12); h.scale.set(1.6, 0.8, 1) })
  sph(1.2, glow('#f1e8d0'), -16, 15, -22, g, 20)
  return {
    group: g, picks, bg: gradTex('#232f4a', '#d49a6a'),
    cam: { mode: 'orbit', target: [0, top * 0.42, 0], r: 8.2 + nF * 1.5, rMin: 6, rMax: 24, az: 0.28, el: 0.16, azMin: -3.2, azMax: 3.2, elMin: 0.03, elMax: 0.85 },
  }
}

// ---------------------------------------------------------------- one floor's hall
const HW_ = 2.2, HH = 3.3, HL = 13
const DOOR_Z = [2.0, -0.9, -2.8]

function hallDoor(g, picks, room, side, z, n, tex) {
  const x = side * (HW_ - 0.06)
  ;[-0.62, 0.62].forEach((dz) => box(0.12, 2.5, 0.14, '#b08d4f', x, 1.25, z + dz, g)); box(0.12, 0.14, 1.38, '#b08d4f', x, 2.43, z, g)
  // behind the door: a live picture of the room inside, so you see in as it opens
  if (tex) plane(1.1, 2.3, new THREE.MeshBasicMaterial({ map: tex }), side * (HW_ - 0.035), 1.15, z, 0, -side * PI / 2, g)
  else box(0.04, 2.2, 1.0, glow(room.theme || '#ccc'), side * (HW_ - 0.035), 1.1, z, g)
  const pivot = new THREE.Group(); pivot.position.set(side * (HW_ - 0.1), 0, z + 0.5); g.add(pivot)
  const panel = box(0.07, 2.2, 1.0, '#6b4a32', 0, 1.1, -0.5, pivot)
  ;[0.62, 1.55].forEach((y) => box(0.03, 0.8, 0.66, '#4a3220', -side * 0.04, y, -0.5, pivot)); sph(0.05, '#d1ac55', -side * 0.08, 1.05, -0.88, pivot)
  plane(1.1, 0.28, new THREE.MeshBasicMaterial({ map: labelTex(`${room.name} · ${n}`), transparent: true }), side * (HW_ - 0.13), 2.8, z, 0, -side * PI / 2, g)
  const pick = { type: 'door', token: `room:${room.id}`, pivot, angle: side * 1.65, fly: { pos: [side * 0.5, 1.6, z + 0.3], target: [side * 6, 1.4, z] } }
  panel.userData.pick = pick; picks.push(panel)
  hitArea(1.5, 2.9, side * (HW_ - 0.2), 1.45, z, side * PI / 2, pick, g, picks)
}

export function buildHall(floor, idx, total, cnt, previewRoom) {
  const g = new THREE.Group(), picks = []
  const zEnd = -HL / 2
  g.add(new THREE.AmbientLight(0xfff4e0, 0.8))
  const p1 = new THREE.PointLight(0xffe4a1, 1.1, 16); p1.position.set(0, HH - 0.9, 0); g.add(p1)
  const p2 = new THREE.PointLight(0xffe4a1, 0.7, 12); p2.position.set(0, HH - 0.9, 4.5); g.add(p2)
  const floorMat = new THREE.MeshLambertMaterial({ map: idx === 0 ? checkerTex('#e6e0d2', '#2f343d', 2, 10) : plankTex('#8a6446', '#7c5a3e', 2, 6) })
  plane(2 * HW_, HL, floorMat, 0, 0, 0, -PI / 2, 0, g)
  plane(2 * HW_, HL, mat('#e3dccd'), 0, HH, 0, PI / 2, 0, g)
  for (let z = 5; z > zEnd; z -= 2.6) box(2 * HW_, 0.16, 0.24, '#b9ae97', 0, HH - 0.08, z, g)
  const wallM = mat('#cfc4b0')
  plane(HL, HH, wallM, -HW_, HH / 2, 0, 0, PI / 2, g); plane(HL, HH, wallM, HW_, HH / 2, 0, 0, -PI / 2, g); plane(2 * HW_, HH, wallM, 0, HH / 2, zEnd, 0, 0, g)
  ;[-1, 1].forEach((s) => { box(0.05, 1.1, HL, '#8a7a62', s * (HW_ - 0.03), 0.55, 0, g); box(0.07, 0.06, HL, '#b08d4f', s * (HW_ - 0.04), 1.12, 0, g) })
  box(1.4, 0.02, 9.9, '#6e2f36', 0, 0.011, 1.55, g); box(0.06, 0.025, 9.9, '#b08d4f', -0.66, 0.013, 1.55, g); box(0.06, 0.025, 9.9, '#b08d4f', 0.66, 0.013, 1.55, g)
  cyl(0.015, 0.015, 0.7, '#8a7a62', 0, HH - 0.35, 0, g); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24), mat('#b08d4f')); ring.rotation.x = PI / 2; ring.position.set(0, HH - 0.8, 0); g.add(ring)
  for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; cyl(0.03, 0.03, 0.16, '#f4efe3', Math.cos(a) * 0.4, HH - 0.7, Math.sin(a) * 0.4, g, 8); sph(0.045, glow('#ffe4a1'), Math.cos(a) * 0.4, HH - 0.58, Math.sin(a) * 0.4, g, 8) }
  ;[-1, 1].forEach((s) => [4.4, 1.9, -1.1].forEach((z) => { sph(0.09, glow('#ffe4a1'), s * (HW_ - 0.14), 2.0, z, g, 10); box(0.06, 0.2, 0.1, '#b08d4f', s * (HW_ - 0.09), 1.85, z, g) }))

  floor.L.slice(0, 3).forEach((r, i) => hallDoor(g, picks, r, -1, DOOR_Z[i], cnt(r.id), previewRoom?.(r)))
  floor.R.slice(0, 3).forEach((r, i) => hallDoor(g, picks, r, 1, DOOR_Z[i], cnt(r.id), previewRoom?.(r)))

  // the end of the hall: stairs up on the right, stairs down on the left, side by side
  if (idx < total - 1) {
    const n = 8, sh = 0.34, sd = 0.4, cx = 1.0
    for (let i = 0; i < n; i++) {
      const zc = zEnd + (n - i) * sd - sd / 2
      const s = box(1.5, (i + 1) * sh, sd, i % 2 ? '#7a5a3e' : '#6b4a32', cx, ((i + 1) * sh) / 2, zc, g)
      s.userData.pick = { type: 'stairs', token: `hall:${idx + 1}`, fly: { pos: [cx, 3.0, zEnd + 1.0], target: [cx, 3.2, zEnd - 4] } }; picks.push(s)
      box(1.5, 0.03, sd + 0.01, '#a98258', cx, (i + 1) * sh + 0.01, zc, g)
    }
    hitArea(1.8, 2.6, cx, 1.3, zEnd + n * sd + 0.3, 0, { type: 'stairs', token: `hall:${idx + 1}`, fly: { pos: [cx, 3.0, zEnd + 1.0], target: [cx, 3.2, zEnd - 4] } }, g, picks)
    box(1.7, 0.58, 0.06, '#120d0a', cx, HH - 0.3, zEnd + 0.04, g)
    ;[cx - 0.8, cx + 0.8].forEach((x) => { const rail = box(0.06, 0.06, Math.hypot(n * sd, n * sh), '#b08d4f', x, 0.95 + (n * sh) / 2, zEnd + (n * sd) / 2, g); rail.rotation.x = Math.atan2(n * sh, n * sd) })
    plane(1.3, 0.32, new THREE.MeshBasicMaterial({ map: labelTex('↑ Upstairs'), transparent: true }), cx, 2.95, zEnd + 0.1, 0, 0, g)
  } else {
    box(1.8, 2.4, 0.06, '#efe8da', 0.6, 1.6, zEnd + 0.03, g)
    plane(1.6, 2.2, new THREE.MeshBasicMaterial({ map: gradTex('#7fa6c9', '#e8cfa3') }), 0.6, 1.6, zEnd + 0.07, 0, 0, g)
    box(0.05, 2.2, 0.04, '#efe8da', 0.6, 1.6, zEnd + 0.1, g); box(1.6, 0.05, 0.04, '#efe8da', 0.6, 1.9, zEnd + 0.1, g)
  }
  if (idx > 0) {
    const cx = -1.0, z0 = -6.3, z1 = -4.3, down = { type: 'stairs', token: `hall:${idx - 1}`, fly: { pos: [cx, 0.6, -4.1], target: [cx, -2.0, -6.5] } }
    const hole = plane(1.5, z1 - z0, new THREE.MeshBasicMaterial({ color: '#16100c' }), cx, 0.026, (z0 + z1) / 2, -PI / 2, 0, g)
    ;[0, 1, 2, 3, 4].forEach((i) => plane(1.4, 0.05, new THREE.MeshBasicMaterial({ color: '#4a3626' }), cx, 0.03, z1 - 0.3 - i * 0.38, -PI / 2, 0, g))
    ;[cx - 0.78, cx + 0.78].forEach((x) => box(0.05, 0.9, z1 - z0, '#b08d4f', x, 0.45, (z0 + z1) / 2, g)); box(1.6, 0.9, 0.05, '#b08d4f', cx, 0.45, z1 + 0.02, g)
    hole.userData.pick = down; picks.push(hole)
    hitArea(1.9, 1.5, cx, 0.7, z1 + 0.15, 0, down, g, picks)
    plane(1.3, 0.32, new THREE.MeshBasicMaterial({ map: labelTex('↓ Downstairs'), transparent: true }), cx, 1.25, z1 + 0.06, 0, 0, g)
  }
  return { group: g, picks, bg: new THREE.Color('#120d0a'), cam: { mode: 'look', pos: [0, 1.6, 6.2], target: [0, 1.45, -6], yaw: 0.9, pitch: 0.4, hfov: 80 }, previewCam: { pos: [0, 1.55, 6.2], target: [0, 1.45, -6] } }
}
