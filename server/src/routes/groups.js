import { Router } from 'express'
import QRCode from 'qrcode'
import { supabase, usingServiceRole } from '../config/supabase.js'
import { awardReferral, applyReferral } from '../services/referrals.js'
import { APP_BASE_URL } from '../lib/constants.js'

const router = Router()

const buildLinks = (inviteCode, referralCode) => ({
  group: `${APP_BASE_URL}/join/${inviteCode}`,
  referral: `${APP_BASE_URL}/join?ref=${referralCode}`,
  joinWithRef: `${APP_BASE_URL}/join/${inviteCode}?ref=${referralCode}`,
})

const requireWrite = (res) => {
  if (!supabase) {
    res.status(503).send('מסד הנתונים אינו מוגדר')
    return false
  }
  if (!usingServiceRole) {
    res.status(403).send('פעולה זו דורשת מפתח service_role בשרת')
    return false
  }
  return true
}

// GET /api/groups — all groups with a member count
router.get('/', async (_req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, invite_code, qr_code_url, tier, created_at, members!members_group_id_fkey(count)')
      .order('created_at', { ascending: true })
    if (error) throw error
    res.json((data || []).map((g) => ({ ...g, member_count: g.members?.[0]?.count ?? 0, members: undefined })))
  } catch (err) {
    next(err)
  }
})

