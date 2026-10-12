// Illustrated rooms. Each scene is an SVG (360 x 300) plus "slots": spots (in SVG units)
// where saved stickers are placed, like magnets on a fridge or books on a shelf.
const R = (x, y, w, h, f, o = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o}/>`
const C = (x, y, r, f, o = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`
const E = (x, y, rx, ry, f, o = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o}/>`
const P = (d, f, o = '') => `<path d="${d}" fill="${f}" ${o}/>`
const L = (x1, y1, x2, y2, s, w = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}"/>`
const BOOK = ['#7a3b3b', '#3f5f7a', '#5f7a4a', '#a8863f', '#5b4a6a', '#8a5a3a', '#3f6a68', '#9a6a5a']
const books = (x0, y0, w, h) => { let s = '', x = x0, i = 0; while (x < x0 + w - 6) { const bw = 6 + ((i * 5) % 6), bh = h - ((i * 7) % 11); s += R(x, y0 + h - bh, bw, bh, BOOK[i % BOOK.length], 'stroke="#0003" stroke-width=".6"'); x += bw + 1; i++ } return s }
const DEFS = `<defs>
<pattern id="wood" width="48" height="12" patternUnits="userSpaceOnUse"><rect width="48" height="12" fill="#8a6446"/><path d="M0 .5h48M16 0v12" stroke="#6f4f36"/></pattern>
<pattern id="tile" width="30" height="20" patternUnits="userSpaceOnUse"><rect width="30" height="20" fill="#d8d3c8"/><path d="M0 .5h30M.5 0v20" stroke="#b7b0a2"/></pattern>
<pattern id="conc" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#8d9298"/><path d="M0 .5h60M30 0v30" stroke="#7b8086"/></pattern>
<pattern id="wtile" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#e6eef0"/><path d="M0 .5h18M.5 0v18" stroke="#c0cfd4"/></pattern>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa6c9"/><stop offset="1" stop-color="#e8cfa3"/></linearGradient>
<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa573"/><stop offset="1" stop-color="#557f4f"/></linearGradient>
<linearGradient id="fs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<radialGradient id="vg" cx=".5" cy=".42" r=".78"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient></defs>`
const wrap = (label, body) => `<svg viewBox="0 0 360 300" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice">${DEFS}${body}${R(0, 0, 360, 300, 'url(#vg)', 'pointer-events="none"')}</svg>`
const shell = (wall, floor, wallExtra = '', fy = 192) => R(0, 0, 360, fy, wall) + wallExtra + R(0, fy, 360, 300 - fy, `url(#${floor})`) + R(0, fy, 360, 18, 'url(#fs)') + R(0, fy - 5, 360, 7, '#0000002e')
const win = (x, y, w, h) => R(x - 5, y - 5, w + 10, h + 10, '#efe8da') + R(x, y, w, h, 'url(#sky)') + L(x + w / 2, y, x + w / 2, y + h, '#efe8da', 3) + L(x, y + h / 2, x + w, y + h / 2, '#efe8da', 3)
const rug = (cx, cy, rx, ry, c) => E(cx, cy, rx, ry, c, 'opacity=".85"') + E(cx, cy, rx - 8, ry - 4, 'none', 'stroke="#ffffff55" stroke-width="2"')

