import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getStreak, touchStreak } from '../services/streak'

const StreakContext = createContext({ streak: { current: 0, longest: 0, done: false }, touch: () => {} })
export const useStreak = () => useContext(StreakContext)

export function StreakProvider({ children }) {
  const [streak, setStreak] = useState({ current: 0, longest: 0, done: false })
  const counted = useRef(false)

  useEffect(() => {
    getStreak().then((s) => { setStreak({ current: s.current_streak, longest: s.longest_streak, done: s.done_today }); counted.current = s.done_today }).catch(() => {})
  }, [])

  // Call after any real learning action. Only the first call each day does anything.
  const touch = useCallback(async () => {
    if (counted.current) return
    counted.current = true
    try {
      const s = await touchStreak()
      setStreak({ current: s.current_streak, longest: s.longest_streak, done: true })
    } catch { counted.current = false }
  }, [])

  return <StreakContext.Provider value={{ streak, touch }}>{children}</StreakContext.Provider>
}
