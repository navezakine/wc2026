// One-time: backfill rounds on demo matches and recompute all points
// using the Phase-3 scoring rules. Uses the service_role key from .env.
import 'dotenv/config'
import { supabase } from '../src/config/supabase.js'
import { recalcAll } from '../src/services/scoring.js'

if (!supabase) {
  console.error('❌ Supabase לא מוגדר (חסר SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

// Give demo matches a round so perfect-round bonuses can apply
await supabase.from('matches').update({ round: 'שלב הבתים' }).is('round', null)

console.log('מחשב מחדש ניקוד לפי חוקי Phase 3…')
const result = await recalcAll(supabase)
console.log('✅ חישוב הושלם:', JSON.stringify(result))

const { data } = await supabase
  .from('leaderboard')
  .select('display_name, total_points, prediction_points, referral_points, exact_scores, rank')
  .order('rank', { ascending: true })
console.table(data)
process.exit(0)
