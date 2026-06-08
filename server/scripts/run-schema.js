// One-off helper: applies supabase-schema.sql to the database in DATABASE_URL.
// Usage: node scripts/run-schema.js   (reads DATABASE_URL from server/.env)
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const raw = process.env.DATABASE_URL
if (!raw || raw.trim() === '' || raw.includes('YOUR-DB-PASSWORD')) {
  console.error('❌ חסר DATABASE_URL בקובץ server/.env (מחרוזת החיבור ל-Supabase).')
  process.exit(1)
}

// Manual parse so special characters in the password (e.g. ! ? @ #) are used
// literally and not mis-interpreted as URL query/fragment delimiters.
function parseConn(s) {
  s = s.trim().replace(/^postgres(ql)?:\/\//i, '')
  const at = s.lastIndexOf('@')
  const userinfo = s.slice(0, at)
  const hostpart = s.slice(at + 1)
  const colon = userinfo.indexOf(':')
  const user = decodeURIComponent(userinfo.slice(0, colon))
  const password = userinfo.slice(colon + 1) // literal, no decoding
  const slash = hostpart.indexOf('/')
  const hostport = slash >= 0 ? hostpart.slice(0, slash) : hostpart
  const database = slash >= 0 ? hostpart.slice(slash + 1).split('?')[0] || 'postgres' : 'postgres'
  const lastColon = hostport.lastIndexOf(':')
  const host = lastColon >= 0 ? hostport.slice(0, lastColon) : hostport
  const port = lastColon >= 0 ? Number(hostport.slice(lastColon + 1)) : 5432
  return { user, password, host, port, database }
}

const cfg = parseConn(raw)
const here = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(here, '..', 'supabase-schema.sql'), 'utf8')

const client = new pg.Client({
  ...cfg,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
})

try {
  console.log(`מתחבר ל-${cfg.host}:${cfg.port} (משתמש: ${cfg.user})…`)
  await client.connect()
  console.log('מריץ את הסכימה (supabase-schema.sql)…')
  await client.query(sql)
  console.log('✅ הסכימה הורצה בהצלחה.')

  const { rows: tables } = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE'
     order by table_name`,
  )
  const { rows: views } = await client.query(
    `select table_name from information_schema.views
     where table_schema = 'public' order by table_name`,
  )
  console.log('📋 טבלאות:', tables.map((r) => r.table_name).join(', ') || '(אין)')
  console.log('👁️  תצוגות:', views.map((r) => r.table_name).join(', ') || '(אין)')
} catch (e) {
  console.error('❌ שגיאה:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
