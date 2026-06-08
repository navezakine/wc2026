// Referral simulation against the live API (localhost:4000):
//   - Creator C creates a group
//   - C invites 4 friends (F1..F4) via C's referral link
//   - F1..F4 each make 3 predictions (fires group_join bonus to C)
//   - F1 invites the rest (F5..F8) via F1's link (group reaches 9 -> milestone)
//   - F5..F8 each make 3 predictions (fires group_join bonus to F1)
// Then prints the referral-points breakdown per member.
import 'dotenv/config'
import { supabase } from '../src/config/supabase.js'

const B = 'http://localhost:4000/api'
const post = (p, body) =>
  fetch(B + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json())

let phone = 972520000000
const nextPhone = () => '+' + ++phone

// 0) reset competition entrants (answers "reset")
await supabase.from('members').update({ competition_entered: false, competition_consent_at: null }).not('id', 'is', null)
console.log('🔄 reset competition flags on all members\n')

// 1) creator creates the group
const create = await post('/groups', { fullName: 'יוצר הקבוצה', phone: nextPhone(), groupName: 'סימולציית הפניות' })
const C = { id: create.member.id, ref: create.member.referral_code }
const invite = create.group.invite_code
console.log(`קבוצה נוצרה · יוצר=יוצר הקבוצה · early_bird=${create.earlyBird}`)

const join = async (name, ref) => {
  const r = await post('/groups/join', { inviteCode: invite, fullName: name, phone: nextPhone(), ref })
  if (r.milestoneAwarded) console.log(`  ⭐ milestone! חבר הצטרף, הקבוצה הגיעה ל-${r.memberCount}, היוצר זוכה ב-${r.milestoneAwarded}`)
  return { id: r.member.id, ref: r.member.referral_code }
}

const sched = (await (await fetch(B + '/matches')).json()).filter((m) => m.status === 'SCHEDULED').slice(0, 3)
const predict3 = async (memberId) => {
  for (const m of sched) await post('/predictions', { memberId, matchId: m.id, predictedHomeScore: 1, predictedAwayScore: 0 })
}

// 2) C invites F1..F4
const F = []
for (let i = 1; i <= 4; i++) F.push(await join('חבר ' + i, C.ref))
console.log('✓ היוצר הזמין 4 חברים')

// 3) F1..F4 each make 3 predictions
for (const f of F) await predict3(f.id)
console.log('✓ 4 החברים ביצעו 3 ניחושים כל אחד')

// 4) F1 invites the rest (F5..F8)
const F2 = []
for (let i = 5; i <= 8; i++) F2.push(await join('חבר ' + i, F[0].ref))
console.log('✓ חבר 1 הזמין 4 חברים נוספים (הקבוצה מלאה: 9 חברים)')

// 5) F5..F8 each make 3 predictions
for (const f of F2) await predict3(f.id)
console.log('✓ 4 החברים החדשים ביצעו 3 ניחושים כל אחד\n')

// 6) report
const ids = [C.id, ...F.map((f) => f.id), ...F2.map((f) => f.id)]
const { data: members } = await supabase
  .from('members')
  .select('id, display_name, referral_points, prediction_points, total_points')
  .in('id', ids)
const { data: events } = await supabase
  .from('referral_events')
  .select('referrer_id, event_type, points_awarded')
  .in('referrer_id', ids)
const byId = Object.fromEntries(members.map((m) => [m.id, m]))

const rows = ids.map((id) => {
  const m = byId[id]
  const evs = events.filter((e) => e.referrer_id === id)
  const detail = {}
  for (const e of evs) detail[e.event_type] = (detail[e.event_type] || 0) + e.points_awarded
  return {
    שם: m.display_name,
    'נק׳ הזמנות': m.referral_points,
    'סה״כ': m.total_points,
    early_bird: detail.early_bird || 0,
    link_join: detail.link_join || 0,
    group_join: detail.group_join || 0,
    milestone: detail.group_milestone || 0,
  }
})
console.table(rows)
console.log('\n(הערה: כל הניחושים על משחקים עתידיים → נק׳ ניחוש = 0, כך שכל הניקוד כאן הוא נקודות הזמנות)')
process.exit(0)
