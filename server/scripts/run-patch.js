// Applies supabase-patch.sql (idempotent ALTERs) to DATABASE_URL.
// Usage: node scripts/run-patch.js
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dbClient } from './_db.js'

const here = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(here, '..', 'supabase-patch.sql'), 'utf8')

const client = dbClient()
try {
  await client.connect()
  console.log('מריץ את הפאטץ׳ (supabase-patch.sql)…')
  await client.query(sql)
  console.log('✅ הפאטץ׳ הוחל בהצלחה.')

  const { rows: tables } = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE' order by table_name`,
  )
  console.log('📋 טבלאות:', tables.map((r) => r.table_name).join(', '))
} catch (e) {
  console.error('❌ שגיאה:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
