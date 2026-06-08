import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { TrophyIcon } from '../lib/icons.jsx'

const TABS = [
  { key: 'skill', label: 'עמוד כבוד', hint: 'לפי נקודות ניחוש בלבד' },
  { key: 'overall', label: 'טבלה כללית', hint: 'קובע את הזוכה בפרס' },
]

function RankBadge({ rank }) {
  return (
    <span
      className={`num grid h-7 w-7 place-items-center rounded-lg text-sm font-black
        ${rank === 1 ? 'bg-[#f5c518] text-[#0f241a]' : rank === 2 ? 'bg-slate-300 text-[#0f241a]' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-300'}`}
    >
      {rank}
    </span>
  )
}

export default function CompetitionLeaderboard() {
  const [tab, setTab] = useState('overall')
  const [rows, setRows] = useState([])
  const myId = localStorage.getItem('wc_member')

  const load = useCallback(() => {
    api.getCompetitionLeaderboard(tab).then((d) => setRows(d.rows)).catch(() => {})
  }, [tab])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000) // auto-refresh every 60s
    return () => clearInterval(t)
  }, [load])

  return (
    <div dir="rtl" className="mx-auto max-w-2xl">
      {/* Tabs */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#0f241a] p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2.5 text-center transition cursor-pointer ${
              tab === t.key ? 'bg-[#f5c518] text-[#0f241a]' : 'text-emerald-100/70 hover:bg-white/5'
            }`}
          >
            <div className="text-sm font-extrabold">{t.label}</div>
            <div className={`text-[10px] ${tab === t.key ? 'text-[#0f241a]/70' : 'text-emerald-100/40'}`}>
              {t.hint}
            </div>
          </button>
        ))}
      </div>

      {tab === 'overall' && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#f5c518]/30 bg-[#f5c518]/10 px-4 py-2.5 text-sm font-bold text-[#f5c518]">
          <TrophyIcon width={16} height={16} /> מקום ראשון בטבלה הכללית זוכה בפרס!
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 shadow-2xl">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs text-emerald-100/70">
            <tr>
              <th className="p-3 font-bold">מיקום</th>
              <th className="p-3 font-bold">שם</th>
              <th className="p-3 text-center font-bold">ניחושים</th>
              <th className="p-3 text-left font-bold">נקודות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => {
              const me = r.member_id === myId
              return (
                <tr key={r.member_id} className={me ? 'bg-[#f5c518]/5' : ''}>
                  <td className="p-3">
                    <RankBadge rank={r.rank} />
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white">
                      {r.display_name}
                      {me && <span className="mr-2 rounded-full bg-[#f5c518]/15 px-2 py-0.5 text-xs text-[#f5c518]">את/ה</span>}
                    </div>
                    {tab === 'overall' && (
                      <div className="num mt-0.5 text-xs text-emerald-100/60">
                        {r.prediction_points} נק׳ ניחוש + {r.referral_points} נק׳ הזמנות = {r.total_points} סה״כ
                      </div>
                    )}
                  </td>
                  <td className="num p-3 text-center text-slate-300">{r.predictions_made}</td>
                  <td className="num p-3 text-left text-lg font-black text-[#f5c518]">
                    {tab === 'skill' ? r.prediction_points : r.total_points}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-sm text-emerald-100/60">
                  עדיין אין משתתפים בתחרות
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <Link to="/competition" className="text-sm font-bold text-[#f5c518] hover:underline">
          → חזרה לעמוד התחרות
        </Link>
      </div>
    </div>
  )
}
