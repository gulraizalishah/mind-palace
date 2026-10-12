import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/auth'
import { saveTopics } from '../services/prefs'
import { lifeStats } from '../services/review'
import TopicChips from '../components/TopicChips'
import ThemeSetting from '../components/ThemeToggle'
import InstallCard from '../components/InstallCard'
import { useStreak } from '../hooks/useStreak'

export default function Profile({ categories }) {
  const { user, profile, prefs, isAdmin, reload } = useAuth()
  const [stats, setStats] = useState(null)
  const { streak } = useStreak()
  const selected = prefs?.selected_categories ?? []
  useEffect(() => { lifeStats().then(setStats).catch(() => {}) }, [])

  async function toggle(id) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    await saveTopics(user.id, next, true)
    await reload()
  }

  return (
    <main>
      <h1>Your Life Manual</h1>
      <p className="sub">{user.email}{isAdmin ? ' · admin' : ''}{profile?.display_name ? ` · ${profile.display_name}` : ''}</p>
      {stats && (
        <div className="stat">
          <div><b>{stats.things_saved}</b>Things saved</div>
          <div><b>{stats.memories_retained}</b>Memories retained</div>
          <div><b>{stats.times_recalled}</b>Recalled</div>
          <div><b>{streak.current}</b>Day streak (best {streak.longest})</div>
        </div>
      )}
      <InstallCard />
      <h3>Appearance</h3>
      <ThemeSetting />
      <h3 style={{ marginTop: 24 }}>Topics</h3>
      <TopicChips categories={categories} selected={selected} onToggle={toggle} />
      <button className="ghost" onClick={signOut}>Log out</button>
    </main>
  )
}
