import { createClient } from '@supabase/supabase-js'

// Normalize: supabase-js wants the bare project URL (no /rest/v1/ suffix).
function normalizeUrl(u) {
  if (!u) return u
  return u.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
}

const url = normalizeUrl(process.env.SUPABASE_URL)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY

const placeholder = (v) => !v || v.startsWith('your-') || v.trim() === ''

// Prefer the service_role key (server is the trusted layer — Option A).
// Falls back to the anon key for read-only access.
const key = !placeholder(serviceKey) ? serviceKey : anonKey

export const usingServiceRole = !placeholder(serviceKey)
export const supabase =
  !placeholder(url) && !placeholder(key)
    ? createClient(url, key, { auth: { persistSession: false } })
    : null

export const isSupabaseConfigured = Boolean(supabase)

if (!isSupabaseConfigured) {
  console.warn('[supabase] לא הוגדר — השרת ירוץ במצב הדגמה.')
} else if (!usingServiceRole) {
  console.warn(
    '[supabase] משתמש במפתח anon (קריאה בלבד). לשמירת ניחושים הוסיפו SUPABASE_SERVICE_ROLE_KEY ל-.env',
  )
}
