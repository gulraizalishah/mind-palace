import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { fetchCategories } from './services/cards'
import { fetchRooms } from './services/palace'
import AuthScreen from './components/AuthScreen'
import Onboarding from './components/Onboarding'
import Nav from './components/Nav'
import Header from './components/Header'
import OfflineBanner from './components/OfflineBanner'
import { StreakProvider } from './hooks/useStreak'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Palace from './pages/Palace'
import Review from './pages/Review'

export default function App() {
  const { user, prefs, loading } = useAuth()
  const [tab, setTab] = useState('home')
  const [categories, setCategories] = useState([])
  const [rooms, setRooms] = useState([])
  const [loadError, setLoadError] = useState('')
  const [cat, setCat] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([fetchCategories(), fetchRooms()])
      .then(([c, r]) => { setCategories(c); setRooms(r) })
      .catch((e) => setLoadError(e.message))
  }, [user])

  if (loading) return <main><p className="sub">Loading…</p></main>
  if (!user) return <AuthScreen />
  if (loadError) return <main><p className="note" role="alert">Could not reach the database: {loadError}</p></main>
  if (!categories.length) return <main><p className="sub">Loading…</p></main>
  if (!prefs?.onboarded) return <Onboarding categories={categories} />

  return (
    <StreakProvider>
    <div id="app">
      <OfflineBanner />
      <Header categories={categories} activeCat={cat} onPickCat={(id) => { setCat(id); setTab('home') }} />
      {tab === 'home' && <Feed key={cat ?? 'all'} categories={categories} rooms={rooms} categoryId={cat} />}
      {tab === 'palace' && <Palace categories={categories} rooms={rooms} />}
      {tab === 'review' && <Review />}
      {tab === 'profile' && <Profile categories={categories} />}
      <Nav tab={tab} onChange={setTab} />
    </div>
    </StreakProvider>
  )
}
