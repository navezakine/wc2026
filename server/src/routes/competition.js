import { Router } from 'express'
import { supabase, usingServiceRole } from '../config/supabase.js'
import { COMPETITION_PRIZE, COMPETITION_END } from '../lib/constants.js'

const router = Router()

// GET /api/competition — status (participants, prize, end time)
router.get('/', async (_req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('competition_entered', true)

    // Latest announced winner (if any)
    const { data: w } = await supabase
      .from('winners')
      .select('prize_description, announced_at, members(display_name)')
      .order('announced_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const winner = w
      ? { name: w.members?.display_name, prize: w.prize_description, announcedAt: w.announced_at }
      : null

    res.json({ participants: count ?? 0, prize: COMPETITION_PRIZE, endsAt: COMPETITION_END, winner })
  } catch (err) {
    next(err)
  }
})

// Build the ranked rows for entered members (with predictions_made)
async function buildRows() {
  const { data: members } = await supabase
    .from('members')
    .select('id, display_name, prediction_points, referral_points, total_points, joined_at')
    .eq('competition_entered', true)

  const ids = (members || []).map((m) => m.id)
  const counts = {}
  if (ids.length) {
    const { data: preds } = await supabase
      .from('predictions')
      .select('member_id')
      .eq('voided', false)
      .in('member_id', ids)
    for (const p of preds || []) counts[p.member_id] = (counts[p.member_id] || 0) + 1
  }

  return (members || []).map((m) => ({
    member_id: m.id,
    display_name: m.display_name,
    prediction_points: m.prediction_points ?? 0,
    referral_points: Math.min(m.referral_points ?? 0, 100),
    total_points: m.total_points ?? 0,
    predictions_made: counts[m.id] || 0,
    joined_at: m.joined_at,
  }))
}

// GET /api/competition/leaderboard?tab=skill|overall
router.get('/leaderboard', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const tab = req.query.tab === 'skill' ? 'skill' : 'overall'
    const rows = await buildRows()

    rows.sort((a, b) => {
      if (tab === 'skill') {
        // prediction_points only; tie -> more predictions -> earliest join
        if (b.prediction_points !== a.prediction_points) return b.prediction_points - a.prediction_points
        if (b.predictions_made !== a.predictions_made) return b.predictions_made - a.predictions_made
        return new Date(a.joined_at) - new Date(b.joined_at)
      }
      // overall: total_points; tie -> prediction_points -> predictions -> earliest join
      if (b.total_points !== a.total_points) return b.total_points - a.total_points
      if (b.prediction_points !== a.prediction_points) return b.prediction_points - a.prediction_points
      if (b.predictions_made !== a.predictions_made) return b.predictions_made - a.predictions_made
      return new Date(a.joined_at) - new Date(b.joined_at)
    })
    rows.forEach((r, i) => (r.rank = i + 1))
    res.json({ tab, rows })
  } catch (err) {
    next(err)
  }
})

// POST /api/competition/enter { memberId, consent }
router.post('/enter', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    if (!usingServiceRole) return res.status(403).send('פעולה זו דורשת מפתח service_role בשרת')
    const { memberId, consent } = req.body || {}
    if (!memberId) return res.status(400).send('חסר מזהה משתתף')
    if (!consent) return res.status(400).send('יש לאשר את תקנון התחרות')

    // Eligibility: at least one friend joined via this member
    const { count: invited } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', memberId)
    if ((invited ?? 0) < 1) {
      return res.status(403).send('הזמן לפחות חבר אחד כדי להיכנס לתחרות')
    }

    await supabase
      .from('members')
      .update({ competition_entered: true, competition_consent_at: new Date().toISOString() })
      .eq('id', memberId)

    res.json({ ok: true, competitionEntered: true })
  } catch (err) {
    next(err)
  }
})

export default router