const kitchen = (wall) => wrap('Kitchen', shell(wall, 'tile', R(70, 98, 290, 32, 'url(#wtile)')) +
  rug(190, 262, 120, 22, '#8c5a4a') +
  R(240, 22, 110, 72, '#a9835a') + L(295, 22, 295, 94, '#7a5a3e') + C(286, 62, 2.6, '#e0c98f') + C(304, 62, 2.6, '#e0c98f') +
  `<polygon points="175,40 225,40 240,88 160,88" fill="#b9c0c6"/>` + R(190, 22, 20, 18, '#aab2b8') +
  win(88, 36, 62, 56) +
  R(8, 30, 60, 164, '#d5dade') + L(8, 84, 68, 84, '#aab1b7', 3) + R(57, 44, 4, 28, '#8a9299') + R(57, 98, 4, 44, '#8a9299') +
  R(70, 134, 290, 60, '#a9835a') + L(112, 134, 112, 194, '#7a5a3e') + L(160, 134, 160, 194, '#7a5a3e') + L(240, 134, 240, 194, '#7a5a3e') + L(300, 134, 300, 194, '#7a5a3e') +
  R(66, 126, 298, 10, '#e7e1d6') +
  R(170, 134, 60, 60, '#3b4046') + R(178, 150, 44, 30, '#1f2327') + R(180, 142, 40, 3, '#9aa2a8') +
  R(170, 122, 60, 6, '#2c3035') + E(186, 124, 9, 2.4, '#14171a') + E(214, 124, 9, 2.4, '#14171a') +
  P('M84 126h66l-6 8h-54z', '#aeb6bc') + P('M117 126v-14h10', 'none', 'stroke="#8d959b" stroke-width="3"'))
const kitchenSlots = [[38, 60], [38, 112], [38, 162], [160, 106], [255, 106], [300, 106], [335, 106], [270, 58], [325, 58], [130, 252], [250, 252]]

const garage = (wall) => wrap('Garage', shell(wall, 'conc') +
  R(76, 12, 208, 6, '#8f959b') + R(80, 18, 200, 172, '#d7dade') + [40, 64, 88, 112, 136, 160].map((y) => L(80, y, 280, y, '#b5babf', 2)).join('') +
  R(10, 70, 66, 5, '#7a5a3e') + R(16, 50, 22, 20, '#c7a46b') + R(44, 46, 24, 24, '#b98f5a') +
  R(292, 24, 64, 100, '#c9b48a') + L(304, 44, 340, 44, '#555', 5) + L(304, 70, 336, 70, '#6b6f75', 4) + L(304, 96, 330, 96, '#555', 5) + C(338, 70, 5, '#6b6f75') +
  R(14, 152, 52, 14, '#2b2e33', 'rx="7"') + R(14, 168, 52, 14, '#2b2e33', 'rx="7"') + R(14, 184, 52, 14, '#2b2e33', 'rx="7"') +
  R(292, 140, 66, 7, '#7a5a3e') + R(298, 147, 5, 46, '#5b4a3a') + R(346, 147, 5, 46, '#5b4a3a') + R(308, 152, 34, 20, '#8a6a4a') + R(318, 160, 14, 3, '#d8c08a') +
  E(190, 204, 118, 10, '#0000003a') +
  P('M95 184L99 152Q103 138 120 134L158 128Q172 108 200 106L238 108Q258 112 268 134L282 140Q290 144 290 160V184Z', '#6f89a6') +
  P('M165 130Q176 114 200 112L232 114Q248 118 256 134Z', '#cfe0ee') + L(212, 112, 212, 132, '#6f89a6', 3) +
  C(130, 186, 20, '#2b2e33') + C(130, 186, 9, '#9aa0a6') + C(252, 186, 20, '#2b2e33') + C(252, 186, 9, '#9aa0a6') + C(284, 154, 5, '#f1e3b0'))
const garageSlots = [[40, 134], [200, 88], [250, 100], [310, 120], [340, 120], [324, 84], [115, 50], [245, 50], [40, 46], [60, 254], [180, 254], [300, 254]]

