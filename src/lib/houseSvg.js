// Draws the palace as SVG strings. Rooms come from the database (floor, side, sort_order, theme).
const WX = 120, TY = 170, BY = 290
const yt = (x) => (TY * x) / WX
const yb = (x) => 480 - ((480 - BY) * x) / WX
const LP = (a, b, t) => a + (b - a) * t
const n1 = (n) => n.toFixed(1)
const RG = [[6, 48], [58, 90], [98, 116]] // door slots on a hall wall, near to far
export const FLOOR_NAMES = ['Ground floor', 'First floor', 'Second floor', 'Third floor']
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function door(room, count, A, B, C, D) {
  const P = (u, v) => {
    const bx = LP(A[0], D[0], u), by = LP(A[1], D[1], u), tx = LP(B[0], C[0], u), ty = LP(B[1], C[1], u)
    return [LP(bx, tx, v), LP(by, ty, v)]
  }
  const q = (u0, u1, v0, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)].map((p) => p.map(n1).join(',')).join(' ')
  const k = P(0.8, 0.48), tp = P(0.5, 1)
  const w = Math.abs(D[0] - A[0]), f = Math.max(8, Math.min(13, w / 3.6)), pw = room.name.length * f * 0.6 + 10
  return `<g class="door" data-go="room:${room.id}" role="button" tabindex="0" aria-label="${esc(room.name)}, ${count} saved">
<polygon points="${q(-0.08, 1.08, -0.02, 1.1)}" fill="#b08d4f"/><polygon points="${q(0, 1, 0, 1)}" fill="${esc(room.theme || '#ccc')}"/>
<g class="pnl"><polygon points="${q(0, 1, 0, 1)}" fill="#5e4129"/><polygon points="${q(0.14, 0.86, 0.07, 0.46)}" fill="#4a3220" stroke="#2f1d11"/><polygon points="${q(0.14, 0.86, 0.54, 0.93)}" fill="#4a3220" stroke="#2f1d11"/><circle cx="${n1(k[0])}" cy="${n1(k[1])}" r="${n1(f / 4)}" fill="#d1ac55"/></g>
<rect x="${n1(tp[0] - pw / 2)}" y="${n1(tp[1] - f - 8)}" width="${n1(pw)}" height="${n1(f + 4)}" rx="2" fill="#b08d4f"/><text x="${n1(tp[0])}" y="${n1(tp[1] - 7)}" font-size="${n1(f)}" text-anchor="middle" fill="#2c2415" font-weight="600">${esc(room.name)}</text></g>`
}

function side(room, count, i, mirror) {
  const [x1, x2] = RG[i], X = (x) => (mirror ? 360 - x : x), t = (x) => yb(x) - 0.7 * (yb(x) - yt(x))
  return door(room, count, [X(x1), yb(x1)], [X(x1), t(x1)], [X(x2), t(x2)], [X(x2), yb(x2)])
}

