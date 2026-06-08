import { useEffect, useState } from 'react'
import { useSession } from '../lib/session.jsx'
import { useAsync } from '../lib/useAsync.js'
import { api, whatsappShareUrl } from '../lib/api.js'
import { demoLeaderboard } from '../data/demo.js'
import Spinner from '../components/Spinner.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import { TrophyIcon, TargetIcon, BallIcon, UsersIcon } from '../lib/icons.jsx'

function Podium({ players }) {
  const order = [players[1], players[0], players[2]].filter(Boolean)
  const heights = ['h-24', 'h-32', 'h-20']
  const place = [2, 1, 3]
  const medal = ['bg-slate-300 text-night', 'bg-gold text-night', 'bg-amber-700 text-white']
  return (
    <div className="glass-card flex items-end justify-center gap-3 p-6 sm:gap-6 sm:p-8">
      {order.map((p, i) => (
        <div key={p.member_id} className="flex w-24 flex-col items-center sm:w-32">
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-bl from-team to-gold text-lg font-black text-white sm:h-16 sm:w-16">
            {p.display_name.slice(0, 1)}
            {place[i] === 1 && <TrophyIcon className="absolute -top-5 text-gold" width={22} height={22} />}
          </span>
          <div className="mt-2 max-w-full truncate text-center text-sm font-bold text-white">{p.display_name}</div>
          <div className="num text-xs font-black text-gold">{p.total_points} נק׳</div>
          <div className={`mt-2 flex w-full ${heights[i]} items-start justify-center rounded-t-xl bg-gradient-to-t from-white/5 to-white/10 pt-2`}>
            <span className={`num grid h-9 w-9 place-items-center rounded-lg text-base font-black ${medal[i]}`}>
              {place[i]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function InviteCard({ memberId }) {
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!memberId) return
    api.getReferralStats(memberId).then(setData).catch(() => {})
  }, [memberId])

  if (!data) return null

  function copyLink() {
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold">
            <UsersIcon width={18} height={18} />
          </span>
          <div>
            <div className="font-extrabold text-white">הזמן חברים לקבוצה</div>
            <div className="text-xs text-slate-400">
              הזמנת <span className="num font-bold text-gold">{data.invited}</span> חברים · צברת{' '}
              <span className="num font-bold text-gold">{data.points}</span> נקודות הזמנה
            </div>
          </div>
        </div>
        {!data.capReached && (
          <div className="text-left text-xs text-slate-500">
            <span className="num">{data.points}</span>/100
          </div>
        )}
      </div>

      {!data.capReached && (
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-gold to-amber-400 transition-all"
            style={{ width: `${Math.min(100, Math.round((data.points / 100) * 100))}%` }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={whatsappShareUrl(data.referralLink)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-[#25D366] px-4 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1ebe5b]"
        >
          שלח בוואטסאפ
        </a>
        <button
          onClick={copyLink}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 cursor-pointer"
        >
          {copied ? '✓ הועתק' : 'העתק קישור'}
        </button>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { groupId, memberId, currentGroup, usingDemo } = useSession()
  const lbQ = useAsync(
    () => (groupId ? api.getLeaderboard(groupId) : Promise.resolve(demoLeaderboard)),
    [groupId],
    { fallback: demoLeaderboard },
  )

  if (lbQ.loading) return <Spinner />

  const players = [...(lbQ.data || [])].sort((a, b) => a.rank - b.rank)

  return (
    <div className="space-y-6">
      {usingDemo && <DemoBanner />}

      {currentGroup && (
        <div className="text-sm font-bold text-slate-400">
          טבלת הליגה של <span className="text-gold">{currentGroup.name}</span>
        </div>
      )}

      {players.length >= 3 && <Podium players={players} />}

      <InviteCard memberId={memberId} />

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-right text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs text-slate-400">
            <tr>
              <th className="p-4 font-bold">#</th>
              <th className="p-4 font-bold">משתתף/ת</th>
              <th className="p-4 text-center font-bold">
                <span className="inline-flex items-center gap-1"><TargetIcon width={14} height={14} /> מדויקים</span>
              </th>
              <th className="p-4 text-center font-bold">
                <span className="inline-flex items-center gap-1"><BallIcon width={14} height={14} /> ניחושים</span>
              </th>
              <th className="p-4 text-left font-bold">נקודות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.map((u) => {
              const me = u.member_id === memberId
              return (
                <tr key={u.member_id} className={`transition-colors hover:bg-white/[0.03] ${me ? 'bg-gold/5' : ''}`}>
                  <td className="p-4">
                    <span
                      className={`num grid h-8 w-8 place-items-center rounded-lg text-sm font-black
                        ${u.rank === 1 ? 'bg-gold text-night' : u.rank === 2 ? 'bg-slate-300 text-night' : u.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-300'}`}
                    >
                      {u.rank}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-bl from-team to-gold font-bold text-white">
                        {u.display_name.slice(0, 1)}
                      </span>
                      <span className="font-bold text-white">
                        {u.display_name}
                        {me && <span className="badge mr-2 bg-gold/15 text-gold">את/ה</span>}
                      </span>
                    </div>
                  </td>
                  <td className="num p-4 text-center font-bold text-slate-300">{u.exact_scores}</td>
                  <td className="num p-4 text-center font-bold text-slate-300">{u.predictions_count}</td>
                  <td className="num p-4 text-left text-lg font-black text-gold">{u.total_points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
