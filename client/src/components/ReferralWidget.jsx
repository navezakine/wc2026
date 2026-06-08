import { useEffect, useState } from 'react'
import { api, whatsappShareUrl } from '../lib/api.js'
import { UsersIcon, TrophyIcon } from '../lib/icons.jsx'

// Self-contained referral widget: reads the active member from localStorage
// (set on create/join) and shows referral progress. Renders nothing when
// no member is "logged in". Use `variant="green"` on the forest-theme pages.
export default function ReferralWidget({ variant = 'app' }) {
  const memberId =
    (typeof localStorage !== 'undefined' && localStorage.getItem('wc_member')) ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('wc_member')) ||
    null
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!memberId) return
    let alive = true
    api
      .getReferralStats(memberId)
      .then((d) => alive && setData(d))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [memberId])

  if (!memberId || !data) return null

  const green = variant === 'green'
  const pct = Math.min(100, Math.round((data.points / 100) * 100))
  const shell = green
    ? 'border-[#f5c518]/20 bg-[#1a3a2a]/80'
    : 'glass-card'

  return (
    <section className={`rounded-2xl border p-4 ${shell}`} aria-label="הזמנת חברים">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5c518]/15 text-[#f5c518]">
          <UsersIcon width={18} height={18} />
        </span>
        <div className="text-sm leading-tight">
          <div className="font-extrabold text-white">
            הזמנת <span className="num">{data.invited}</span> חברים
          </div>
          <div className="text-slate-300">
            קיבלת <span className="num">{data.points}</span> נקודות הזמנות
          </div>
        </div>
      </div>

      {/* Friends who joined */}
      {data.friends?.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-1.5">
          {data.friends.slice(0, 8).map((f, i) => (
            <li
              key={i}
              className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-200"
            >
              {f.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Progress toward the 100-pt cap, or the max banner */}
      {data.capReached ? (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-[#f5c518]/15 px-3 py-2 text-sm font-extrabold text-[#f5c518]">
          <TrophyIcon width={16} height={16} /> הגעת למקסימום נקודות ההזמנה! 🏆
        </div>
      ) : (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>התקדמות</span>
            <span className="num">{data.points}/100</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-l from-[#f5c518] to-amber-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <a href={whatsappShareUrl(data.referralLink)} target="_blank" rel="noopener noreferrer" className="block">
        <button className="w-full rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#1ebe5b] cursor-pointer">
          הזמן חבר
        </button>
      </a>
    </section>
  )
}
