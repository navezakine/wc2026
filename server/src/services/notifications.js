import webpush from 'web-push'
import { supabase } from '../config/supabase.js'

export function initWebPush() {
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) {
    console.warn('[push] VAPID keys missing — push notifications disabled')
    return false
  }
  webpush.setVapidDetails('mailto:navezakin12@gmail.com', pub, priv)
  return true
}

async function sendOne(sub, payload) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    )
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — remove it
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    }
  }
}

export async function sendMatchReminders() {
  if (!supabase) return
  const now = new Date()

  // Check both 12-hour and 5-hour windows (±30 min around target)
  const windows = [
    { hours: 12, label: '12' },
    { hours: 5,  label: '5'  },
  ]

  for (const { hours, label } of windows) {
    const windowStart = new Date(now.getTime() + (hours - 0.5) * 3_600_000)
    const windowEnd   = new Date(now.getTime() + (hours + 0.5) * 3_600_000)

    const { data: matches } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date')
      .eq('status', 'SCHEDULED')
      .gte('match_date', windowStart.toISOString())
      .lte('match_date', windowEnd.toISOString())

    if (!matches?.length) continue

    for (const match of matches) {
      // All subscriptions + the subscriber's phone_number
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, member_id, members!inner(phone_number)')

      if (!subs?.length) continue

      // Phone numbers that already have a prediction for this match
      const { data: preds } = await supabase
        .from('predictions')
        .select('members!inner(phone_number)')
        .eq('match_id', match.id)

      const predicted = new Set(preds?.map((p) => p.members.phone_number) ?? [])

      const toNotify = subs.filter((s) => !predicted.has(s.members.phone_number))

      const payload = {
        title: `⚽ תזכורת — עוד ${label} שעות לקיקאוף`,
        body: `${match.home_team} נגד ${match.away_team} — מהרו לנחש!`,
        url: '/app/matches',
        tag: `match-${match.id}-${label}h`,
      }

      await Promise.allSettled(toNotify.map((s) => sendOne(s, payload)))
      console.log(`[push] שלחנו ${toNotify.length} תזכורות ל-${label}h לפני ${match.home_team} vs ${match.away_team}`)
    }
  }
}
