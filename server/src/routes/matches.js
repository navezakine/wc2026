import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// GET /api/matches — all matches (with Hebrew status_label from the view)
router.get('/', async (_req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const { data, error } = await supabase
      .from('matches_view')
      .select('*')
      .order('match_date', { ascending: true })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

export default router
