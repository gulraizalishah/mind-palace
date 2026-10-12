import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { saveTopics } from '../services/prefs'
import TopicChips from './TopicChips'

export default function Onboarding({ categories }) {
  const { user, reload } = useAuth()
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState([])
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  async function finish() {
    await saveTopics(user.id, picked, true)
    await reload()
  }

  return (
    <main className="auth">
      {step === 0 && (<>
        <h1 className="big">Build a mind that keeps what it learns.</h1>
        <p className="sub">Short, useful knowledge you can save and actually remember.</p>
        <button className="btn" onClick={() => setStep(1)}>Get started</button>
      </>)}
      {step === 1 && (<>
        <h1 className="big">What are you interested in?</h1>
        <TopicChips categories={categories.filter((c) => c.is_primary)} selected={picked} onToggle={toggle} />
        <button className="btn" onClick={() => setStep(2)}>Continue</button>
      </>)}
      {step === 2 && (<>
        <h1 className="big">Welcome to your Palace.</h1>
        <p className="sub">Learn something, save it, place it, recall it later.</p>
        <button className="btn" onClick={finish}>Start learning</button>
      </>)}
    </main>
  )
}
