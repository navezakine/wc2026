import { Router } from 'express'
import { timingSafeEqual } from 'node:crypto'
import { supabase, usingServiceRole } from '../config/supabase.js'
import { syncMatches } from '../services/matchSync.js'
import { recalcAll } from '../services/scoring.js'

const router = Router()

// Constant-time string compare (avoids timing attacks on the password)
function safeEqual(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

// Admin auth: x-admin-password header must match ADMIN_PASSWORD.
function admin(req, res, next) {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw || pw.startsWith('your-')) return res.status(503).send('ADMIN_PASSWORD לא הוגדר בשרת')
  if (!safeEqual(req.get('x-admin-password') || '', pw)) {
    return res.status(401).send('סיסמת מנהל שגויה')
  }
  if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
  next()
}

// GET /api/admin/stats
router.get('/stats', admin, async (_req, res, next) => {
  try {
    const [users, groups, paid] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }),
      supabase.from('groups').select('*', { count: 'exact', head: true }).eq('tier', 'paid'),
    ])
    const { data: approved } = await supabase.from('payments').select('amount').eq('status', 'approved')
    const { count: manual } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'manual')
    const revenue = (approved || []).reduce((s, p) => s + (p.amount || 0), 0)
    res.json({
      users: users.count ?? 0,
      groups: groups.count ?? 0,
      paidGroups: paid.count ?? 0,
      revenue,
      manualUpgrades: manual ?? 0,
    })
  } catch (e) {
    next(e)
  }
})

// GET /api/admin/groups
router.get('/groups', admin, async (_req, res, next) => {
  try {
    const { data } = await supabase
      .from('groups')
      .select('id, name, invite_code, tier, created_at, members!members_group_id_fkey(count)')
      .order('created_at', { ascending: true })
    res.json((data || []).map((g) => ({ ...g, member_count: g.members?.[0]?.count ?? 0, members: undefined })))
  } catch (e) {
    next(e)
  }
})

// POST /api/admin/groups/:id/upgrade — manual upgrade (bank transfer / Bit / etc.)
router.post('/groups/:id/upgrade', admin, async (req, res, next) => {
  try {
    if (!usingServiceRole) return res.status(403).send('דרוש מפתח service_role בשרת')
    const id = req.params.id
    await supabase.from('groups').update({ tier: 'paid' }).eq('id', id)
    const { data: g } = await supabase.from('groups').select('creator_member_id').eq('id', id).maybeSingle()
    await supabase.from('payments').insert({
      group_id: id,
      member_id: g?.creator_member_id || null,
      transaction_uid: null,
      amount: 29,
      currency: 'ILS',
      status: 'manual',
    })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// POST /api/admin/winner — announce a competition winner
router.post('/winner', admin, async (req, res, next) => {
  try {
    if (!usingServiceRole) return res.status(403).send('דרוש מפתח service_role בשרת')
    const { memberId, prizeDescription } = req.body || {}
    if (!memberId) return res.status(400).send('חסר מזהה זוכה')
    const { data: mem } = await supabase.from('members').select('group_id').eq('id', memberId).maybeSingle()
    const { data, error } = await supabase
      .from('winners')
      .insert({
        member_id: memberId,
        group_id: mem?.group_id || null,
        prize_description: prizeDescription || null,
        announced_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (e) {
    next(e)
  }
})

// POST /api/admin/sync-matches — manual football-data sync (protected)
router.post('/sync-matches', admin, async (_req, res, next) => {
  try {
    res.json(await syncMatches())
  } catch (e) {
    next(e)
  }
})

// POST /api/admin/recalc — recompute all points (protected)
router.post('/recalc', admin, async (_req, res, next) => {
  try {
    res.json(await recalcAll(supabase))
  } catch (e) {
    next(e)
  }
})

export default router