const study = (wall) => wrap('Study', shell(wall, 'wood') +
  win(250, 36, 80, 78) + R(236, 30, 12, 92, '#7d6a8e') + R(332, 30, 12, 92, '#7d6a8e') +
  R(8, 18, 78, 174, '#6b4a32') + R(13, 23, 68, 164, '#4f3524') + [64, 104, 144].map((y) => R(13, y, 68, 4, '#6b4a32')).join('') +
  books(15, 28, 64, 34) + books(15, 68, 64, 34) + books(15, 108, 64, 34) + books(15, 148, 64, 36) +
  R(118, 48, 76, 56, '#5b3d29') + R(123, 53, 66, 46, '#8c9e8a') + P('M123 99l20-24 14 14 12-16 20 26z', '#4b5b66') +
  rug(190, 262, 120, 22, '#6a5a7e') +
  R(150, 150, 54, 36, '#5a4a6a', 'rx="8"') + R(144, 180, 66, 14, '#4a3b58', 'rx="5"') +
  R(100, 138, 172, 10, '#7a5a3e') + R(106, 148, 8, 46, '#5b3d29') + R(258, 148, 8, 46, '#5b3d29') + R(196, 148, 62, 28, '#6b4a32') + C(227, 162, 2.6, '#d8c08a') +
  R(116, 132, 18, 6, '#3b3b3b') + P('M125 132L139 98L162 96', 'none', 'stroke="#3b3b3b" stroke-width="3"') + `<polygon points="150,90 180,90 174,104 156,104" fill="#d8b46a"/><polygon points="156,104 174,104 192,138 138,138" fill="#ffe9a8" opacity=".22"/>` +
  C(244, 120, 16, '#5e8aa6') + P('M228 120h32M244 104v32', 'none', 'stroke="#ffffff66" stroke-width="1.5"') + R(240, 134, 8, 6, '#3b3b3b'))
const studySlots = [[30, 44], [62, 44], [30, 84], [62, 84], [30, 124], [62, 124], [156, 76], [214, 114], [290, 76], [110, 252], [210, 252], [300, 252]]

const office = (wall) => wrap('Office', shell(wall, 'wood') +
  R(14, 28, 112, 72, '#f4f4f0', 'stroke="#9aa2a8" stroke-width="4"') + P('M26 46h60M26 60h84M26 74h40', 'none', 'stroke="#7a8aa0" stroke-width="3"') + R(14, 100, 112, 5, '#9aa2a8') +
  C(190, 48, 20, '#f4f0e6', 'stroke="#6f5a46" stroke-width="4"') + L(190, 48, 190, 34, '#333', 2) + L(190, 48, 200, 52, '#333', 2) +
  rug(190, 262, 130, 22, '#5b6a7a') +
  R(20, 128, 52, 66, '#8d979e') + [150, 172].map((y) => L(20, y, 72, y, '#6b757c', 2)).join('') + [139, 161, 183].map((y) => R(38, y, 16, 3, '#d8dde0')).join('') +
  R(98, 158, 26, 36, '#a86f4a') + E(110, 150, 16, 14, '#5f8a5a') + E(98, 140, 10, 14, '#6c9a64') + E(124, 142, 10, 14, '#527a50') +
  R(224, 150, 62, 40, '#3f4a55', 'rx="8"') + R(220, 184, 70, 12, '#2f3841', 'rx="5"') +
  R(140, 138, 204, 10, '#6f5a46') + R(140, 148, 52, 46, '#5b4a3a') + [160, 176].map((y) => R(160, y, 12, 3, '#d8c08a')).join('') + R(330, 148, 8, 46, '#5b4a3a') +
  R(220, 84, 78, 48, '#2b3138') + R(225, 89, 68, 38, '#6f93b3') + L(232, 100, 280, 100, '#ffffff88', 3) + L(232, 110, 262, 110, '#ffffff88', 3) + R(254, 132, 8, 6, '#2b3138') +
  R(222, 133, 70, 4, '#cfd3d6'))
const officeSlots = [[40, 58], [100, 58], [70, 86], [190, 88], [162, 118], [320, 118], [46, 108], [258, 64], [112, 126], [160, 252], [250, 252], [320, 252]]

