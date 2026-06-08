// Shared helper: build a pg.Client from DATABASE_URL, parsing the connection
// string manually so special characters in the password are used literally.
import 'dotenv/config'
import pg from 'pg'

export function dbClient() {
  const raw = process.env.DATABASE_URL
  if (!raw || raw.trim() === '' || raw.includes('YOUR-DB-PASSWORD')) {
    throw new Error('חסר DATABASE_URL בקובץ server/.env')
  }
  let s = raw.trim().replace(/^postgres(ql)?:\/\//i, '')
  const at = s.lastIndexOf('@')
  const userinfo = s.slice(0, at)
  const hostpart = s.slice(at + 1)
  const colon = userinfo.indexOf(':')
  const user = decodeURIComponent(userinfo.slice(0, colon))
  const password = userinfo.slice(colon + 1)
  const slash = hostpart.indexOf('/')
  const hostport = slash >= 0 ? hostpart.slice(0, slash) : hostpart
  const database = slash >= 0 ? hostpart.slice(slash + 1).split('?')[0] || 'postgres' : 'postgres'
  const lc = hostport.lastIndexOf(':')
  const host = lc >= 0 ? hostport.slice(0, lc) : hostport
  const port = lc >= 0 ? Number(hostport.slice(lc + 1)) : 5432
  return new pg.Client({ user, password, host, port, database, ssl: { rejectUnauthorized: false } })
}
