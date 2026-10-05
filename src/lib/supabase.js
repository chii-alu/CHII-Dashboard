// One shared Supabase connection for the whole app (Next.js version).
// The URL and publishable key come from .env.local (see .env.local.example).
// The publishable key is safe in the browser: Row Level Security only lets
// it READ, and only what the policies allow.
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error(
    'Supabase is not configured: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
    'to .env.local in the project root, then restart the dev server (npm run dev).'
  )
}

export const supabase = createClient(url, key)