const library = (wall) => wrap('Library', shell(wall, 'wood') +
  R(8, 14, 114, 180, '#5b3d29') + R(240, 14, 114, 180, '#5b3d29') +
  [56, 98, 140].map((y) => R(12, y, 106, 4, '#7a5a3e') + R(244, y, 106, 4, '#7a5a3e')).join('') +
  [18, 60, 102, 144].map((y) => books(14, y, 102, 38) + books(246, y, 102, 38)).join('') +
  P('M142 156V76a38 38 0 0 1 76 0V156z', 'url(#sky)', 'stroke="#efe8da" stroke-width="5"') + L(180, 38, 180, 156, '#efe8da', 3) + L(142, 94, 218, 94, '#efe8da', 3) +
  rug(180, 262, 110, 22, '#7a3b3b') +
  R(150, 132, 60, 50, '#7a3b3b', 'rx="14"') + R(144, 166, 72, 26, '#8a4646', 'rx="8"') + R(138, 150, 14, 42, '#6a3030', 'rx="6"') + R(208, 150, 14, 42, '#6a3030', 'rx="6"'))
const librarySlots = [[30, 38], [64, 38], [98, 38], [30, 80], [64, 80], [98, 80], [30, 122], [64, 122], [262, 38], [296, 38], [330, 38], [262, 80], [296, 80], [330, 80], [180, 108]]

const workshop = (wall) => wrap('Workshop', shell(wall, 'conc') +
  `<pattern id="peg" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#c9b48a"/><circle cx="6" cy="6" r="1.3" fill="#8a7650"/></pattern>` + R(14, 18, 206, 104, 'url(#peg)', 'stroke="#8a7650" stroke-width="3"') +
  R(40, 36, 24, 10, '#4b4f55') + R(48, 46, 8, 36, '#8a5a35') +
  `<polygon points="92,40 150,40 150,60 92,52" fill="#aeb4ba"/>` + R(146, 38, 20, 24, '#8a5a35') +
  L(80, 92, 130, 92, '#4b4f55', 6) + C(78, 92, 8, 'none', 'stroke="#4b4f55" stroke-width="5"') + C(132, 92, 8, 'none', 'stroke="#4b4f55" stroke-width="5"') +
  L(176, 70, 176, 112, '#6b6f75', 4) + R(170, 58, 12, 16, '#c9503f') +
  R(14, 136, 208, 10, '#8a6a4a') + R(14, 146, 208, 8, '#6f5238') + R(20, 154, 8, 40, '#5b4a3a') + R(208, 154, 8, 40, '#5b4a3a') + R(196, 122, 16, 14, '#4b4f55') +
  R(240, 72, 112, 5, '#7a5a3e') + R(250, 50, 18, 22, '#b9553f') + R(276, 54, 16, 18, '#4f7a8a') + R(300, 48, 24, 24, '#c9a44a') +
  R(268, 134, 78, 60, '#a23b3b') + L(268, 154, 346, 154, '#7c2b2b', 3) + L(268, 174, 346, 174, '#7c2b2b', 3) + [144, 164, 184].map((y) => R(296, y, 22, 4, '#d8c08a')).join(''))
const workshopSlots = [[180, 50], [180, 96], [110, 100], [50, 116], [110, 116], [170, 116], [262, 52], [300, 52], [336, 52], [306, 112], [80, 252], [190, 252], [300, 252]]

const bathroom = (wall) => wrap('Bathroom', shell(wall, 'tile', R(0, 0, 360, 192, 'url(#wtile)', 'opacity=".9"')) +
  R(16, 50, 82, 4, '#aab3b8') + R(24, 54, 22, 50, '#e8d9c4') + R(54, 54, 22, 44, '#7ea6b8') +
  R(300, 26, 48, 44, '#dfeaf0', 'stroke="#efe8da" stroke-width="4"') + L(324, 26, 324, 70, '#efe8da', 3) +
  rug(190, 262, 120, 20, '#6f93b3') +
  R(204, 34, 64, 78, '#cfe3ea', 'stroke="#8a6a4a" stroke-width="5"') + P('M214 100l18-50M226 100l18-50', 'none', 'stroke="#ffffff99" stroke-width="3"') +
  P('M14 138h164v22a32 32 0 0 1-32 32H46a32 32 0 0 1-32-32z', '#eef1f2') + R(8, 132, 176, 10, '#dfe4e6') + P('M34 132v-30h20', 'none', 'stroke="#aab3b8" stroke-width="5"') + R(14, 192, 12, 6, '#aab3b8') + R(166, 192, 12, 6, '#aab3b8') +
  R(196, 142, 80, 50, '#a9835a') + L(236, 142, 236, 192, '#7a5a3e', 2) + C(228, 168, 2.4, '#e0c98f') + C(244, 168, 2.4, '#e0c98f') + R(192, 130, 88, 12, '#e7e1d6') + P('M212 130h48l-6 9h-36z', '#cfd6da') + P('M236 130v-10h8', 'none', 'stroke="#aab3b8" stroke-width="3"') +
  R(312, 96, 38, 44, '#eef1f2') + P('M302 150h58a10 10 0 0 1-6 22h-46a10 10 0 0 1-6-22z', '#e4e8ea'))
