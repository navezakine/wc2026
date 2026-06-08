import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { GreenPage, GreenHeader, GoldButton } from '../components/green.jsx'
import ReferralWidget from '../components/ReferralWidget.jsx'
import { CheckIcon } from '../lib/icons.jsx'

const outcomeOf = (h, a) => (h > a ? 'home' : h < a ? 'away' : 'draw')

export default function GroupLeaderboard() {
  const { inviteCode } = useParams()
  const [group, setGroup] = useState(null)
  const [rows, setRows] = useState([])
  const [grid, setGrid] = useState(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const g = await api.getGroupByInvite(inviteCode)
      setGroup(g)
      const [lb, results] = await Promise.all([api.getLeaderboard(g.id), api.getGroupResults(g.id)])
      setRows(lb)
      setGrid(results)
    } catch {
      /* keep last good data */
    }
  }, [inviteCode])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000) // auto-refresh every 60s
    return () => clearInterval(t)
  }, [load])

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <GreenPage maxW="max-w-3xl">
      <GreenHeader subtitle={group ? `${group.name} · ${group.member_count} חברים` : 'טבלת הקבוצה'} />

      <div className="mb-5">
        <GoldButton type="button" onClick={share}>
          {copied ? (
            <>
              <CheckIcon width={16} height={16} /> הקישור הועתק
            </>
          ) : (
            'שתף את הטבלה'
          )}
        </GoldButton>
      </div>

      {/* Ranked list */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 shadow-2xl">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs text-emerald-100/70">
            <tr>
              <th className="p-3 font-bold">מיקום</th>
              <th className="p-3 font-bold">שם</th>
              <th className="p-3 text-center font-bold">ניחושים</th>
              <th className="p-3 text-left font-bold">סה״כ נקודות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((u) => (
              <tr key={u.member_id} className="transition-colors hover:bg-white/[0.03]">
                <td className="p-3">
                  <span
                    className={`num grid h-7 w-7 place-items-center rounded-lg text-sm font-black
                      ${u.rank === 1 ? 'bg-[#f5c518] text-[#0f241a]' : u.rank === 2 ? 'bg-slate-300 text-[#0f241a]' : u.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/5 text-slate-300'}`}
                  >
                    {u.rank}
                  </span>
                </td>
                <td className="p-3 font-bold text-white">{u.display_name}</td>
                <td className="num p-3 text-center text-slate-300">{u.predictions_count}</td>
                <td className="num p-3 text-left text-lg font-black text-[#f5c518]">{u.total_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results grid: prediction vs actual */}
      {grid?.matches?.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-extrabold text-white">ניחושים מול תוצאות</h3>
          <div className="overflow-x-auto rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80">
            <table className="min-w-[560px] text-right text-xs">
              <thead className="border-b border-white/10 bg-white/[0.04] text-emerald-100/70">
                <tr>
                  <th className="sticky right-0 bg-[#1a3a2a] p-3 text-right font-bold">חבר</th>
                  {grid.matches.map((m) => (
                    <th key={m.id} className="whitespace-nowrap p-3 text-center font-bold">
                      <div className="text-white">{m.home_team} - {m.away_team}</div>
                      <div className="num text-[#f5c518]">{m.home_score}:{m.away_score}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {grid.members.map((mem) => (
                  <tr key={mem.id}>
                    <td className="sticky right-0 bg-[#1a3a2a] p-3 font-bold text-white">{mem.display_name}</td>
                    {grid.matches.map((m) => {
                      const p = grid.predictions[`${mem.id}|${m.id}`]
                      if (!p || p.voided) {
                        return <td key={m.id} className="p-3 text-center text-slate-500">—</td>
                      }
                      const correct = p.predicted_outcome === outcomeOf(m.home_score, m.away_score)
                      return (
                        <td key={m.id} className="p-3 text-center">
                          <span
                            className={`num inline-block rounded-md px-2 py-1 font-bold ${
                              correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {p.predicted_home_score}:{p.predicted_away_score}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ReferralWidget variant="green" />
    </GreenPage>
  )
}
