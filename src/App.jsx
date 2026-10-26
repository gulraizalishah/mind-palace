import { Fragment, useCallback, useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { fetchCategories } from './services/cards'
import { fetchRooms } from './services/palace'
import Onboarding from './components/Onboarding'
import Tour, { tourSeen } from './components/Tour'
import Nav from './components/Nav'
import Header from './components/Header'
import OfflineBanner from './components/OfflineBanner'
import GuestGate from './components/GuestGate'
import { StreakProvider } from './hooks/useStreak'
import { AuthPromptProvider } from './hooks/useAuthPrompt'
import { useSheetSwipe, useTabSwipe } from './hooks/useSwipe'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import GuestProfile from './pages/GuestProfile'
import Palace from './pages/Palace'
import Review from './pages/Review'

const TAB_ORDER = ['home', 'palace', 'review', 'profile']

export default function App() {
  const { user, prefs, loading } = useAuth()
  const [tab, setTab] = useState('home')
  const [categories, setCategories] = useState([])
  const [rooms, setRooms] = useState([])
  const [loadError, setLoadError] = useState('')
  const [cat, setCat] = useState(null)
  const [dir, setDir] = useState('')
  const [content, setContent] = useState(null)
  const [tour, setTour] = useState(() => !tourSeen())
  useEffect(() => { const again = () => setTour(true); window.addEventListener('mp-tour', again); return () => window.removeEventListener('mp-tour', again) }, [])

  const goTab = useCallback((id) => {
    setTab((cur) => { if (cur === id) return cur; setDir(TAB_ORDER.indexOf(id) > TAB_ORDER.indexOf(cur) ? 'fromR' : 'fromL'); return id })
  }, [])
  const step = useCallback((n) => setTab((cur) => {
    const i = TAB_ORDER.indexOf(cur) + n
    if (i < 0 || i >= TAB_ORDER.length) return cur
    setDir(n > 0 ? 'fromR' : 'fromL')
    return TAB_ORDER[i]
  }), [])
  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])
  useSheetSwipe()
  useTabSwipe(content, next, prev)

  // Topics and rooms are public, so visitors without an account can load them too.
  useEffect(() => {
    Promise.all([fetchCategories(), fetchRooms()])
      .then(([c, r]) => { setCategories(c); setRooms(r) })
      .catch((e) => setLoadError(e.message))
  }, [])

  if (loading) return <main><p className="sub">Loading…</p></main>
  if (loadError) return <main><p className="note" role="alert">Could not reach the database: {loadError}. If you are signed out, make sure migration-5.sql has been run in Supabase.</p></main>
  if (!categories.length) return <main><p className="sub">Loading…</p></main>
  if (user && !prefs?.onboarded) return <Onboarding categories={categories} />

  const Streak = user ? StreakProvider : Fragment
  return (
    <AuthPromptProvider>
      <Streak>
        <div id="app">
          <OfflineBanner />
          <Header categories={categories} activeCat={cat} onPickCat={(id) => { setCat(id); goTab('home') }} />
          <div className="content" ref={setContent}>
            <div key={tab} className={`tabview ${dir}`}>
              {tab === 'home' && <Feed key={cat ?? 'all'} categories={categories} rooms={rooms} categoryId={cat} />}
              {tab === 'palace' && (user ? <Palace categories={categories} rooms={rooms} />
                : <GuestGate title="Your memory palace" text="Log in to build your own house of memories: save cards, add your own, and place them in rooms." />)}
              {tab === 'review' && (user ? <Review />
                : <GuestGate title="Review what you learned" text="Log in to get recall questions on the cards you save, and keep a daily streak." />)}
              {tab === 'profile' && (user ? <Profile categories={categories} /> : <GuestProfile />)}
            </div>
          </div>
          <Nav tab={tab} onChange={goTab} />
          {tour && <Tour signedIn={!!user} onClose={() => setTour(false)} />}
        </div>
      </Streak>
    </AuthPromptProvider>
  )
}
