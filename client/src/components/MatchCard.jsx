import { useState } from 'react'
import { formatDate, formatTime, timeUntil } from '../lib/format.js'
import { ClockIcon, CheckIcon } from '../lib/icons.jsx'
import Flag from './Flag.jsx'

function TeamRow({ team, score, onScore, editable }) {
  return (
    <div className="flex items-center gap-3">
      <Flag name={team} size={28} />
      <span className="min-w-0 flex-1 truncate font-bold text-white">{team}</span>
      {editable ? (
        <input
          type="number"
          min="0"
          max="20"
          inputMode="numeric"
          value={score}
          onChange={(e) => onScore(e.target.value)}
          aria-label={`שערים של ${team}`}
          className="num h-11 w-14 rounded-xl border border-white/15 bg-night-700 text-center text-xl font-extrabold text-gold outline-none focus:border-gold/70 focus:ring-2 focus:ring-gold/30"
        />
      ) : (
        <span className="num grid h-11 w-14 place-items-center rounded-xl bg-white/5 text-xl font-extrabold text-white">
          {score ?? '–'}
        </span>
      )}
    </div>
  )
}

export default function MatchCard({ match, prediction, onSave }) {
  const isOpen = match.status === 'SCHEDULED'
  const isLive = match.status === 'LIVE'
  const isFinished = match.status === 'FINISHED'
  const isPostponed = match.status === 'POSTPONED'
  const isCancelled = match.status === 'CANCELLED'
  // Predictions stay editable while SCHEDULED or POSTPONED (until new kick-off)
  const editable = isOpen || isPostponed

  const [home, setHome] = useState(prediction?.predicted_home_score ?? '')
  const [away, setAway] = useState(prediction?.predicted_away_score ?? '')
  const [scorer, setScorer] = useState(prediction?.predicted_top_scorer ?? '')
  const [saved, setSaved] = useState(Boolean(prediction))
  const [saving, setSaving] = useState(false)

  const canSave = home !== '' && away !== '' && editable && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave?.({
        matchId: match.id,
        predictedHomeScore: Number(home),
        predictedAwayScore: Number(away),
        predictedTopScorer: scorer.trim() || null,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  function StatusBadge() {
    if (isFinished) return <span className="badge bg-emerald-500/15 text-emerald-300">{match.status_label || 'הסתיים'}</span>
    if (isLive)
      return (
        <span className="badge bg-red-500/15 text-red-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          {match.status_label || 'משחק חי'}
        </span>
      )
    if (isPostponed) return <span className="badge bg-amber-500/15 text-amber-300">{match.status_label || 'המשחק נדחה'}</span>
    if (isCancelled) return <span className="badge bg-slate-500/20 text-slate-300">{match.status_label || 'המשחק בוטל'}</span>
    return (
      <span className="badge bg-gold/10 text-gold">
        <ClockIcon width={14} height={14} />
        {timeUntil(match.match_date)}
      </span>
    )
  }

  return (
    <article className={`glass-card animate-fade-up overflow-hidden ${isCancelled ? 'opacity-70' : ''}`}>
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs">
        <span className="font-bold text-slate-300">
          {formatDate(match.match_date)} · <span className="num">{formatTime(match.match_date)}</span>
        </span>
        <StatusBadge />
      </div>

      <div className="space-y-3 p-4">
        <TeamRow
          team={match.home_team}
          score={editable ? home : match.home_score}
          onScore={setHome}
          editable={editable}
        />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-bold text-slate-400">נגד</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <TeamRow
          team={match.away_team}
          score={editable ? away : match.away_score}
          onScore={setAway}
          editable={editable}
        />

        {/* Top scorer */}
        {editable ? (
          <input
            type="text"
            value={scorer}
            onChange={(e) => setScorer(e.target.value)}
            placeholder="מלך השערים (לא חובה) — ‎+2 נק׳"
            aria-label="ניחוש מלך השערים"
            className="field !py-2.5 text-sm"
          />
        ) : (
          match.top_scorer && (
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm">
              <span className="text-slate-400">מלך השערים</span>
              <span className="font-bold text-white">{match.top_scorer}</span>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        {isFinished ? (
          <>
            <span className="text-xs text-slate-400">
              הניחוש שלך:{' '}
              {prediction ? (
                <span className="num font-bold text-slate-200">
                  {prediction.predicted_home_score} - {prediction.predicted_away_score}
                </span>
              ) : (
                '—'
              )}
            </span>
            <span
              className={`num badge ${
                (prediction?.points_earned ?? 0) > 0
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {prediction?.points_earned ?? 0} נק׳
            </span>
          </>
        ) : isCancelled ? (
          <span className="text-xs font-bold text-slate-400">המשחק בוטל — הניחושים בוטלו</span>
        ) : isLive ? (
          <span className="text-xs font-bold text-slate-300">הניחושים נסגרו — המשחק החל</span>
        ) : (
          <>
            <span className="text-xs text-slate-500">תוצאה מדויקת = 10 נק׳</span>
            <button onClick={handleSave} disabled={!canSave} className={saved ? 'btn-ghost' : 'btn-gold'}>
              {saving ? (
                'שומר…'
              ) : saved ? (
                <>
                  <CheckIcon width={16} height={16} /> עדכון ניחוש
                </>
              ) : (
                'שמירת ניחוש'
              )}
            </button>
          </>
        )}
      </div>
    </article>
  )
}
