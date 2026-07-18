import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(rawUrl && rawKey && !rawUrl.includes('YOUR-PROJECT'))

if (!supabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Missing or placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your real project values to enable saving.'
  )
}

// createClient() throws synchronously on an invalid URL (crashing the whole
// app to a blank page). Fall back to a harmless placeholder so an
// unconfigured setup still renders — real calls will just fail gracefully.
export const supabase = createClient(
  supabaseConfigured ? rawUrl : 'https://placeholder.supabase.co',
  supabaseConfigured ? rawKey : 'placeholder-anon-key'
)
