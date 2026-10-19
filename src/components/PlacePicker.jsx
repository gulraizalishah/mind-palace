import { placesOf } from '../lib/places'

// "Where in the room?": shelf, fridge, cupboard and so on. value = place number or null (anywhere).
export default function PlacePicker({ roomName, value, onChange }) {
  const list = placesOf(roomName)
  return (
    <div className="chips" role="group" aria-label={`Where in the ${roomName}`}>
      <button type="button" className="chip" aria-pressed={value === null} onClick={() => onChange(null)}>Anywhere</button>
      {list.map((p, i) => (
        <button type="button" key={p[0]} className="chip" aria-pressed={value === i} onClick={() => onChange(i)}>{p[1]} {p[0]}</button>
      ))}
    </div>
  )
}
