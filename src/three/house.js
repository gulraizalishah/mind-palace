import { THREE, box, cyl, sph, plane, mat, glow, brickTex, checkerTex, plankTex, gradTex, glowTex, labelTex, hitArea } from './kit'

const lit = (cnt, r) => (r ? cnt(r.id) > 0 : false)

// ---------------------------------------------------------------- the house from the street
export function buildExterior(floors, cnt) {
  const g = new THREE.Group(), picks = []
  const nF = floors.length, fh = 2.6, HW = 4, HD = 2.6, top = fh * nF
  g.add(new THREE.HemisphereLight(0xbcd0e8, 0x3d4a3a, 1.0))
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.1); sun.position.set(6, 10, 9); g.add(sun)
  box(80, 0.2, 80, '#4a7344', 0, -0.1, 0, g); box(1.7, 0.03, 12, '#cdbf9d', 0, 0.015, HD + 6, g)
  box(2 * HW, top, 2 * HD, new THREE.MeshLambertMaterial({ map: brickTex(5, 1.6 * nF) }), 0, top / 2, 0, g)
  const shape = new THREE.Shape(); shape.moveTo(-HW - 0.4, 0); shape.lineTo(HW + 0.4, 0); shape.lineTo(0, 2.1); shape.closePath()
  const roofGeo = new THREE.ExtrudeGeometry(shape, { depth: 2 * HD + 0.8, bevelEnabled: false }); roofGeo.translate(0, 0, -(HD + 0.4))
  const roof = new THREE.Mesh(roofGeo, mat('#323844')); roof.position.y = top; g.add(roof)
  box(0.7, 1.8, 0.7, '#5a4a42', 2.4, top + 1.2, -0.6, g)
  for (let i = 0; i < nF - 1; i++) box(2 * HW + 0.12, 0.1, 2 * HD + 0.12, '#6f5a48', 0, fh * (i + 1), 0, g)

  const win = (room, x, y) => {
    const on = lit(cnt, room)
    box(0.95, 1.15, 0.1, '#efe8da', x, y, HD + 0.02, g)
    box(0.72, 0.92, 0.12, on ? glow('#f2c66d') : '#26344b', x, y, HD + 0.03, g)
    box(0.04, 0.92, 0.14, '#efe8da', x, y, HD + 0.04, g); box(0.72, 0.04, 0.14, '#efe8da', x, y, HD + 0.04, g)
    if (on) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(2.6, 2.6, 1); s.position.set(x, y, HD + 0.35); g.add(s) }
  }
  floors.forEach((fl, i) => {
    const y = fh * i + 1.55
    ;[-2.9, -1.6].forEach((x, j) => win(fl.L[j], x, y)); ;[1.6, 2.9].forEach((x, j) => win(fl.R[j], x, y))
    if (i > 0 && i < nF - 1) { box(0.85, 1.15, 0.1, '#efe8da', 0, y, HD + 0.02, g); box(0.66, 0.95, 0.12, '#26344b', 0, y, HD + 0.03, g); box(1.5, 0.08, 0.5, '#b08d4f', 0, y - 0.75, HD + 0.25, g) }
    if (i > 0 && i === nF - 1) { const c = cyl(0.5, 0.5, 0.1, '#26344b', 0, y, HD + 0.04, g, 24); c.rotation.x = Math.PI / 2 }
  })

  // front door (opens when tapped)
  box(1.4, 2.4, 0.14, '#e8dfcf', 0, 1.2, HD + 0.03, g); box(1.0, 2.1, 0.05, glow('#f5d08a'), 0, 1.07, HD + 0.06, g)
  const pivot = new THREE.Group(); pivot.position.set(-0.5, 0, HD + 0.11); g.add(pivot)
  const panel = box(1.0, 2.1, 0.07, '#4a3022', 0.5, 1.05, 0, pivot)
  ;[0.62, 1.52].forEach((y) => box(0.62, 0.7, 0.03, '#3a2418', 0.5, y, 0.04, pivot)); sph(0.05, '#c9a24b', 0.85, 1.0, 0.07, pivot)
  panel.userData.pick = { type: 'door', token: 'hall:0', pivot, angle: -1.75, fly: { pos: [0, 1.45, HD + 0.4], target: [0, 1.4, -4] } }
  picks.push(panel)
  hitArea(2.2, 3.0, 0, 1.5, HD + 0.6, 0, panel.userData.pick, g, picks)
  box(1.9, 0.14, 0.7, '#9a9387', 0, 0.07, HD + 0.5, g); box(2.4, 0.14, 0.7, '#857f74', 0, 0.0, HD + 1.0, g)
  ;[-4.3, 4.3].forEach((x) => sph(0.8, '#2d4632', x, 0.5, HD + 0.6, g)); ;[-6.2, 6.4].forEach((x, i) => { cyl(0.2, 0.28, 2.2, '#6f4f36', x, 1.1, 1 - i, g); sph(1.3, '#3f6a3a', x, 3.0, 1 - i, g, 12) })
  sph(1.2, glow('#f1e8d0'), -16, 15, -22, g, 20)
  return {
    group: g, picks, bg: gradTex('#232f4a', '#d49a6a'),
    cam: { mode: 'orbit', target: [0, top * 0.42, 0], r: 8.2 + nF * 1.5, rMin: 6, rMax: 22, az: 0.28, el: 0.16, azMin: -1.7, azMax: 1.7, elMin: 0.03, elMax: 0.85 },
  }
}

