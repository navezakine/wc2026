import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { GoldButton, GhostButton } from '../components/green.jsx'
import ReferralWidget from '../components/ReferralWidget.jsx'
import { TrophyIcon, UsersIcon, ClockIcon } from '../lib/icons.jsx'

function useCountdown(endsAt) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(endsAt).getTime() - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function CountdownCell({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-[#f5c518]/20 bg-[#0f241a] px-3 py-2">
      <span className="num text-2xl font-black text-[#f5c518]">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] font-bold text-emerald-100/60">{label}</span>
    </div>
  )
}

function EntryFlow({ onEntered }) {
  const memberId = localStorage.getItem('wc_member')
  const [stats, setStats] = useState(null)
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (memberId) api.getReferralStats(memberId).then(setStats).catch(() => {})
  }, [memberId])

  if (!memberId) {
    return (
      <div className="rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/70 p-5 text-center">
        <p className="mb-3 font-bold text-white">כדי להשתתף בתחרות יש להצטרף לקבוצה</p>
        <Link to="/create">
          <GoldButton type="button">צור קבוצה</GoldButton>
        </Link>
      </div>
    )
  }
  if (!stats) return null

  if (stats.competitionEntered) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center font-extrabold text-emerald-300">
        אתה כבר בתחרות! 🎯 בהצלחה
      </div>
    )
  }

  if (!stats.eligibleForCompetition) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#f5c518]/30 bg-[#f5c518]/10 p-4 text-center font-bold text-[#f5c518]">
          הזמן לפחות חבר אחד כדי להיכנס לתחרות
        </div>
        <ReferralWidget variant="green" />
      </div>
    )
  }

  async function enter() {
    if (!consent) return
    setLoading(true)
    setError('')
    try {
      await api.enterCompetition({ memberId, consent: true })
      onEntered?.()
      setStats((s) => ({ ...s, competitionEntered: true }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-5">
      <label className="flex cursor-pointer items-start gap-3 text-right text-sm text-emerald-100/90">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-[#f5c518]"
        />
        <span>אני מאשר/ת שאני בן/בת 18 ומעלה ומסכים/ה לתקנון התחרות</span>
      </label>
      {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>}
      <GoldButton type="button" onClick={enter} disabled={!consent || loading}>
        {loading ? 'נכנס לתחרות…' : 'הצטרף לתחרות'}
      </GoldButton>
    </div>
  )
}

export default function Competition() {
  const [info, setInfo] = useState(null)
  const [top, setTop] = useState([])

  const load = () => {
    api.getCompetition().then(setInfo).catch(() => {})
    api.getCompetitionLeaderboard('overall').then((d) => setTop(d.rows.slice(0, 10))).catch(() => {})
  }
  useEffect(() => {
    load()
  }, [])

  const cd = useCountdown(info?.endsAt || '2026-07-19T22:00:00+03:00')

  return (
    <div dir="rtl" className="mx-auto max-w-2xl">
      {/* Winner banner (after announcement) */}
      {info?.winner && (
        <div className="mb-5 rounded-3xl border border-[#f5c518] bg-gradient-to-bl from-[#f5c518]/25 to-[#1a3a2a] p-5 text-center shadow-2xl animate-fade-up">
          <div className="text-3xl">🏆</div>
          <h2 className="mt-1 text-xl font-black text-[#f5c518]">
            הזוכה: {info.winner.name}
          </h2>
          {info.winner.prize && (
            <p className="mt-1 text-sm font-bold text-white">זכה ב{info.winner.prize}</p>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="mb-5 overflow-hidden rounded-3xl border border-[#f5c518]/30 bg-gradient-to-bl from-[#1a3a2a] to-[#0f241a] p-6 text-center shadow-2xl animate-fade-up">
        <TrophyIcon width={48} height={48} className="mx-auto text-[#f5c518]" />
        <h1 className="mt-3 text-2xl font-black text-white">תחרות המונדיאל — הזוכה מקבל פרס!</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f5c518] px-5 py-2 text-base font-extrabold text-[#0f241a]">
          🎁 פרס: {info?.prize || 'כרטיס מתנה 500 שקל לאמזון'}
        </div>
      </div>

      {/* Participant counter + countdown */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/70 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f5c518]/15 text-[#f5c518]">
            <UsersIcon width={22} height={22} />
          </span>
          <div>
            <div className="num text-2xl font-black text-white">{info?.participants ?? 0}</div>
            <div className="text-xs font-bold text-emerald-100/60">משתתפים בתחרות</div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/70 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-100/60">
            <ClockIcon width={14} height={14} /> זמן לסיום הטורניר
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <CountdownCell value={cd.days} label="ימים" />
            <CountdownCell value={cd.hours} label="שעות" />
            <CountdownCell value={cd.minutes} label="דקות" />
            <CountdownCell value={cd.seconds} label="שניות" />
          </div>
        </div>
      </div>

      {/* Entry */}
      <div className="mb-6">
        <EntryFlow onEntered={load} />
      </div>

      {/* Top 10 preview */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-extrabold text-white">טופ 10</h2>
          <Link to="/competition/leaderboard" className="text-sm font-bold text-[#f5c518] hover:underline">
            לטבלה המלאה ←
          </Link>
        </div>
        <ul className="divide-y divide-white/5">
          {top.map((r) => (
            <li key={r.member_id} className="flex items-center gap-3 p-3">
              <span
                className={`num grid h-7 w-7 place-items-center rounded-lg text-sm font-black
                  ${r.rank === 1 ? 'bg-[#f5c518] text-[#0f241a]' : r.rank === 2 ? 'bg-slate-300 text-[#0f241a]' : r.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-300'}`}
              >
                {r.rank}
              </span>
              <span className="flex-1 truncate font-bold text-white">{r.display_name}</span>
              <span className="num font-black text-[#f5c518]">{r.total_points}</span>
            </li>
          ))}
          {top.length === 0 && (
            <li className="p-5 text-center text-sm text-emerald-100/60">עדיין אין משתתפים בתחרות</li>
          )}
        </ul>
      </div>

      <Link to="/competition/leaderboard">
        <GhostButton type="button">צפה בטבלת התחרות המלאה</GhostButton>
      </Link>
    </div>
  )
}
