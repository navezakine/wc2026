import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// POST /api/auth/login — find account(s) by phone number
router.post('/login', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const phone = req.body?.phone?.trim()
    if (!phone) return res.status(400).send('יש להזין מספר טלפון')

    const { data, error } = await supabase
      .from('members')
      .select('id, display_name, group_id, groups!members_group_id_fkey(id, name)')
      .eq('phone_number', phone)

    if (error) throw error
    if (!data?.length) return res.status(404).send('לא נמצא חשבון עם מספר טלפון זה')

    res.json(
      data.map((m) => ({
        id: m.id,
        display_name: m.display_name,
        group_id: m.group_id,
        group_name: m.groups?.name,
      })),
    )
  } catch (err) {
    next(err)
  }
})

export default router
