// Where a memory can be kept in a room. Furniture are containers (tap them to see what is inside),
// the two side walls hold hanging pictures, and small storage boxes take the overflow.
export const WALL_CAP = 6          // pictures per side wall
export const MAX_BOXES = 8         // storage boxes per room
export const LEFT_WALL = 'Left wall'
export const RIGHT_WALL = 'Right wall'

// [name, icon]. Names must match the furniture in three/rooms.js.
export const CONTAINERS = {
  Kitchen: [['Refrigerator', '🧊'], ['Counter', '🍽️'], ['Cupboards', '🗄️'], ['Pantry shelf', '🫙'], ['Table', '🪑']],
  Garage: [['Car', '🚗'], ['Workbench', '🔧'], ['Pegboard', '🪛'], ['Garage door', '🚪'], ['Shelf', '📦'], ['Tires', '🛞']],
  Study: [['Bookshelf', '📚'], ['Desk', '🖥️'], ['Picture frame', '🖼️'], ['Window', '🪟'], ['Rug', '🟣']],
  Office: [['Whiteboard', '📝'], ['Desk', '🖥️'], ['Wall clock', '🕒'], ['Filing cabinet', '🗄️'], ['Monitor', '🖥️'], ['Plant', '🪴']],
  Library: [['Left bookcase', '📚'], ['Right bookcase', '📚'], ['Armchair', '🛋️'], ['Window', '🪟']],
  Workshop: [['Pegboard', '🪛'], ['Workbench', '🔧'], ['Shelf', '📦'], ['Tool chest', '🧰'], ['Sawhorse', '🪚']],
  Bathroom: [['Bathtub', '🛁'], ['Vanity', '🚰'], ['Mirror', '🪞'], ['Toilet', '🚽'], ['Window', '🪟'], ['Towel rail', '🧺']],
  Garden: [['Tree', '🌳'], ['Fence', '🚧'], ['Flower bed', '🌷'], ['Lawn', '🌱']],
  Shed: [['Top shelf', '📦'], ['Lower shelf', '📦'], ['Tool wall', '🪓'], ['Workbench', '🔧'], ['Floor', '⬜']],
  Generic: [['Desk', '🖥️'], ['Window', '🪟'], ['Floor', '⬜']],
}
export const containersOf = (roomName) => CONTAINERS[roomName] || CONTAINERS.Generic

// Sort a room's memories into walls, furniture and boxes. An item with no (or an unknown) place
// goes to the room's first container. A full wall sends extra pictures to the first container too.
export function layoutRoom(roomName, items, boxes = []) {
  const list = containersOf(roomName), names = new Set(list.map((c) => c[0])), boxIds = new Set(boxes.map((b) => b.id))
  const out = { left: [], right: [], by: Object.fromEntries(list.map((c) => [c[0], []])), boxes: Object.fromEntries(boxes.map((b) => [b.id, []])) }
  items.forEach((it) => {
    if (it.box_id && boxIds.has(it.box_id)) { out.boxes[it.box_id].push(it); return }
    if (it.place === LEFT_WALL && out.left.length < WALL_CAP) { out.left.push(it); return }
    if (it.place === RIGHT_WALL && out.right.length < WALL_CAP) { out.right.push(it); return }
    out.by[names.has(it.place) ? it.place : list[0][0]].push(it)
  })
  return out
}

// "Where is this memory now?" as words.
export function describePlace(roomName, items, boxes, item) {
  const lay = layoutRoom(roomName, items, boxes)
  if (lay.left.includes(item)) return 'Left wall'
  if (lay.right.includes(item)) return 'Right wall'
  for (const b of boxes) if (lay.boxes[b.id]?.includes(item)) return `Storage box: ${b.name}`
  for (const [name, list] of Object.entries(lay.by)) if (list.includes(item)) return name
  return ''
}
