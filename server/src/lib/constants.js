// Public base URL used in invite/referral links and QR codes.
// Current live deployment on Render; override via APP_BASE_URL env when a custom domain is ready.
export const APP_BASE_URL = process.env.APP_BASE_URL || 'https://wc2026-j5e5.onrender.com'

// Global competition settings
export const COMPETITION_PRIZE = process.env.COMPETITION_PRIZE || 'כרטיס מתנה 500 שקל לאמזון'
// WC 2026 final is ~19 July 2026
export const COMPETITION_END = process.env.COMPETITION_END || '2026-07-19T22:00:00+03:00'

