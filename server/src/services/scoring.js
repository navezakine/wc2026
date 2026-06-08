// Points engine (Phase 3).
//   Correct winner / draw .... 5  -> prediction_points
//   Correct exact score ...... 10 -> prediction_points
//   Correct top scorer ....... 2  -> prediction_points
//   Perfect round (all non-voided matches in a round correct) ... 30
//   5 consecutive correct winners (streak) ..................... 10 (per run of 5)
// total_points = prediction_points + MIN(referral_points, 100)
// Voided predictions and non-FINISHED matches never score.

export const outcomeOf = (h, a) => (h > a ? 'home' : h < a ? 'away' : 'draw')

const sameScorer = (a, b) =>
  a && b && a.trim().toLowerCase() === b.trim().toLowerCase()

export function basePoints(pred, match) {
  if (!match || match.home_score == null || match.away_score == null) return 0
  let pts = 0
  const actual = outcomeOf(match.home_score, match.away_score)
  if (pred.predicted_outcome && pred.predicted_outcome === actual) pts += 5
  if (
    pred.predicted_home_score === match.home_score &&
    pred.predicted_away_score === match.away_score
  )
    pts += 10
  if (sameScorer(pred.predicted_top_scorer, match.top_scorer)) pts += 2
  return pts
}

const winnerCorrect = (p, m) =>
  p.predicted_outcome && p.predicted_outcome === outcomeOf(m.home_score, m.away_score)

function perfectRoundBonus(finishedPreds, matchById) {
  // count finished matches per round (cancelled are not FINISHED, so excluded)
  const totalByRound = {}
  for (const m of Object.values(matchById)) {
    if (m.status === 'FINISHED' && m.round) totalByRound[m.round] = (totalByRound[m.round] || 0) + 1
  }
  const mine = {}
  for (const p of finishedPreds) {
    const m = matchById[p.match_id]
    if (!m?.round) continue
    ;(mine[m.round] ||= []).push({ p, m })
  }
  let bonus = 0
  for (const [round, arr] of Object.entries(mine)) {
    const total = totalByRound[round] || 0
    if (total > 0 && arr.length === total && arr.every(({ p, m }) => winnerCorrect(p, m))) {
      bonus += 30
    }
  }
  return bonus
}

function streakBonus(finishedPreds, matchById) {
  const sorted = [...finishedPreds].sort(
    (a, b) => new Date(matchById[a.match_id].match_date) - new Date(matchById[b.match_id].match_date),
  )
  let run = 0
  let bonus = 0
  for (const p of sorted) {
    if (winnerCorrect(p, matchById[p.match_id])) {
      run += 1
      if (run === 5) {
        bonus += 10
        run = 0
      }
    } else {
      run = 0
    }
  }
  return bonus
}

// Full recompute: per-prediction points_earned, then per-member totals.
export async function recalcAll(supabase) {
  const [{ data: matches = [] }, { data: preds = [] }, { data: members = [] }] = await Promise.all([
    supabase.from('matches').select('*'),
    supabase.from('predictions').select('*'),
    supabase.from('members').select('id, referral_points'),
  ])
  const matchById = Object.fromEntries(matches.map((m) => [m.id, m]))

  // 1) per-prediction base points
  for (const p of preds) {
    const m = matchById[p.match_id]
    const pts = m && m.status === 'FINISHED' && !p.voided ? basePoints(p, m) : 0
    if (p.points_earned !== pts) {
      await supabase.from('predictions').update({ points_earned: pts }).eq('id', p.id)
      p.points_earned = pts
    }
  }

  // 2) per-member totals
  for (const mem of members) {
    const finished = preds.filter(
      (p) => p.member_id === mem.id && !p.voided && matchById[p.match_id]?.status === 'FINISHED',
    )
    const predictionPoints =
      finished.reduce((s, p) => s + (p.points_earned || 0), 0) +
      perfectRoundBonus(finished, matchById) +
      streakBonus(finished, matchById)
    const total = predictionPoints + Math.min(mem.referral_points || 0, 100)
    await supabase
      .from('members')
      .update({ prediction_points: predictionPoints, total_points: total })
      .eq('id', mem.id)
  }

  return { matches: matches.length, predictions: preds.length, members: members.length }
}
