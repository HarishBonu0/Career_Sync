import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key.
// NEVER expose the service role key to the browser.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in the environment')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is not set in the environment')
}

// Singleton pattern to avoid multiple instances during hot reloads
const globalForSupabase = globalThis as unknown as { supabaseAdmin?: ReturnType<typeof createClient> }

export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ||
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

globalForSupabase.supabaseAdmin = supabaseAdmin

export default supabaseAdmin
