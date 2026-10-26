import { useAuthPrompt } from '../hooks/useAuthPrompt'
import ThemeSetting from '../components/ThemeToggle'
import QualitySetting from '../components/QualitySetting'
import InstallCard from '../components/InstallCard'

export default function GuestProfile() {
  const { askLogin } = useAuthPrompt()
  return (
    <main>
      <h1>You are browsing as a guest</h1>
      <p className="sub">Create a free account to save cards to your palace, add your own memories, build a streak and review what you learned.</p>
      <button className="btn" onClick={() => askLogin('Log in or create an account')}>Log in or create an account</button>
      <div style={{ height: 28 }} />
      <InstallCard />
      <button className="ghost" style={{ marginTop: 0, marginBottom: 12 }} onClick={() => window.dispatchEvent(new Event('mp-tour'))}>Take the tour again</button>
      <h3>Appearance</h3>
      <ThemeSetting />
      <h3 style={{ marginTop: 20 }}>3D palace detail</h3>
      <QualitySetting />
    </main>
  )
}
