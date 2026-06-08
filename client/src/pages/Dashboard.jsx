import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../lib/session.jsx'
import { useAsync } from '../lib/useAsync.js'
import { api } from '../lib/api.js'
import { demoMatches, demoLeaderboard } from '../data/demo.js'
import Spinner from '../components/Spinner.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import MatchCard from '../components/MatchCard.jsx'
import Toast from '../components/Toast.jsx'
import UpgradePrompt from '../components/UpgradePrompt.jsx'
import { TrophyIcon, TargetIcon, MedalIcon, BallIcon } from '../lib/icons.jsx'

export default function Dashboard() {
  const { currentMember, currentGroup, groupId, memberId, usingDemo } = useSession()
  const [toast, setToast] = useState(null)
  const [showInstall, setShowInstall] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return false
    return !localStorage.getItem('wc_install_dismissed')
  })

  function dismissInstall() {
    localStorage.setItem('wc_install_dismissed', '1')
    setShowInstall(false)
  }

  const matchesQ = useAsync(() => api.getMatches(), [], { fallback: demoMatches })
  const lbQ = useAsync(
    () => (groupId ? api.getLeaderboard(groupId) : Promise.resolve(demoLeaderboard)),
    [groupId],
    { fallback: demoLeaderboard },
  )
  const predsQ = useAsync(
    () => (memberId && !usingDemo ? api.getPredictions(memberId) : Promise.resolve([])),
    [memberId, usingDemo],
    { fallback: [] },
  )

  if (matchesQ.loading || lbQ.loading) return <Spinner />

  const matches = matchesQ.data || []
  const lb = [...(lbQ.data || [])].sort((a, b) => a.rank - b.rank)
  const predByMatch = Object.fromEntries((predsQ.data || []).map((p) => [p.match_id, p]))
  const myRow = lb.find((r) => r.member_id === memberId)
  const upcoming = matches.filter((m) => m.status === 'scheduled').slice(0, 2)
  const top = lb.slice(0, 5)

  const stats = [
    { icon: TrophyIcon, label: 'ניקוד כולל', value: myRow?.total_points ?? 0, suffix: 'נק׳', tone: 'text-gold bg-gold/15', scoringLink: true },
    { icon: MedalIcon, label: 'דירוג בקבוצה', value: myRow ? `#${myRow.rank}` : '—', tone: 'text-team-light bg-team/15' },
    { icon: TargetIcon, label: 'ניחושים מדויקים', value: myRow?.exact_scores ?? 0, tone: 'text-emerald-300 bg-emerald-500/15' },
    { icon: BallIcon, label: 'סה״כ ניחושים', value: myRow?.predictions_count ?? 0, tone: 'text-sky-300 bg-sky-500/15' },
  ]

  async function handleSave(payload) {
    try {
      await api.savePrediction({ memberId, ...payload })
      setToast({ type: 'ok', msg: 'הניחוש נשמר בהצלחה!' })
    } catch (e) {
      setToast({ type: 'err', msg: e.message })
      throw e
    }
  }

  return (
    <div className="space-y-8">
      {usingDemo && <DemoBanner />}

      <div className="glass-card animate-fade-up flex flex-col gap-4 overflow-hidden bg-gradient-to-l from-team/20 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">שלום, {currentMember?.display_name || 'אורח/ת'}! 👋</h2>
          <p className="mt-1 text-slate-300">
            {currentGroup ? `קבוצה: ${currentGroup.name} · ` : ''}המונדיאל מתחמם — זמן לנחש את המחזור הבא.
          </p>
        </div>
        <Link to="/app/matches" className="btn-gold shrink-0">
          לניחוש המשחקים
        </Link>
      </div>

      {showInstall && (
        <div className="glass-card animate-fade-up relative p-5">
          <button
            onClick={dismissInstall}
            className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="סגור"
          >
            ✕
          </button>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">📲</span>
            <h3 className="font-black text-white">הוסיפו את האפליקציה למסך הבית</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-300">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-white">🤖 אנדרואיד:</span> Chrome ← ⋮ ← <strong className="text-white">"הוסף למסך הבית"</strong>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-white">🍎 iPhone:</span> Safari ← כפתור שיתוף ⎙ ← <strong className="text-white">"הוסף למסך הבית"</strong>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/how-to-play"
        className="glass-card animate-fade-up flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </span>
          <div>
            <div className="font-bold text-white">איך משחקים?</div>
            <div className="text-sm text-slate-400">מדריך מהיר לכללים ומערכת הניקוד</div>
          </div>
        </div>
        <span className="text-slate-400">←</span>
      </Link>

      <UpgradePrompt />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, suffix, tone, scoringLink }) => (
          <div key={label} className="glass-card animate-fade-up p-5">
            <span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
              <Icon width={22} height={22} />
            </span>
            <div className="num text-3xl font-black text-white">
              {value} {suffix && <span className="text-base font-bold text-slate-400">{suffix}</span>}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-400">
              {label}
              {scoringLink && (
                <Link to="/scoring" className="text-gold/60 hover:text-gold text-xs font-bold" title="איך מחשבים נקודות?">?</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl text-white">המשחקים הקרובים</h3>
            <Link to="/app/matches" className="text-sm font-bold text-gold hover:text-gold-light">
              לכל המשחקים ←
            </Link>
          </div>
          {upcoming.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} prediction={predByMatch[m.id]} onSave={handleSave} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-slate-400">אין משחקים קרובים כרגע.</div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl text-white">צמרת הטבלה</h3>
            <Link to="/app/leaderboard" className="text-sm font-bold text-gold hover:text-gold-light">
              הטבלה המלאה ←
            </Link>
          </div>
          <div className="glass-card divide-y divide-white/5">
            {top.map((u, i) => (
              <div key={u.member_id} className={`flex items-center gap-3 p-3.5 ${u.member_id === memberId ? 'bg-gold/5' : ''}`}>
                <span
                  className={`num grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black
                    ${i === 0 ? 'bg-gold text-night' : i === 1 ? 'bg-slate-300 text-night' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-300'}`}
                >
                  {u.rank}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-bl from-team to-gold text-sm font-bold text-white">
                  {u.display_name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-white">{u.display_name}</span>
                <span className="num font-black text-gold">{u.total_points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}
    </div>
  )
}
