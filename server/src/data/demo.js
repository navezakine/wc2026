// In-memory demo data the API serves until Supabase is wired up.
export const matches = [
  {
    id: 'm1',
    stage: 'שלב הבתים - מחזור 1',
    group: 'בית A',
    kickoff: '2026-06-11T19:00:00Z',
    home: { name: 'מקסיקו', flag: '🇲🇽', code: 'MEX', iso: 'mx' },
    away: { name: 'קנדה', flag: '🇨🇦', code: 'CAN', iso: 'ca' },
    status: 'upcoming',
  },
  {
    id: 'm2',
    stage: 'שלב הבתים - מחזור 1',
    group: 'בית B',
    kickoff: '2026-06-12T16:00:00Z',
    home: { name: 'ארה"ב', flag: '🇺🇸', code: 'USA', iso: 'us' },
    away: { name: 'ארגנטינה', flag: '🇦🇷', code: 'ARG', iso: 'ar' },
    status: 'upcoming',
  },
  {
    id: 'm3',
    stage: 'שלב הבתים - מחזור 1',
    group: 'בית C',
    kickoff: '2026-06-13T19:00:00Z',
    home: { name: 'ברזיל', flag: '🇧🇷', code: 'BRA', iso: 'br' },
    away: { name: 'צרפת', flag: '🇫🇷', code: 'FRA', iso: 'fr' },
    status: 'upcoming',
  },
  {
    id: 'm4',
    stage: 'שלב הבתים - מחזור 1',
    group: 'בית D',
    kickoff: '2026-06-10T18:00:00Z',
    home: { name: 'ספרד', flag: '🇪🇸', code: 'ESP', iso: 'es' },
    away: { name: 'גרמניה', flag: '🇩🇪', code: 'GER', iso: 'de' },
    status: 'finished',
    result: { home: 2, away: 1 },
  },
]

export const leaderboard = [
  { id: 'u1', name: 'דניאל כהן', avatar: 'ד', points: 187, exact: 9, streak: 5 },
  { id: 'u2', name: 'מאיה לוי', avatar: 'מ', points: 173, exact: 7, streak: 2 },
  { id: 'u3', name: 'יוסי אברהם', avatar: 'י', points: 152, exact: 6, streak: 4 },
  { id: 'demo-user', name: 'אורח/ת', avatar: 'א', points: 128, exact: 5, streak: 3 },
  { id: 'u5', name: 'נועה פרידמן', avatar: 'נ', points: 119, exact: 4, streak: 1 },
]

// Simple in-memory store for predictions submitted during a demo session.
export const predictions = []
