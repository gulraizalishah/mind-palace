// Where things can go inside each room. Kept free of 3D code so the save sheet stays light.
// [place name, icon, number of spots, look]  look: 'tag' = sticker stuck on a surface, 'book' = a book on a shelf, 'box' = a box or jar on a shelf.
// The order here MUST match the order of the spots drawn in three/rooms.js.
export const PLACES = {
  Kitchen: [['Refrigerator', '🧊', 3, 'tag'], ['Counter', '🍽️', 4, 'tag'], ['Cupboards', '🗄️', 2, 'tag'], ['Pantry shelf', '🫙', 3, 'box'], ['Table', '🪑', 2, 'tag']],
  Garage: [['Car', '🚗', 2, 'tag'], ['Workbench', '🔧', 2, 'tag'], ['Pegboard', '🪛', 2, 'tag'], ['Garage door', '🚪', 2, 'tag'], ['Shelf', '📦', 2, 'box'], ['Tires', '🛞', 1, 'tag'], ['Floor', '⬜', 1, 'tag']],
  Study: [['Bookshelf, top shelf', '📚', 2, 'book'], ['Bookshelf, 2nd shelf', '📚', 2, 'book'], ['Bookshelf, 3rd shelf', '📚', 2, 'book'], ['Bookshelf, bottom shelf', '📚', 2, 'book'], ['Desk', '🖥️', 2, 'tag'], ['Picture frame', '🖼️', 1, 'tag'], ['Window', '🪟', 1, 'tag'], ['Rug', '🟣', 1, 'tag']],
  Office: [['Whiteboard', '📝', 3, 'tag'], ['Desk', '🖥️', 2, 'tag'], ['Wall clock', '🕒', 1, 'tag'], ['Filing cabinet', '🗄️', 1, 'tag'], ['Monitor', '🖥️', 1, 'tag'], ['Plant', '🪴', 1, 'tag']],
  Library: [
    ['Left bookcase, top shelf', '📚', 3, 'book'], ['Left bookcase, 2nd shelf', '📚', 3, 'book'], ['Left bookcase, 3rd shelf', '📚', 3, 'book'], ['Left bookcase, bottom shelf', '📚', 3, 'book'],
    ['Right bookcase, top shelf', '📚', 3, 'book'], ['Right bookcase, 2nd shelf', '📚', 3, 'book'], ['Right bookcase, 3rd shelf', '📚', 3, 'book'], ['Right bookcase, bottom shelf', '📚', 3, 'book'],
    ['Armchair', '🛋️', 1, 'tag'], ['Window', '🪟', 1, 'tag'],
  ],
  Workshop: [['Pegboard', '🪛', 3, 'tag'], ['Workbench', '🔧', 3, 'tag'], ['Shelf', '📦', 3, 'box'], ['Tool chest', '🧰', 1, 'tag'], ['Sawhorse', '🪚', 1, 'tag'], ['Floor', '⬜', 1, 'tag']],
  Bathroom: [['Bathtub', '🛁', 2, 'tag'], ['Vanity', '🚰', 2, 'tag'], ['Mirror', '🪞', 1, 'tag'], ['Toilet', '🚽', 1, 'tag'], ['Window', '🪟', 1, 'tag'], ['Towel rail', '🧺', 1, 'tag'], ['Floor', '⬜', 1, 'tag']],
  Garden: [['Tree', '🌳', 3, 'tag'], ['Fence', '🚧', 3, 'tag'], ['Shed wall', '🛖', 1, 'tag'], ['Flower bed', '🌷', 3, 'tag'], ['Lawn', '🌱', 2, 'tag']],
  Shed: [['Top shelf', '📦', 3, 'box'], ['Lower shelf', '📦', 3, 'box'], ['Tool wall', '🪓', 3, 'tag'], ['Workbench', '🔧', 2, 'tag'], ['Floor', '⬜', 2, 'tag']],
  Generic: [['Desk', '🖥️', 2, 'tag'], ['Window', '🪟', 1, 'tag'], ['Floor', '⬜', 3, 'tag']],
}

export const placesOf = (roomName) => PLACES[roomName] || PLACES.Generic
export const spotCount = (roomName) => placesOf(roomName).reduce((n, p) => n + p[2], 0)
// first spot number of each place
export const placeStarts = (roomName) => { let n = 0; return placesOf(roomName).map((p) => { const s = n; n += p[2]; return s }) }
export const placeIndexOf = (roomName, spot) => {
  const starts = placeStarts(roomName), list = placesOf(roomName)
  for (let i = list.length - 1; i >= 0; i--) if (spot >= starts[i]) return i
  return 0
}
export const lookOf = (roomName, spot) => placesOf(roomName)[placeIndexOf(roomName, spot)][3]
export const placeLabel = (roomName, spot) => placesOf(roomName)[placeIndexOf(roomName, spot)][0]

// Decide where every item sits in a room. Items keep the spot they were given;
// a taken or missing spot falls back to the next free spot in the same place, then anywhere.
export function assignSpots(roomName, items) {
  const total = spotCount(roomName), used = new Set(), out = new Map()
  const valid = (s) => Number.isInteger(s) && s >= 0 && s < total
  items.forEach((it) => { if (valid(it.spot) && !used.has(it.spot)) { out.set(it.id, it.spot); used.add(it.spot) } })
  const starts = placeStarts(roomName), list = placesOf(roomName)
  items.forEach((it) => {
    if (out.has(it.id)) return
    let pick = null
    if (valid(it.spot)) {
      const pi = placeIndexOf(roomName, it.spot)
      for (let i = starts[pi]; i < starts[pi] + list[pi][2]; i++) if (!used.has(i)) { pick = i; break }
    }
    if (pick === null) for (let i = 0; i < total; i++) if (!used.has(i)) { pick = i; break }
    if (pick !== null) { out.set(it.id, pick); used.add(pick) }
  })
  return out
}
