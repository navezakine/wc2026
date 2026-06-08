import { supabase } from '../config/supabase.js'
import { fetchWorldCupMatches } from './footballData.js'
import { recalcAll } from './scoring.js'

// Fetches WC matches from football-data.org, upserts them by external_id
// (so re-runs update instead of duplicating), then recalculates points for
// any results that changed.
export async function syncMatches() {
  if (!supabase) throw new Error('Supabase לא מוגדר')

  const rows = await fetchWorldCupMatches()
  if (!rows.length) {
    return { fetched: 0, note: 'אין משחקים מהמקור (ייתכן שהמונדיאל אינו זמין בתוכנית ה-API)' }
  }

  const { error } = await supabase.from('matches').upsert(rows, { onConflict: 'external_id' })
  if (error) throw error

  // Results may have changed (FINISHED matches) -> recompute points
  const recalc = await recalcAll(supabase)

  return { fetched: rows.length, recalc }
}
