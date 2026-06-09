import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// POST /api/push/subscribe — save or update a push subscription
router.post('/subscribe', async (req, res, next) => {
  try {
    const { memberId, endpoint, p256dh, auth } = req.body
    if (!memberId || !endpoint || !p256dh || !auth) {
      return res.status(400).send('חסרים פרטי הרשמה')
    }
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')

    // Upsert on endpoint (unique per device); update member_id if they switch groups
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ member_id: memberId, endpoint, p256dh, auth }, { onConflict: 'endpoint' })

    if (error) throw error
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/push/subscribe — remove a subscription (user turned off notifications)
router.delete('/subscribe', async (req, res, next) => {
  try {
    const { endpoint } = req.body
    if (!endpoint) return res.status(400).send('חסר endpoint')
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')

    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
