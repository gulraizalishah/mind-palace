import { useStreak } from '../hooks/useStreak'
import { useAuth } from '../hooks/useAuth'
import CategoryBar from './CategoryBar'
import { ThemeButton } from './ThemeToggle'

export default function Header({ categories, activeCat, onPickCat }) {
  const { streak } = useStreak()
  const { user } = useAuth()
  return (
    <header className="hdr">
      <div className="hdr-row">
        <span className="brand">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V10l7-6 7 6v11M10 21v-5a2 2 0 0 1 4 0v5" /></svg>
          Mind Palace
        </span>
        <span className="hdr-right">
        <ThemeButton />
        {user && <span className={`streak ${streak.done ? 'on' : ''}`} role="status" aria-label={`${streak.current} day streak${streak.done ? ', done for today' : ''}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill={streak.done ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c1 3.5-1.5 4.5-1.5 7a2.5 2.5 0 0 0 5 0c2 1.2 3 3.2 3 5.5A6.5 6.5 0 0 1 12 22a6.5 6.5 0 0 1-6.5-6.5C5.5 11 9.5 9 12 3z" /></svg>
          {streak.current}
        </span>}
        </span>
      </div>
      <CategoryBar categories={categories} active={activeCat} onPick={onPickCat} />
    </header>
  )
}
