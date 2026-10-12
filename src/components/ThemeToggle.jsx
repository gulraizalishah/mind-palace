import { useTheme } from '../hooks/useTheme'

// Quick sun/moon button for the header.
export function ThemeButton() {
  const { effective, setTheme } = useTheme()
  const dark = effective === 'dark'
  return (
    <button className="iconbtn" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />}
      </svg>
    </button>
  )
}

// Three-way setting for the Profile page.
export default function ThemeSetting() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="seg" role="group" aria-label="Appearance">
      {[['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([id, label]) => (
        <button key={id} aria-pressed={theme === id} onClick={() => setTheme(id)}>{label}</button>
      ))}
    </div>
  )
}
