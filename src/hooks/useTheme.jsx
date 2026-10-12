import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'mp-theme' // 'system' | 'light' | 'dark'
const ThemeContext = createContext({ theme: 'system', effective: 'light', setTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

const apply = (t) => {
  const root = document.documentElement
  if (t === 'light' || t === 'dark') root.dataset.theme = t
  else delete root.dataset.theme
}
const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    let t = 'system'
    try { t = localStorage.getItem(KEY) || 'system' } catch { /* storage blocked */ }
    apply(t)
    return t
  })
  const [, bump] = useState(0)

  useEffect(() => {
    apply(theme)
    try { localStorage.setItem(KEY, theme) } catch { /* storage blocked */ }
  }, [theme])

  // Follow the phone's setting live while on "system".
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const on = () => bump((n) => n + 1)
    mq?.addEventListener('change', on)
    return () => mq?.removeEventListener('change', on)
  }, [])

  const effective = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme
  return <ThemeContext.Provider value={{ theme, effective, setTheme }}>{children}</ThemeContext.Provider>
}
