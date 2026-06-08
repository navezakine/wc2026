// Seed the database with a demo group, members, matches and predictions.
// Inserts predictions while matches are 'scheduled', then marks some as
// 'finished' so the points trigger fires and the leaderboard fills up.
// Usage: node scripts/seed.js   (reads DATABASE_URL from server/.env)
import { dbClient } from './_db.js'

const group = { name: 'חברים מהעבודה', tier: 'free' }

const members = [
  { display_name: 'דניאל כהן', phone_number: '+972501000001' },
  { display_name: 'מאיה לוי', phone_number: '+972501000002' },
  { display_name: 'יוסי אברהם', phone_number: '+972501000003' },
  { display_name: 'נועה פרידמן', phone_number: '+972501000004' },
  { display_name: 'איתי שמש', phone_number: '+972501000005' },
  { display_name: 'רוני בר', phone_number: '+972501000006' },
]

// fin = finished (with result), live = in progress, otherwise upcoming
const matches = [
  { home: 'ברזיל', away: 'צרפת', date: '2026-06-03T19:00:00Z', fin: { h: 2, a: 1, s: 'ויניסיוס' } },
  { home: 'ארגנטינה', away: 'גרמניה', date: '2026-06-04T19:00:00Z', fin: { h: 3, a: 1, s: 'מסי' } },
  { home: 'ספרד', away: 'פורטוגל', date: '2026-06-04T16:00:00Z', fin: { h: 1, a: 2, s: 'רונאלדו' } },
  { home: 'אנגליה', away: 'הולנד', date: '2026-06-05T19:00:00Z', fin: { h: 2, a: 2, s: 'קיין' } },
  { home: 'גרמניה', away: 'אנגליה', date: '2026-06-06T19:00:00Z', live: { h: 1, a: 0 } },
  { home: 'מקסיקו', away: 'קנדה', date: '2026-06-11T19:00:00Z' },
  { home: 'ארה"ב', away: 'אורוגוואי', date: '2026-06-12T16:00:00Z' },
  { home: 'בלגיה', away: 'קרואטיה', date: '2026-06-12T19:00:00Z' },
  { home: 'צרפת', away: 'ספרד', date: '2026-06-13T19:00:00Z' },
  { home: 'ברזיל', away: 'ארגנטינה', date: '2026-06-14T19:00:00Z' },
]

const winner = (h, a) => (h > a ? 'home' : h < a ? 'away' : 'draw')

const c = dbClient()
try {
  await c.connect()
  console.log('מנקה נתונים קיימים…')
  await c.query('truncate table public.predictions, public.members, public.matches, public.groups cascade')

  const g = (
    await c.query('insert into public.groups (name, tier) values ($1, $2) returning id, invite_code', [
      group.name,
      group.tier,
    ])
  ).rows[0]
  console.log(`קבוצה נוצרה: ${group.name} (קוד הזמנה: ${g.invite_code})`)

  const memIds = []
  for (const m of members) {
    const r = await c.query(
      'insert into public.members (group_id, display_name, phone_number) values ($1, $2, $3) returning id',
      [g.id, m.display_name, m.phone_number],
    )
    memIds.push(r.rows[0].id)
  }

  const matchIds = []
  for (const mt of matches) {
    const r = await c.query(
      'insert into public.matches (home_team, away_team, match_date, status) values ($1, $2, $3, $4) returning id',
      [mt.home, mt.away, mt.date, 'scheduled'],
    )
    matchIds.push(r.rows[0].id)
  }

  // Predictions (only while matches are still 'scheduled')
  let predCount = 0
  for (let mi = 0; mi < members.length; mi++) {
    for (let xi = 0; xi < matches.length; xi++) {
      const mt = matches[xi]
      // predict on settled/live matches + the first two upcoming; leave the rest open
      if (!mt.fin && !mt.live && xi > 6) continue
      const base = mt.fin || mt.live || { h: 1, a: 1 }
      const ph = Math.max(0, base.h + ((mi % 3) - 1))
      const pa = Math.max(0, base.a + (mi % 2))
      const scorer = mt.fin ? (mi % 2 === 0 ? mt.fin.s : 'שחקן אחר') : null
      await c.query(
        `insert into public.predictions
           (member_id, match_id, predicted_winner, predicted_home_score, predicted_away_score, predicted_top_scorer)
         values ($1, $2, $3, $4, $5, $6)`,
        [memIds[mi], matchIds[xi], winner(ph, pa), ph, pa, scorer],
      )
      predCount++
    }
  }
  console.log(`נוצרו ${predCount} ניחושים.`)

  // Settle results -> fires the points trigger
  for (let xi = 0; xi < matches.length; xi++) {
    const mt = matches[xi]
    if (mt.fin) {
      await c.query(
        'update public.matches set status=$1, home_score=$2, away_score=$3, top_scorer=$4 where id=$5',
        ['finished', mt.fin.h, mt.fin.a, mt.fin.s, matchIds[xi]],
      )
    } else if (mt.live) {
      await c.query('update public.matches set status=$1, home_score=$2, away_score=$3 where id=$4', [
        'live',
        mt.live.h,
        mt.live.a,
        matchIds[xi],
      ])
    }
  }

  // Make sure the API roles can read (RLS still gates writes)
  await c.query('grant usage on schema public to anon, authenticated')
  await c.query(
    `grant select on public.matches, public.groups, public.members,
       public.predictions, public.matches_view, public.leaderboard to anon, authenticated`,
  )

  const lb = await c.query(
    'select display_name as "שם", total_points as "נקודות", exact_scores as "מדויקים", rank as "דירוג" from public.leaderboard where group_id=$1 order by rank',
    [g.id],
  )
  console.log('\n🏆 טבלת הדירוג לאחר הזריעה:')
  console.table(lb.rows)
  console.log('\n✅ הזריעה הושלמה בהצלחה.')
} catch (e) {
  console.error('❌ שגיאה בזריעה:', e.message)
  process.exitCode = 1
} finally {
  await c.end()
}