// ---------------------------------------------------------------- one floor's hall
const HW_ = 2.2, HH = 3.3, HL = 13

function hallDoor(g, picks, room, side, z, n) {
  const x = side * (HW_ - 0.06)
  box(0.12, 2.5, 1.25, '#b08d4f', x, 1.25, z, g)
  box(0.05, 2.2, 1.0, glow(room.theme || '#ccc'), side * (HW_ - 0.03), 1.1, z, g)
  const pivot = new THREE.Group(); pivot.position.set(side * (HW_ - 0.1), 0, z + 0.5); g.add(pivot)
  const panel = box(0.07, 2.2, 1.0, '#6b4a32', 0, 1.1, -0.5, pivot)
  ;[0.62, 1.55].forEach((y) => box(0.03, 0.8, 0.66, '#4a3220', -side * 0.04, y, -0.5, pivot)); sph(0.05, '#d1ac55', -side * 0.08, 1.05, -0.88, pivot)
  const plate = plane(1.1, 0.28, new THREE.MeshBasicMaterial({ map: labelTex(`${room.name} · ${n}`), transparent: true }), side * (HW_ - 0.13), 2.8, z, 0, -side * Math.PI / 2, g)
  panel.userData.pick = { type: 'door', token: `room:${room.id}`, pivot, angle: side * 1.65, fly: { pos: [side * 0.5, 1.6, z + 0.3], target: [side * 6, 1.4, z] } }
  picks.push(panel)
  hitArea(1.5, 2.9, side * (HW_ - 0.2), 1.45, z, side * Math.PI / 2, panel.userData.pick, g, picks)
  return plate
}

