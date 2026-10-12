// Scrollable topic filter shown under the app name.
export default function CategoryBar({ categories, active, onPick }) {
  const core = categories.filter((c) => c.is_primary), more = categories.filter((c) => !c.is_primary)
  const chip = (id, label) => (
    <button key={id ?? 'all'} className="cat" aria-pressed={active === id} onClick={() => onPick(id)}>{label}</button>
  )
  return (
    <div className="catbar" role="group" aria-label="Topics">
      {chip(null, 'All')}
      {core.map((c) => chip(c.id, `${c.icon} ${c.name}`))}
      {more.length > 0 && <span className="sep" aria-hidden="true" />}
      {more.map((c) => chip(c.id, `${c.icon} ${c.name}`))}
    </div>
  )
}
