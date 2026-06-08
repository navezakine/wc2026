// Thin wrapper around the Football-Data.org REST API.
// Docs: https://www.football-data.org/documentation/quickstart
// World Cup competition code = "WC".
const BASE = 'https://api.football-data.org/v4'

function headers() {
  const key = process.env.FOOTBALL_DATA_API_KEY
  if (!key || key.startsWith('your-')) {
    throw new Error('FOOTBALL_DATA_API_KEY לא הוגדר')
  }
  return { 'X-Auth-Token': key }
}

// football-data status -> our status set
const STATUS_MAP = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE',
  PAUSED: 'LIVE',
  FINISHED: 'FINISHED',
  AWARDED: 'FINISHED',
  POSTPONED: 'POSTPONED',
  SUSPENDED: 'POSTPONED',
  CANCELLED: 'CANCELLED',
}

export async function fetchWorldCupMatches() {
  const res = await fetch(`${BASE}/competitions/WC/matches`, { headers: headers() })
  if (!res.ok) throw new Error(`football-data שגיאה: ${res.status}`)
  const json = await res.json()

  // Normalize into our matches table shape (keyed on external_id for upsert).
  return (json.matches || []).map((m) => ({
    external_id: String(m.id),
    home_team: m.homeTeam?.name || 'TBD',
    away_team: m.awayTeam?.name || 'TBD',
    match_date: m.utcDate,
    status: STATUS_MAP[m.status] || 'SCHEDULED',
    round: m.stage || m.group || null,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null,
    // NOTE: the matches endpoint does not expose a per-match top scorer,
    // so top_scorer is left untouched (set manually or via a future scorers sync).
  }))
}
