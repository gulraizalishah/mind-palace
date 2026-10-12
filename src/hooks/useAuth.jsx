import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { getMyPrefs } from '../services/prefs'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (user) => {
    if (!user) { setProfile(null); setPrefs(null); return }
    try {
      const [{ data: p }, pr] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        getMyPrefs(user.id),
      ])
      setProfile(p)
      setPrefs(pr ?? { selected_categories: [], onboarded: false })
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await load(data.session?.user)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setTimeout(() => load(s?.user), 0) // avoids calling Supabase inside its own callback
    })
    return () => sub.subscription.unsubscribe()
  }, [load])

  const value = {
    session, user: session?.user ?? null, profile, prefs, loading,
    isAdmin: profile?.role === 'admin',
    reload: () => load(session?.user),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
