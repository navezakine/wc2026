// Thin fetch wrapper around the Express backend.
// In dev, requests go through the Vite proxy ("/api" -> http://localhost:4000).
const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const message = await res.text().catch(() => '')
    throw new Error(message || `שגיאת שרת (${res.status})`)
  }
  return res.json()
}

export const api = {
  getMatches: () => request('/matches'),
  getGroups: () => request('/groups'),
  getMembers: (groupId) => request(`/groups/${groupId}/members`),
  getLeaderboard: (groupId) =>
    request(`/leaderboard${groupId ? `?groupId=${encodeURIComponent(groupId)}` : ''}`),
  getPredictions: (memberId) => request(`/predictions?memberId=${encodeURIComponent(memberId)}`),
  savePrediction: (payload) =>
    request('/predictions', { method: 'POST', body: JSON.stringify(payload) }),

  // Phase 4 — groups + referrals
  createGroup: (payload) => request('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  joinGroup: (payload) => request('/groups/join', { method: 'POST', body: JSON.stringify(payload) }),
  getGroupByInvite: (code) => request(`/groups/by-invite/${encodeURIComponent(code)}`),
  getReferralStats: (memberId) => request(`/groups/member/${encodeURIComponent(memberId)}/referrals`),
  getGroupResults: (groupId) => request(`/groups/${encodeURIComponent(groupId)}/results`),

  // Phase 5 — competition
  getCompetition: () => request('/competition'),
  getCompetitionLeaderboard: (tab) => request(`/competition/leaderboard?tab=${tab}`),
  enterCompetition: (payload) =>
    request('/competition/enter', { method: 'POST', body: JSON.stringify(payload) }),

  // Push notifications
  subscribePush: (payload) =>
    request('/push/subscribe', { method: 'POST', body: JSON.stringify(payload) }),
  unsubscribePush: (payload) =>
    request('/push/subscribe', { method: 'DELETE', body: JSON.stringify(payload) }),

  // Auth
  login: (phone) => request('/auth/login', { method: 'POST', body: JSON.stringify({ phone }) }),

  // Phase 6 — admin (password sent via header)
  adminStats: (pw) => request('/admin/stats', { headers: adminHeaders(pw) }),
  adminGroups: (pw) => request('/admin/groups', { headers: adminHeaders(pw) }),
  adminUpgrade: (id, pw) =>
    request(`/admin/groups/${id}/upgrade`, { method: 'POST', headers: adminHeaders(pw) }),
  adminAnnounceWinner: (payload, pw) =>
    request('/admin/winner', { method: 'POST', headers: adminHeaders(pw), body: JSON.stringify(payload) }),
}

const adminHeaders = (pw) => ({ 'Content-Type': 'application/json', 'x-admin-password': pw || '' })

// Builds a wa.me share URL with the standard invite message.
export function whatsappShareUrl(referralLink) {
  const msg =
    'הצטרפתי לליגת הניחושים של המונדיאל 2026!\n' +
    'נחש תוצאות וזכה בפרס!\n' +
    'הצטרף דרך הלינק שלי:\n' +
    referralLink
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

