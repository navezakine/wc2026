// Demo data used as a fallback when the backend / Supabase are unreachable.
// Shapes match the phase-3 schema (matches_view / leaderboard / members / groups).

export const demoGroups = [
  { id: 'demo-group', name: 'קבוצת הדגמה', invite_code: 'DEMO1234', tier: 'free', member_count: 6 },
]

export const demoMembers = [
  { id: 'dm1', display_name: 'דניאל כהן' },
  { id: 'dm2', display_name: 'מאיה לוי' },
  { id: 'dm3', display_name: 'יוסי אברהם' },
  { id: 'dm4', display_name: 'נועה פרידמן' },
  { id: 'dm5', display_name: 'איתי שמש' },
  { id: 'dm6', display_name: 'רוני בר' },
]

export const demoMatches = [
  {
    id: 'dmt1',
    home_team: 'ברזיל',
    away_team: 'צרפת',
    match_date: '2026-06-03T19:00:00Z',
    home_score: 2,
    away_score: 1,
    top_scorer: 'ויניסיוס',
    round: 'שלב הבתים',
    status: 'FINISHED',
    status_label: 'הסתיים',
  },
  {
    id: 'dmt2',
    home_team: 'גרמניה',
    away_team: 'אנגליה',
    match_date: '2026-06-06T19:00:00Z',
    home_score: 1,
    away_score: 0,
    top_scorer: null,
    round: 'שלב הבתים',
    status: 'LIVE',
    status_label: 'משחק חי',
  },
  {
    id: 'dmt3',
    home_team: 'מקסיקו',
    away_team: 'קנדה',
    match_date: '2026-06-11T19:00:00Z',
    home_score: null,
    away_score: null,
    top_scorer: null,
    round: 'שלב הבתים',
    status: 'SCHEDULED',
    status_label: 'טרם החל',
  },
  {
    id: 'dmt4',
    home_team: 'ברזיל',
    away_team: 'ארגנטינה',
    match_date: '2026-06-14T19:00:00Z',
    home_score: null,
    away_score: null,
    top_scorer: null,
    round: 'שלב הבתים',
    status: 'SCHEDULED',
    status_label: 'טרם החל',
  },
]

export const demoLeaderboard = [
  { group_id: 'demo-group', member_id: 'dm5', display_name: 'איתי שמש', total_points: 98, prediction_points: 98, referral_points: 0, exact_scores: 4, predictions_count: 7, rank: 1 },
  { group_id: 'demo-group', member_id: 'dm6', display_name: 'רוני בר', total_points: 50, prediction_points: 50, referral_points: 0, exact_scores: 0, predictions_count: 7, rank: 2 },
  { group_id: 'demo-group', member_id: 'dm1', display_name: 'דניאל כהן', total_points: 18, prediction_points: 18, referral_points: 0, exact_scores: 0, predictions_count: 7, rank: 3 },
  { group_id: 'demo-group', member_id: 'dm3', display_name: 'יוסי אברהם', total_points: 18, prediction_points: 18, referral_points: 0, exact_scores: 0, predictions_count: 7, rank: 3 },
  { group_id: 'demo-group', member_id: 'dm2', display_name: 'מאיה לוי', total_points: 10, prediction_points: 10, referral_points: 0, exact_scores: 0, predictions_count: 7, rank: 5 },
  { group_id: 'demo-group', member_id: 'dm4', display_name: 'נועה פרידמן', total_points: 5, prediction_points: 5, referral_points: 0, exact_scores: 0, predictions_count: 7, rank: 6 },
]

// Scoring rules (Hebrew) shown to users — phase-3 point system
export const scoringRules = [
  { points: 10, label: 'תוצאה מדויקת', desc: 'ניחשתם את התוצאה המדויקת' },
  { points: 5, label: 'מנצחת / תיקו', desc: 'ניחשתם נכון מי תנצח (או תיקו)' },
  { points: 2, label: 'מלך השערים', desc: 'ניחשתם נכון את כובש השער' },
  { points: 30, label: 'בונוס מחזור מושלם', desc: 'כל המשחקים בשלב נוחשו נכון' },
  { points: 10, label: 'רצף של 5', desc: '5 ניחושי מנצחת נכונים ברצף' },
]