// One hall (a floor seen from its stairs): doors on both walls, stairs up at the end, stairs down in the floor.
export function hallSVG(floor, idx, total, cnt) {
  const X = (y, j) => { const l = (WX * (480 - y)) / 190; return l + ((360 - 2 * l) * j) / 6 }
  const ys = [290, 302, 316, 334, 358, 394, 444, 480], cs = idx ? ['#8a6446', '#7c5a3e'] : ['#2f343d', '#e6e0d2']
  let tiles = ''
  for (let i = 0; i < 7; i++) for (let j = 0; j < 6; j++) {
    const a = ys[i], b = ys[i + 1]
    tiles += `<polygon points="${n1(X(a, j))},${a} ${n1(X(a, j + 1))},${a} ${n1(X(b, j + 1))},${b} ${n1(X(b, j))},${b}" fill="${cs[(i + j) % 2]}"/>`
  }
  const beams = [30, 75, 115, 148].map((y) => { const l = (WX * y) / TY; return `<line x1="${l}" y1="${y}" x2="${360 - l}" y2="${y}" stroke="#b9ae97" stroke-width="3"/>` }).join('')
  const wall = (m) => { const x = (v) => (m ? 360 - v : v); return `<polygon points="${x(0)},0 ${x(120)},170 ${x(120)},290 ${x(0)},480" fill="#cfc4b0"/><polygon points="${x(0)},480 ${x(0)},336 ${x(120)},254 ${x(120)},290" fill="#8a7a62"/><line x1="${x(0)}" y1="0" x2="${x(120)}" y2="170" stroke="#efe8da" stroke-width="6"/>` }
  const lamps = [0, 1].map((m) => [53, 94].map((x) => { const y = yt(x) + 0.4 * (yb(x) - yt(x)); return `<circle cx="${m ? 360 - x : x}" cy="${n1(y)}" r="${x < 70 ? 5 : 3.5}" fill="#ffe4a1" filter="url(#g2)"/>` }).join('')).join('')
  let back = ''
  if (idx < total - 1) {
    let st = ''
    for (let i = 0; i < 7; i++) st += `<rect x="${140 + i * 4}" y="${277 - i * 13}" width="${80 - i * 8}" height="13" fill="${i % 2 ? '#7a5a3e' : '#6b4a32'}"/><rect x="${140 + i * 4}" y="${277 - i * 13}" width="${80 - i * 8}" height="3" fill="#a98258"/>`
    back = `<g class="door st" data-go="hall:${idx + 1}" role="button" tabindex="0" aria-label="Go upstairs"><rect x="136" y="186" width="88" height="104" fill="#241a14"/>${st}<path d="M134 290L148 198M226 290L212 198" stroke="#b08d4f" stroke-width="3"/><rect x="154" y="174" width="52" height="13" rx="2" fill="#b08d4f"/><text x="180" y="184" font-size="9" text-anchor="middle" fill="#2c2415" font-weight="600">↑ Upstairs</text></g>`
  } else back = `<path d="M150 290V215a30 30 0 0 1 60 0V290z" fill="#2b3d5c" stroke="#efe8da" stroke-width="4"/><path d="M180 185V290M150 250h60" stroke="#efe8da" stroke-width="2"/>`
  const down = idx ? `<g class="door st" data-go="hall:${idx - 1}" role="button" tabindex="0" aria-label="Go downstairs"><polygon points="62,400 112,400 116,470 44,470" fill="#16100c" stroke="#b08d4f" stroke-width="3"/>${[412, 426, 442, 460].map((y, i) => `<line x1="${58 - i * 3}" y1="${y}" x2="${112 + i * 1.5}" y2="${y}" stroke="#4a3626" stroke-width="3"/>`).join('')}<rect x="52" y="378" width="52" height="14" rx="2" fill="#b08d4f"/><text x="78" y="388" font-size="9" text-anchor="middle" fill="#2c2415" font-weight="600">↓ Downstairs</text></g>` : ''
  return `<svg viewBox="0 0 360 480" role="group" aria-label="${esc(floor.name)} hall"><defs><filter id="g2" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><polygon points="0,0 360,0 240,170 120,170" fill="#e3dccd"/>${beams}${tiles}<rect x="120" y="170" width="120" height="120" fill="#d6ccb8"/><rect x="120" y="254" width="120" height="36" fill="#8a7a62"/>${wall(0)}${wall(1)}<polygon points="${n1(X(290, 2))},290 ${n1(X(290, 4))},290 ${n1(X(480, 4))},480 ${n1(X(480, 2))},480" fill="#6e2f36" stroke="#b08d4f" stroke-width="3"/>${back}${down}<path d="M180 0V50" stroke="#8a7a62" stroke-width="2"/><ellipse cx="180" cy="58" rx="26" ry="7" fill="#b08d4f"/>${[162, 172, 180, 188, 198].map((x) => `<circle cx="${x}" cy="50" r="3" fill="#ffe4a1" filter="url(#g2)"/>`).join('')}${lamps}${floor.L.slice(0, 3).map((r, i) => side(r, cnt(r.id), i, 0)).join('')}${floor.R.slice(0, 3).map((r, i) => side(r, cnt(r.id), i, 1)).join('')}</svg>`
}

