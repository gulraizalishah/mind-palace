import { useState } from 'react'
import { signIn, signUp, resetPassword } from '../services/auth'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      if (mode === 'login') await signIn(email, password)
      else {
        const { session } = await signUp(email, password)
        if (!session) setMsg('Check your email to confirm your account, then log in.')
      }
    } catch (err) { setMsg(err.message) }
    setBusy(false)
  }

  async function forgot() {
    if (!email) return setMsg('Type your email first.')
    try { await resetPassword(email); setMsg('Password reset email sent.') } catch (err) { setMsg(err.message) }
  }

  return (
    <main className="auth">
      <h1 className="big">Mind Palace</h1>
      <p className="sub">Learn useful things. Keep them forever.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        <button className="btn" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      {msg && <p role="status" className="note">{msg}</p>}
      <p className="links">
        <button className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMsg('') }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
        {mode === 'login' && <button className="link" onClick={forgot}>Forgot password</button>}
      </p>
    </main>
  )
}
