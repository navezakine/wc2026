import { supabase } from '../config/supabase.js'

// Awards referral points (capped at 100) and logs a referral_events row.
// Returns how many points were actually granted (0 if at the cap).
export async function awardReferral({ referrerId, referredMemberId = null, eventType, points }) {
  if (!referrerId || !points || points <= 0) return 0

  const { data: mem } = await supabase
    .from('members')
    .select('referral_points')
    .eq('id', referrerId)
    .single()

  const current = mem?.referral_points ?? 0
  const grant = Math.max(0, Math.min(points, 100 - current)) // hard cap at 100

  if (grant > 0) {
    // the enforce_referral_cap trigger also clamps + recomputes total_points
    await supabase.from('members').update({ referral_points: current + grant }).eq('id', referrerId)
  }

  await supabase.from('referral_events').insert({
    referrer_id: referrerId,
    referred_member_id: referredMemberId,
    event_type: eventType,
    points_awarded: grant,
  })

  return grant
}

// Resolves a ?ref=referral_code, links the new member to the referrer, and
// (if the loop trigger didn't nullify it) awards the flat link_join 3 points.
export async function applyReferral(newMemberId, ref) {
  if (!ref) return { referrerId: null, awarded: 0 }

  const { data: referrer } = await supabase
    .from('members')
    .select('id')
    .eq('referral_code', ref)
    .maybeSingle()
  if (!referrer || referrer.id === newMemberId) return { referrerId: null, awarded: 0 }

  await supabase.from('members').update({ referred_by: referrer.id }).eq('id', newMemberId)

  // the prevent_referral_loops trigger nullifies referred_by on a loop
  const { data: after } = await supabase
    .from('members')
    .select('referred_by')
    .eq('id', newMemberId)
    .single()

  if (after?.referred_by) {
    const awarded = await awardReferral({
      referrerId: after.referred_by,
      referredMemberId: newMemberId,
      eventType: 'link_join',
      points: 3,
    })
    return { referrerId: after.referred_by, awarded }
  }
  return { referrerId: null, awarded: 0 } // loop -> nullified, no points
}