// The house from the street. Any number of floors; a window glows when its room has saved cards.
export function exteriorSVG(floors, cnt) {
  const nF = floors.length, top = 100, fh = 80, bottom = top + fh * nF, H = bottom + 60
  const win = (room, x, y) => {
    const lit = room ? cnt(room.id) > 0 : false
    return `<g><rect x="${x}" y="${y}" width="34" height="40" fill="${lit ? '#f2c66d' : '#26344b'}" ${lit ? 'filter="url(#gl)"' : ''}/><path d="M${x + 17} ${y}v40M${x} ${y + 20}h34" stroke="#e6dccb" stroke-width="2"/><rect x="${x}" y="${y}" width="34" height="40" fill="none" stroke="#e6dccb" stroke-width="3"/>${room ? `<title>${esc(room.name)}${lit ? ' (has saved knowledge)' : ''}</title>` : ''}</g>`
  }
  let wins = '', courses = ''
  floors.forEach((fl, i) => {
    const y = bottom - fh * (i + 1) + 20
    ;[58, 102].forEach((x, j) => (wins += win(fl.L[j], x, y)))
    ;[224, 268].forEach((x, j) => (wins += win(fl.R[j], x, y)))
    if (i > 0 && i < nF - 1) wins += `<rect x="165" y="${y - 2}" width="30" height="40" fill="#26344b" stroke="#e6dccb" stroke-width="3"/><rect x="150" y="${y + 34}" width="60" height="5" fill="#b08d4f"/>`
    if (i > 0 && i === nF - 1) wins += `<circle cx="180" cy="${y + 20}" r="16" fill="#26344b" stroke="#e6dccb" stroke-width="3"/>`
    if (i < nF - 1) courses += `<rect x="36" y="${bottom - fh * (i + 1) - 2}" width="288" height="6" fill="#6f5a48"/>`
  })
  const d = bottom
  return `<svg viewBox="0 0 360 ${H}" role="group" aria-label="Your palace seen from the street"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232f4a"/><stop offset="1" stop-color="#d49a6a"/></linearGradient><linearGradient id="inn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5d08a"/><stop offset="1" stop-color="#8a5a35"/></linearGradient><pattern id="br" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#8a6650"/><path d="M0 .5h24M0 6.5h24M12 .5v6M0 6.5v6" stroke="#6f503d"/></pattern><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="360" height="${H}" fill="url(#sk)"/><circle cx="305" cy="40" r="14" fill="#f1e8d0" opacity=".9"/><rect y="${d}" width="360" height="60" fill="#33422f"/><rect x="250" y="${top - 56}" width="20" height="52" fill="#5a4a42"/><rect x="40" y="${top}" width="280" height="${fh * nF}" fill="url(#br)"/><polygon points="22,${top + 4} 180,${top - 66} 338,${top + 4}" fill="#323844"/>${courses}${wins}<g class="door" data-go="hall:0" role="button" tabindex="0" aria-label="Open the front door and go inside"><rect x="152" y="${d - 80}" width="56" height="80" fill="#e8dfcf"/><rect x="156" y="${d - 76}" width="48" height="76" fill="url(#inn)"/><polygon points="156,${d} 204,${d} 192,${d - 24} 168,${d - 24}" fill="#5a3a22"/><g class="dp"><rect x="156" y="${d - 76}" width="48" height="76" fill="#4a3022"/><g fill="#3a2418" stroke="#2a180f"><rect x="162" y="${d - 70}" width="16" height="28"/><rect x="182" y="${d - 70}" width="16" height="28"/><rect x="162" y="${d - 36}" width="16" height="30"/><rect x="182" y="${d - 36}" width="16" height="30"/></g><circle cx="196" cy="${d - 38}" r="3" fill="#c9a24b"/></g></g><rect x="146" y="${d}" width="68" height="6" fill="#9a9387"/><rect x="138" y="${d + 6}" width="84" height="6" fill="#857f74"/><ellipse cx="40" cy="${d + 2}" rx="34" ry="16" fill="#2d4632"/><ellipse cx="320" cy="${d + 2}" rx="34" ry="16" fill="#2d4632"/></svg>`
}

// Width / height of the exterior drawing for a given number of floors.
export const exteriorRatio = (floors) => 360 / (160 + 80 * floors)
