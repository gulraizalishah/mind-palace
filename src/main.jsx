import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { envMissing } from './services/supabase'
import { ThemeProvider } from './hooks/useTheme.jsx'

createRoot(document.getElementById('root')).render(
  envMissing ? (
    <main style={{ padding: 24, maxWidth: 520, margin: '0 auto' }}>
      <h1>Supabase keys not found</h1>
      <p>Create a file named <b>.env</b> in the project folder (next to package.json) with:</p>
      <pre>{'VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co\nVITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY'}</pre>
      <p>Then stop the server (Ctrl + C) and run <b>npm run dev</b> again.</p>
    </main>
  ) : (
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  ),
)
