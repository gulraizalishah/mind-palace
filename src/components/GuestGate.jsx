import { useAuthPrompt } from '../hooks/useAuthPrompt'

// Shown on tabs that need an account.
export default function GuestGate({ title, text, button = 'Log in or create an account' }) {
  const { askLogin } = useAuthPrompt()
  return (
    <main className="gate">
      <h1>{title}</h1>
      <p className="sub">{text}</p>
      <button className="btn" onClick={() => askLogin(title)}>{button}</button>
    </main>
  )
}
