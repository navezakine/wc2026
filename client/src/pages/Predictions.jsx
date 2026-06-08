import { useSession } from '../lib/session.jsx'
import { useAsync } from '../lib/useAsync.js'
import { api } from '../lib/api.js'
import { demoMatches } from '../data/demo.js'
import Spinner from '../components/Spinner.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import Flag from '../components/Flag.jsx'
import { formatDate } from '../lib/format.js'
import { TargetIcon, CheckIcon } from '../lib/icons.jsx'

export default function Predictions() {
  const { memberId, usingDemo } = useSession()

  const matchesQ = useAsync(() => api.getMatches(), [], { fallback: demoMatches })
  const predsQ = useAsync(
    () => (memberId && !usingDemo ? api.getPredictions(memberId) : Promise.resolve([])),
    [memberId, usingDemo],
    { fallback: [] },
  )

  if (matchesQ.loading || predsQ.loading) return <Spinner />

  const matchById = Object.fromEntries((matchesQ.data || []).map((m) => [m.id, m]))
  const preds = (predsQ.data || [])
    .map((p) => ({ ...p, match: matchById[p.match_id] }))
    .filter((p) => p.match)
    .sort((a, b) => new Date(a.match.match_date) - new Date(b.match.match_date))

  const total = preds.reduce((s, p) => s + (p.points_earned || 0), 0)

  return (
    <div className="space-y-6">
      {usingDemo && <DemoBanner />}

      <div className="glass-card flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-gold">
            <TargetIcon width={24} height={24} />
          </span>
          <div>
            <h2 className="text-xl text-white">הניחושים שלי</h2>
            <p className="text-sm text-slate-400">
              סך הכל ניחושים: <span className="num">{preds.length}</span>
            </p>
          </div>
        </div>
        <div className="text-left">
          <div className="num text-3xl font-black text-gold">{total}</div>
          <div className="text-xs font-bold text-slate-400">נקודות שנצברו</div>
        </div>
      </div>

      {preds.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-400">
          עדיין לא שלחת ניחושים. עברו ל“משחקים” כדי להתחיל!
        </div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs text-slate-400">
              <tr>
                <th className="p-4 font-bold">משחק</th>
                <th className="p-4 font-bold">תאריך</th>
                <th className="p-4 text-center font-bold">הניחוש שלי</th>
                <th className="p-4 text-center font-bold">תוצאה</th>
                <th className="p-4 text-center font-bold">נקודות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {preds.map((p) => {
                const m = p.match
                const settled = m.status === 'FINISHED'
                return (
                  <tr key={p.id || p.match_id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Flag name={m.home_team} size={18} />
                        <span>{m.home_team}</span>
                        <span className="text-slate-500">-</span>
                        <span>{m.away_team}</span>
                        <Flag name={m.away_team} size={18} />
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{formatDate(m.match_date)}</td>
                    <td className="num p-4 text-center font-bold text-white">
                      {p.predicted_home_score} - {p.predicted_away_score}
                    </td>
                    <td className="num p-4 text-center font-bold text-slate-300">
                      {settled ? (
                        `${m.home_score} - ${m.away_score}`
                      ) : (
                        <span className="badge bg-gold/10 text-gold">{m.status_label || 'ממתין'}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {!settled ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span
                          className={`num inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-black
                            ${p.points_earned >= 10 ? 'bg-emerald-500/20 text-emerald-300' : p.points_earned > 0 ? 'bg-gold/15 text-gold' : 'bg-white/5 text-slate-400'}`}
                        >
                          {p.points_earned >= 10 && <CheckIcon width={14} height={14} />}
                          {p.points_earned}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
