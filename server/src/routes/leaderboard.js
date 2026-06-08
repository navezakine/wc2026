import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// GET /api/leaderboard?groupId=...  — ranked members (optionally per group)
router.get('/', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    let query = supabase.from('leaderboard').select('*')
    if (req.query.groupId) query = query.eq('group_id', req.query.groupId)
    const { data, error } = await query.order('rank', { ascending: true })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
