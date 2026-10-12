import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// True when .env is missing or misnamed. main.jsx shows a clear message instead of a blank page.
export const envMissing = !url || !key

// Only the public anon key is used here. Never put the service_role key in the app.
export const supabase = envMissing ? null : createClient(url, key)
