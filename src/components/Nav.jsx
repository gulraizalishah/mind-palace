const P = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  palace: <path d="M3 21h18M5 21V10l7-6 7 6v11M10 21v-5a2 2 0 0 1 4 0v5" />,
  review: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
}
const TABS = [['home', 'Home'], ['palace', 'Palace'], ['review', 'Review'], ['profile', 'Profile']]

export default function Nav({ tab, onChange }) {
  return (
    <nav aria-label="Main">
      {TABS.map(([id, label]) => (
        <button key={id} id={`nav-${id}`} aria-current={tab === id ? 'page' : undefined} onClick={() => onChange(id)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[id]}</svg>
          {label}
        </button>
      ))}
    </nav>
  )
}
