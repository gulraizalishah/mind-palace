export default function TopicChips({ categories, selected, onToggle }) {
  return (
    <div className="chips">
      {categories.map((c) => (
        <button key={c.id} type="button" className="chip" aria-pressed={selected.includes(c.id)} onClick={() => onToggle(c.id)}>
          {c.icon} {c.name}
        </button>
      ))}
    </div>
  )
}
