import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

// Lazy singletons — only instantiated on first use so build-time static
// page generation doesn't crash on missing env vars
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) _supabase = createClient(supabaseUrl, supabaseAnonKey)
    return (_supabase as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    return (_supabaseAdmin as unknown as Record<string | symbol, unknown>)[prop]
  },
})
