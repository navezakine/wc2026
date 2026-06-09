import 'dotenv/config'
import cron from 'node-cron'
import { createApp } from './src/app.js'
import { syncMatches } from './src/services/matchSync.js'
import { initWebPush, sendMatchReminders } from './src/services/notifications.js'

const PORT = process.env.PORT || 4000
const app = createApp()

app.listen(PORT, () => {
  console.log(`\n  ⚽  שרת ליגת הניחושים פועל על http://localhost:${PORT}`)
  console.log(`     בריאות: http://localhost:${PORT}/api/health`)

  // Daily match sync at 06:00 Israel time (Asia/Jerusalem)
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (key && !key.startsWith('your-')) {
    cron.schedule(
      '0 6 * * *',
      async () => {
        try {
          const r = await syncMatches()
          console.log('[cron] סנכרון משחקים הושלם:', JSON.stringify(r))
        } catch (e) {
          console.error('[cron] שגיאת סנכרון משחקים:', e.message)
        }
      },
      { timezone: 'Asia/Jerusalem' },
    )
    console.log('     ⏰ סנכרון משחקים יומי מתוזמן ל-06:00 (Asia/Jerusalem)\n')
  } else {
    console.log('     (סנכרון משחקים מושבת — חסר FOOTBALL_DATA_API_KEY)\n')
  }

  // Push notification reminders — runs every 30 minutes
  if (initWebPush()) {
    cron.schedule('*/30 * * * *', async () => {
      try {
        await sendMatchReminders()
      } catch (e) {
        console.error('[cron] שגיאת שליחת התראות:', e.message)
      }
    })
    console.log('     🔔 תזכורות push מתוזמנות (כל 30 דקות)\n')
  }
})