export function buildHall(floor, idx, total, cnt) {
  const g = new THREE.Group(), picks = []
  const zEnd = -HL / 2
  g.add(new THREE.AmbientLight(0xfff4e0, 0.8))
  const p1 = new THREE.PointLight(0xffe4a1, 1.1, 16); p1.position.set(0, HH - 0.9, 0); g.add(p1)
  const p2 = new THREE.PointLight(0xffe4a1, 0.7, 12); p2.position.set(0, HH - 0.9, 4.5); g.add(p2)
  const floorMat = new THREE.MeshLambertMaterial({ map: idx === 0 ? checkerTex('#e6e0d2', '#2f343d', 2, 10) : plankTex('#8a6446', '#7c5a3e', 2, 6) })
  plane(2 * HW_, HL, floorMat, 0, 0, 0, -Math.PI / 2, 0, g)
  plane(2 * HW_, HL, mat('#e3dccd'), 0, HH, 0, Math.PI / 2, 0, g)
  for (let z = 5; z > zEnd; z -= 2.6) box(2 * HW_, 0.16, 0.24, '#b9ae97', 0, HH - 0.08, z, g)
  const wallM = mat('#cfc4b0')
  plane(HL, HH, wallM, -HW_, HH / 2, 0, 0, Math.PI / 2, g); plane(HL, HH, wallM, HW_, HH / 2, 0, 0, -Math.PI / 2, g); plane(2 * HW_, HH, wallM, 0, HH / 2, zEnd, 0, 0, g)
  ;[-1, 1].forEach((s) => { box(0.05, 1.1, HL, '#8a7a62', s * (HW_ - 0.03), 0.55, 0, g); box(0.07, 0.06, HL, '#b08d4f', s * (HW_ - 0.04), 1.12, 0, g) })
  box(1.4, 0.02, HL, '#6e2f36', 0, 0.011, 0, g); box(0.06, 0.025, HL, '#b08d4f', -0.66, 0.013, 0, g); box(0.06, 0.025, HL, '#b08d4f', 0.66, 0.013, 0, g)
  // chandelier
  cyl(0.015, 0.015, 0.7, '#8a7a62', 0, HH - 0.35, 0, g); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24), mat('#b08d4f')); ring.rotation.x = Math.PI / 2; ring.position.set(0, HH - 0.8, 0); g.add(ring)
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; cyl(0.03, 0.03, 0.16, '#f4efe3', Math.cos(a) * 0.4, HH - 0.7, Math.sin(a) * 0.4, g, 8); sph(0.045, glow('#ffe4a1'), Math.cos(a) * 0.4, HH - 0.58, Math.sin(a) * 0.4, g, 8) }
  ;[-1, 1].forEach((s) => [3.4, -0.6, -4.4].forEach((z) => { sph(0.09, glow('#ffe4a1'), s * (HW_ - 0.14), 2.0, z, g, 10); box(0.06, 0.2, 0.1, '#b08d4f', s * (HW_ - 0.09), 1.85, z, g) }))

  floor.L.slice(0, 3).forEach((r, i) => hallDoor(g, picks, r, -1, [2.4, -1.0, -4.4][i], cnt(r.id)))
  floor.R.slice(0, 3).forEach((r, i) => hallDoor(g, picks, r, 1, [2.4, -1.0, -4.4][i], cnt(r.id)))

  if (idx < total - 1) { // staircase up at the end of the hall
    const n = 9, sh = 0.3, sd = 0.45
    for (let i = 0; i < n; i++) {
      const s = box(2.0, (i + 1) * sh, sd, i % 2 ? '#7a5a3e' : '#6b4a32', 0, ((i + 1) * sh) / 2, zEnd + (n - i) * sd - sd / 2, g)
      s.userData.pick = { type: 'stairs', token: `hall:${idx + 1}`, fly: { pos: [0, 3.1, zEnd + 1.2], target: [0, 3.3, zEnd - 4] } }; picks.push(s)
      box(2.0, 0.03, sd + 0.01, '#a98258', 0, (i + 1) * sh + 0.01, zEnd + (n - i) * sd - sd / 2, g)
    }
    box(2.2, 0.7, 0.06, '#120d0a', 0, HH - 0.35, zEnd + 0.04, g)
    ;[-1.1, 1.1].forEach((x) => { const rail = box(0.06, 0.06, Math.hypot(n * sd, n * sh), '#b08d4f', x, 0.95 + (n * sh) / 2, zEnd + (n * sd) / 2, g); rail.rotation.x = Math.atan2(n * sh, n * sd) })
    plane(1.3, 0.32, new THREE.MeshBasicMaterial({ map: labelTex('↑ Upstairs'), transparent: true }), 0, 2.95, zEnd + 0.1, 0, 0, g)
  } else { // top floor: arched window at the end
    box(1.8, 2.4, 0.06, '#efe8da', 0, 1.6, zEnd + 0.03, g)
    const wm = new THREE.MeshBasicMaterial({ map: gradTex('#7fa6c9', '#e8cfa3') }); plane(1.6, 2.2, wm, 0, 1.6, zEnd + 0.07, 0, 0, g)
    box(0.05, 2.2, 0.04, '#efe8da', 0, 1.6, zEnd + 0.1, g); box(1.6, 0.05, 0.04, '#efe8da', 0, 1.9, zEnd + 0.1, g)
  }
  if (idx > 0) { // stairwell going down, just ahead on the left
    const hole = plane(1.7, 1.5, new THREE.MeshBasicMaterial({ color: '#16100c' }), -0.95, 0.025, 3.7, -Math.PI / 2, 0, g)
    ;[0, 1, 2, 3].forEach((i) => plane(1.6, 0.04, new THREE.MeshBasicMaterial({ color: '#4a3626' }), -0.95, 0.03, 3.2 + i * 0.35, -Math.PI / 2, 0, g))
    box(0.05, 0.9, 1.5, '#b08d4f', -1.82, 0.45, 3.7, g); box(0.05, 0.9, 1.5, '#b08d4f', -0.08, 0.45, 3.7, g)
    hole.userData.pick = { type: 'stairs', token: `hall:${idx - 1}`, fly: { pos: [-0.95, 0.5, 3.9], target: [-0.95, -1.5, 3.0] } }; picks.push(hole)
    plane(1.4, 0.35, new THREE.MeshBasicMaterial({ map: labelTex('↓ Downstairs'), transparent: true }), -0.95, 1.1, 2.9, 0, 0, g)
  }
  return { group: g, picks, bg: new THREE.Color('#120d0a'), cam: { mode: 'look', pos: [0, 1.6, 6.0], target: [0, 1.45, -6], yaw: 0.9, pitch: 0.4 } }
}
