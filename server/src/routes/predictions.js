import { Router } from 'express'
import { supabase, usingServiceRole } from '../config/supabase.js'
import { awardReferral } from '../services/referrals.js'

const router = Router()

// After a member saves a prediction, track referred-prediction progress and
// fire the one-time group_join bonus (10 pts to the referrer) at exactly 3.
async function trackReferredProgress(memberId) {
  try {
    const { count } = await supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
    const total = count ?? 0
    await supabase.from('members').update({ referred_prediction_count: total }).eq('id', memberId)
    if (total < 3) return

    const { data: mem } = await supabase
      .from('members')
      .select('referred_by')
      .eq('id', memberId)
      .single()
    if (!mem?.referred_by) return

    const { count: already } = await supabase
      .from('referral_events')
      .select('*', { count: 'exact', head: true })
      .eq('referred_member_id', memberId)
      .eq('event_type', 'group_join')
    if (already) return // fire once only

    await awardReferral({
      referrerId: mem.referred_by,
      referredMemberId: memberId,
      eventType: 'group_join',
      points: 10,
    })
  } catch (e) {
    console.error('[referral group_join]', e.message) // never fail the prediction save
  }
}

const winnerFromScores = (h, a) => (h > a ? 'home' : h < a ? 'away' : 'draw')

// GET /api/predictions?memberId=... — a member's predictions
router.get('/', async (req, res, next) => {
  try {
    const { memberId } = req.query
    if (!memberId) return res.status(400).send('חסר מזהה משתתף (memberId)')
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('member_id', memberId)
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// POST /api/predictions — save / update a prediction
router.post('/', async (req, res, next) => {
  try {
    const {
      memberId,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
      predictedTopScorer,
    } = req.body || {}

    if (!memberId || !matchId || predictedHomeScore == null || predictedAwayScore == null) {
      return res.status(400).send('נתוני ניחוש חסרים')
    }
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    if (!usingServiceRole) {
      return res
        .status(403)
        .send('שמירת ניחושים דורשת מפתח service_role בשרת. הוסיפו SUPABASE_SERVICE_ROLE_KEY לקובץ .env')
    }

    const home = Number(predictedHomeScore)
    const away = Number(predictedAwayScore)

    const outcome = winnerFromScores(home, away)
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        {
          member_id: memberId,
          match_id: matchId,
          predicted_outcome: outcome,
          predicted_winner: outcome, // legacy column kept in sync
          predicted_home_score: home,
          predicted_away_score: away,
          predicted_top_scorer: predictedTopScorer || null,
        },
        { onConflict: 'member_id,match_id' },
      )
      .select()
    if (error) throw error // Hebrew messages from DB triggers bubble up here

    await trackReferredProgress(memberId)
    res.status(201).json(data?.[0])
  } catch (err) {
    next(err)
  }
})

export default router
