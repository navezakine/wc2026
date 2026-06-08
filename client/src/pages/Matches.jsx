import { useState } from 'react'
import { useSession } from '../lib/session.jsx'
import { useAsync } from '../lib/useAsync.js'
import { api } from '../lib/api.js'
import { demoMatches } from '../data/demo.js'
import Spinner from '../components/Spinner.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import MatchCard from '../components/MatchCard.jsx'
import Toast from '../components/Toast.jsx'

const filters = [
  { key: 'all', label: 'הכל' },
  { key: 'SCHEDULED', label: 'פתוחים לניחוש' },
  { key: 'LIVE', label: 'משחקים חיים' },
  { key: 'FINISHED', label: 'הסתיימו' },
  { key: 'POSTPONED', label: 'נדחו' },
  { key: 'CANCELLED', label: 'בוטלו' },
]

export default function Matches() {
  const { memberId, usingDemo } = useSession()
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const matchesQ = useAsync(() => api.getMatches(), [], { fallback: demoMatches })
  const predsQ = useAsync(
    () => (memberId && !usingDemo ? api.getPredictions(memberId) : Promise.resolve([])),
    [memberId, usingDemo],
    { fallback: [] },
  )

  if (matchesQ.loading) return <Spinner />

  const predByMatch = Object.fromEntries((predsQ.data || []).map((p) => [p.match_id, p]))
  const allMatches = (matchesQ.data || []).filter((m) => (filter === 'all' ? true : m.status === filter))
  const LIMIT = 60
  const matches = allMatches.slice(0, LIMIT)

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
    <div className="space-y-6">
      {usingDemo && <DemoBanner />}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors duration-200 cursor-pointer
              ${filter === f.key ? 'bg-gold text-night' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {allMatches.length > LIMIT && (
        <p className="text-sm text-slate-400">
          מציג <span className="num">{LIMIT}</span> מתוך <span className="num">{allMatches.length}</span> משחקים
        </p>
      )}

      {matches.length === 0 ? (
        <div className="glass-card p-10 text-center text-slate-400">אין משחקים להצגה בקטגוריה זו.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} prediction={predByMatch[m.id]} onSave={handleSave} />
          ))}
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.msg} onDone={() => setToast(null)} />}
    </div>
  )
}