const bathroomSlots = [[50, 112], [120, 112], [35, 80], [66, 80], [230, 106], [262, 106], [236, 68], [329, 76], [324, 48], [100, 254], [220, 254], [300, 254]]

const garden = () => wrap('Garden',
  R(0, 0, 360, 170, 'url(#sky)') + C(312, 38, 16, '#f6ecc4') + E(90, 36, 34, 10, '#ffffffbb') + E(120, 30, 24, 9, '#ffffffbb') + E(230, 56, 30, 9, '#ffffffbb') +
  P('M0 150Q80 108 160 140T360 128V172H0z', '#9db89a') + R(0, 168, 360, 132, 'url(#grass)') +
  P('M172 300L192 178H214L252 300z', '#cdbf9d') +
  [100, 122, 144, 166, 188, 210, 232].map((x) => R(x, 118, 10, 56, '#e8e0d0')).join('') + R(96, 132, 150, 5, '#d8d0c0') + R(96, 154, 150, 5, '#d8d0c0') +
  R(262, 94, 84, 80, '#a9835a') + `<polygon points="254,96 304,58 354,96" fill="#6f4f36"/>` + R(290, 122, 30, 52, '#7a5a3e') + C(314, 150, 2.4, '#e0c98f') + R(268, 106, 16, 16, '#efe8da') +
  R(34, 62, 22, 124, '#6f4f36') + C(45, 52, 48, '#5f8a5a') + C(16, 82, 34, '#6c9a64') + C(82, 80, 36, '#527a50') + C(60, 30, 26, '#6c9a64') +
  [[40, 214], [66, 224], [92, 214], [118, 226], [260, 214], [286, 226], [312, 214], [338, 224]].map(([x, y], i) => R(x, y, 2, 14, '#3f6a3a') + C(x + 1, y, 6, ['#d96a6a', '#e8c15a', '#c58ad9', '#f0f0e8'][i % 4])).join(''))
const gardenSlots = [[20, 72], [70, 36], [80, 90], [125, 100], [170, 100], [215, 100], [300, 136], [100, 214], [150, 214], [260, 214], [120, 262], [230, 262]]

const generic = (wall) => wrap('Room', shell(wall, 'wood') + win(240, 40, 80, 70) + R(30, 130, 120, 10, '#7a5a3e') + R(36, 140, 8, 52, '#5b3d29') + R(136, 140, 8, 52, '#5b3d29') + rug(190, 262, 120, 22, '#6a5a7e'))
const genericSlots = [[60, 110], [110, 110], [90, 70], [280, 70], [100, 252], [200, 252], [300, 252]]

const SCENES = { Kitchen: [kitchen, kitchenSlots], Garage: [garage, garageSlots], Study: [study, studySlots], Office: [office, officeSlots], Library: [library, librarySlots], Workshop: [workshop, workshopSlots], Bathroom: [bathroom, bathroomSlots], Garden: [garden, gardenSlots] }

export function roomScene(name, wallColor) {
  const [draw, slots] = SCENES[name] || [generic, genericSlots]
  return { svg: draw(wallColor || '#d9cbb2'), slots }
}