// GET /api/groups/by-invite/:code — public group info for the join page
router.get('/by-invite/:code', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, invite_code, tier, members!members_group_id_fkey(count)')
      .eq('invite_code', req.params.code)
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).send('הקבוצה לא נמצאה')
    res.json({
      id: data.id,
      name: data.name,
      invite_code: data.invite_code,
      tier: data.tier,
      member_count: data.members?.[0]?.count ?? 0,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/groups/member/:id/referrals — referral widget + competition eligibility
router.get('/member/:id/referrals', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const id = req.params.id
    const { data: mem } = await supabase
      .from('members')
      .select('referral_code, referral_points, prediction_points, total_points, is_early_bird, competition_entered')
      .eq('id', id)
      .maybeSingle()
    if (!mem) return res.status(404).send('המשתתף לא נמצא')

    // Friends who actually joined via this member's link
    const { data: friends } = await supabase
      .from('members')
      .select('display_name, joined_at')
      .eq('referred_by', id)
      .order('joined_at', { ascending: true })

    const invited = friends?.length ?? 0
    const points = mem.referral_points ?? 0
    res.json({
      invited,
      friends: friends || [],
      points,
      predictionPoints: mem.prediction_points ?? 0,
      totalPoints: mem.total_points ?? 0,
      capReached: points >= 100,
      isEarlyBird: !!mem.is_early_bird,
      competitionEntered: !!mem.competition_entered,
      eligibleForCompetition: invited >= 1, // ≥1 friend joined (link_join/group_join)
      referralCode: mem.referral_code,
      referralLink: `${APP_BASE_URL}/join?ref=${mem.referral_code}`,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/groups/:id/members — members of a group
router.get('/:id/members', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const { data, error } = await supabase
      .from('members')
      .select('id, display_name, phone_number, joined_at')
      .eq('group_id', req.params.id)
      .order('joined_at', { ascending: true })
    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/groups/:id/results — finished matches + each member's prediction (for the grid)
router.get('/:id/results', async (req, res, next) => {
  try {
    if (!supabase) return res.status(503).send('מסד הנתונים אינו מוגדר')
    const groupId = req.params.id

    const { data: members } = await supabase
      .from('members')
      .select('id, display_name, total_points')
      .eq('group_id', groupId)
      .order('total_points', { ascending: false })

    const { data: matches } = await supabase
      .from('matches')
      .select('id, home_team, away_team, home_score, away_score, round, match_date, status')
      .eq('status', 'FINISHED')
      .order('match_date', { ascending: true })

    const memberIds = (members || []).map((m) => m.id)
    const predictions = {}
    if (memberIds.length) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('member_id, match_id, predicted_home_score, predicted_away_score, predicted_outcome, points_earned, voided')
        .in('member_id', memberIds)
      for (const p of preds || []) predictions[`${p.member_id}|${p.match_id}`] = p
    }

    res.json({ members: members || [], matches: matches || [], predictions })
  } catch (err) {
    next(err)
  }
})

// POST /api/groups — create a group + its creator member (optionally via ?ref)
router.post('/', async (req, res, next) => {
  try {
    if (!requireWrite(res)) return
    const { fullName, phone, groupName, ref } = req.body || {}
    if (!fullName?.trim() || !groupName?.trim()) {
      return res.status(400).send('יש למלא שם מלא ושם קבוצה')
    }

    // Early bird: first 100 members across the whole app
    const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true })
    const earlyBird = (totalMembers ?? 0) < 100

    const { data: group, error: ge } = await supabase
      .from('groups')
      .insert({ name: groupName.trim() })
      .select('id, invite_code')
      .single()
    if (ge) throw ge

    const { data: member, error: me } = await supabase
      .from('members')
      .insert({
        group_id: group.id,
        display_name: fullName.trim(),
        phone_number: phone?.trim() || null,
        is_early_bird: earlyBird,
      })
      .select('id, referral_code')
      .single()
    if (me) throw me

    await supabase.from('groups').update({ creator_member_id: member.id }).eq('id', group.id)

    let earlyBirdPoints = 0
    if (earlyBird) {
      earlyBirdPoints = await awardReferral({ referrerId: member.id, eventType: 'early_bird', points: 20 })
    }

    await applyReferral(member.id, ref)

    const links = buildLinks(group.invite_code, member.referral_code)
    let qr = null
    try {
      qr = await QRCode.toDataURL(links.joinWithRef, {
        margin: 1,
        width: 320,
        color: { dark: '#1a3a2a', light: '#ffffff' },
      })
    } catch {
      /* QR is best-effort */
    }
    await supabase.from('groups').update({ qr_code_url: qr }).eq('id', group.id)

    res.status(201).json({
      group: { id: group.id, invite_code: group.invite_code, name: groupName.trim() },
      member: { id: member.id, referral_code: member.referral_code, is_early_bird: earlyBird },
      links,
      qr,
      earlyBird,
      earlyBirdPoints,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/groups/join — join an existing group by invite code (optionally via ?ref)
router.post('/join', async (req, res, next) => {
  try {
    if (!requireWrite(res)) return
    const { inviteCode, fullName, phone, ref } = req.body || {}
    if (!inviteCode || !fullName?.trim()) return res.status(400).send('יש למלא שם מלא')

    const { data: group } = await supabase
      .from('groups')
      .select('id, invite_code, name, creator_member_id, milestone_awarded')
      .eq('invite_code', inviteCode)
      .maybeSingle()
    if (!group) return res.status(404).send('הקבוצה לא נמצאה')

    const { data: member, error } = await supabase
      .from('members')
      .insert({ group_id: group.id, display_name: fullName.trim(), phone_number: phone?.trim() || null })
      .select('id, referral_code')
      .single()
    if (error) throw error

    const refResult = await applyReferral(member.id, ref)

    // Group milestone: creator gets 50 once the group reaches 9 members
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id)
    const memberCount = count ?? 0
    let milestoneAwarded = 0
    if (memberCount >= 9 && !group.milestone_awarded && group.creator_member_id) {
      milestoneAwarded = await awardReferral({
        referrerId: group.creator_member_id,
        eventType: 'group_milestone',
        points: 50,
      })
      await supabase.from('groups').update({ milestone_awarded: true }).eq('id', group.id)
    }

    res.status(201).json({
      member: { id: member.id, referral_code: member.referral_code },
      group: { id: group.id, invite_code: group.invite_code, name: group.name },
      memberCount,
      upgradePrompt: memberCount >= 8,
      referrerAwarded: refResult.awarded,
      milestoneAwarded,
    })
  } catch (err) {
    next(err)
  }
})

export default router
