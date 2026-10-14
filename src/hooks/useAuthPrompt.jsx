import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import AuthScreen from '../components/AuthScreen'

const PromptContext = createContext({ askLogin: () => {} })
export const useAuthPrompt = () => useContext(PromptContext)

// Anything that needs an account calls askLogin("why"). A sign-in sheet slides up.
export function AuthPromptProvider({ children }) {
  const { user } = useAuth()
  const [reason, setReason] = useState(null)
  useEffect(() => { if (user) setReason(null) }, [user])

  return (
    <PromptContext.Provider value={{ askLogin: (r = 'Log in to continue') => setReason(r) }}>
      {children}
      {reason && !user && (
        <div className="modal" onClick={() => setReason(null)}>
          <div className="card sheet" role="dialog" aria-modal="true" aria-label="Log in" onClick={(e) => e.stopPropagation()}>
            <h2>{reason}</h2>
            <p className="sub">A free account keeps your palace safe and lets you quiz yourself on what you save. You can keep browsing without one.</p>
            <AuthScreen embedded />
            <button className="ghost" onClick={() => setReason(null)}>Keep browsing</button>
          </div>
        </div>
      )}
    </PromptContext.Provider>
  )
}
