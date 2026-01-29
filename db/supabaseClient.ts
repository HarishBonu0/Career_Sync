import { createClient } from '@supabase/supabase-js'

// Browser-safe Supabase client (publishable/anon key only)
// This file works with Next.js environment variables

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ynyjhfldcjwsgfmhrbqy.supabase.co'

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM'

if (!supabaseUrl) {
  console.warn('Missing Supabase URL. Using default.')
}

if (!supabaseAnonKey) {
  console.warn('Missing Supabase anon key. Using default.')
}

const globalForSupabase = globalThis as unknown as { supabaseClient?: ReturnType<typeof createClient> }

export const supabaseClient =
  globalForSupabase.supabaseClient || createClient(supabaseUrl, supabaseAnonKey)

globalForSupabase.supabaseClient = supabaseClient

export default supabaseClient
