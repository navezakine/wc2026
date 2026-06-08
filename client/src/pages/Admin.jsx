import { useState } from 'react'
import { api } from '../lib/api.js'
import { GreenPage, GreenHeader, Field, GoldButton } from '../components/green.jsx'
import Toast from '../components/Toast.jsx'
import { UsersIcon, TrophyIcon, MedalIcon, ChartIcon } from '../lib/icons.jsx'

function Stat({ icon: Icon, label, value, suffix }) {
  return (
    <div className="rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/70 p-4">
      <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-[#f5c518]/15 text-[#f5c518]">
        <Icon width={18} height={18} />
      </span>
      <div className="num text-2xl font-black text-white">
        {value}
        {suffix && <span className="mr-1 text-sm font-bold text-emerald-100/60">{suffix}</span>}
      </div>
      <div className="text-xs font-bold text-emerald-100/60">{label}</div>
    </div>
  )
}

export default function Admin() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState(null)
  const [groups, setGroups] = useState([])
  const [board, setBoard] = useState([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  async function refresh(p) {
    const [s, g, b] = await Promise.all([
      api.adminStats(p),
      api.adminGroups(p),
      api.getCompetitionLeaderboard('overall'),
    ])
    setStats(s)
    setGroups(g)
    setBoard(b.rows)
  }

  async function login(e) {
    e.preventDefault()
    setError('')
    try {
      await refresh(pw)
      setAuthed(true)
    } catch (err) {
      setError(err.message)
    }
  }

  async function upgrade(id) {
    try {
      await api.adminUpgrade(id, pw)
      setToast({ type: 'ok', msg: 'הקבוצה שודרגה ידנית בהצלחה' })
      await refresh(pw)
    } catch (err) {
      setToast({ type: 'err', msg: err.message })
    }
  }

  async function announce(memberId, name) {
    try {
      await api.adminAnnounceWinner({ memberId, prizeDescription: 'פרס מיוחד לזוכה' }, pw)
      setToast({ type: 'ok', msg: `הזוכה ${name} הוכרז בהצלחה!` })
    } catch (err) {
      setToast({ type: 'err', msg: err.message })
    }
  }

  if (!authed) {
    return (
      <GreenPage>
        <GreenHeader subtitle="כניסת מנהל" />
        <form onSubmit={login} className="space-y-4 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white">לוח בקרה — מנהל</h2>
          <Field label="סיסמת מנהל" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
          {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>}
          <GoldButton type="submit">כניסה</GoldButton>
        </form>
      </GreenPage>
    )
  }

  return (
    <GreenPage maxW="max-w-3xl">
      <GreenHeader subtitle="לוח בקרה — מנהל" />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={UsersIcon} label="משתמשים" value={stats.users} />
        <Stat icon={ChartIcon} label="קבוצות" value={stats.groups} />
        <Stat icon={MedalIcon} label="קבוצות בתשלום" value={stats.paidGroups} />
        <Stat icon={TrophyIcon} label="הכנסות (אושרו)" value={stats.revenue} suffix="₪" />
        <Stat icon={MedalIcon} label="שדרוגים ידניים" value={stats.manualUpgrades} />
      </div>

      {/* Groups + manual upgrade */}
      <h2 className="mb-3 text-lg font-extrabold text-white">קבוצות</h2>
      <div className="mb-6 overflow-hidden rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs text-emerald-100/70">
            <tr>
              <th className="p-3 font-bold">קבוצה</th>
              <th className="p-3 text-center font-bold">חברים</th>
              <th className="p-3 text-center font-bold">מסלול</th>
              <th className="p-3 text-left font-bold">פעולה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {groups.map((g) => (
              <tr key={g.id}>
                <td className="p-3 font-bold text-white">{g.name}</td>
                <td className="num p-3 text-center text-slate-300">{g.member_count}</td>
                <td className="p-3 text-center">
                  <span className={`badge ${g.tier === 'paid' ? 'bg-[#f5c518]/20 text-[#f5c518]' : 'bg-white/10 text-slate-300'}`}>
                    {g.tier === 'paid' ? 'פרימיום' : 'חינמי'}
                  </span>
                </td>
                <td className="p-3 text-left">
                  {g.tier === 'paid' ? (
                    <span className="text-xs font-bold text-emerald-300">שודרג ✓</span>
                  ) : (
                    <button
                      onClick={() => upgrade(g.id)}
                      className="rounded-lg bg-[#f5c518] px-3 py-1.5 text-xs font-extrabold text-[#0f241a] hover:bg-[#ffd734] cursor-pointer"
                    >
                      שדרג ידנית
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Competition leaderboard + announce winner */}
      <h2 className="mb-3 text-lg font-extrabold text-white">טבלת התחרות — הכרזת זוכה</h2>
      <div className="overflow-hidden rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs text-emerald-100/70">
            <tr>
              <th className="p-3 font-bold">#</th>
              <th className="p-3 font-bold">שם</th>
              <th className="p-3 text-center font-bold">סה״כ</th>
              <th className="p-3 text-left font-bold">פעולה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {board.slice(0, 10).map((r) => (
              <tr key={r.member_id} className={r.rank === 1 ? 'bg-[#f5c518]/10' : ''}>
                <td className="num p-3 font-black text-[#f5c518]">{r.rank}</td>
                <td className="p-3 font-bold text-white">
                  {r.display_name}
                  {r.rank === 1 && <span className="mr-2"> 👑</span>}
                </td>
                <td className="num p-3 text-center font-black text-[#f5c518]">{r.total_points}</td>
                <td className="p-3 text-left">
                  <button
                    onClick={() => announce(r.member_id, r.display_name)}
                    className="rounded-lg border border-[#f5c518]/40 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f5c518] hover:bg-white/10 cursor-pointer"
                  >
                    הכרז על זוכה
                  </button>
                </td>
              </tr>
            ))}
            {board.length === 0 && (
              <tr>
                <td colSpan="4" className="p-5 text-center text-sm text-emerald-100/60">אין משתתפים בתחרות</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && <Toast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}
    </GreenPage>
  )
}
