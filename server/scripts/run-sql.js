// Generic SQL runner: node scripts/run-sql.js <file.sql>
// Reads DATABASE_URL from env (pass inline; not stored in .env).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, isAbsolute } from 'node:path'
import { dbClient } from './_db.js'

const arg = process.argv[2]
if (!arg) {
  console.error('שימוש: node scripts/run-sql.js <file.sql>')
  process.exit(1)
}
const here = dirname(fileURLToPath(import.meta.url))
const file = isAbsolute(arg) ? arg : join(here, '..', arg)
const sql = readFileSync(file, 'utf8')

const client = dbClient()
try {
  await client.connect()
  console.log('מריץ:', arg)
  await client.query(sql)
  console.log('✅ הושלם בהצלחה.')
} catch (e) {
  console.error('❌ שגיאה:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
