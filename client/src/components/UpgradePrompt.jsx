import { useState } from 'react'
import { useSession } from '../lib/session.jsx'
import { TrophyIcon } from '../lib/icons.jsx'

// Tier upgrade prompt (UI only — no payment provider wired yet).
export default function UpgradePrompt() {
  const { currentGroup } = useSession()
  const [msg, setMsg] = useState('')
  if (!currentGroup || currentGroup.tier === 'paid') return null

  const FREE_LIMIT = 6
  const memberCount = currentGroup.member_count ?? 0
  const atCap = memberCount >= FREE_LIMIT

  return (
    <div className="glass-card overflow-hidden border-gold/30 bg-gradient-to-l from-gold/10 to-transparent p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
          <TrophyIcon width={22} height={22} />
        </span>
        <div className="flex-1">
          <h3 className="font-extrabold text-white">
            {atCap ? `הגעתם ל-${FREE_LIMIT} חברים — הקבוצה נעולה` : 'שדרגו לפרימיום'}
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            {atCap
              ? `חברים חדשים לא יוכלו להצטרף. שדרגו ב-29 ₪ לחברים ללא הגבלה.`
              : `שדרגו ב-29 ₪ לחברים ללא הגבלה · היסטוריית טבלה מלאה`}
          </p>
          <button onClick={() => setMsg('תשלום יהיה זמין בקרוב — נעדכן אותך!')} className="btn-gold mt-3">
            שדרג ב-29 ₪
          </button>
          {msg && (
            <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-sm font-bold text-gold">{msg}</p>
          )}
        </div>
      </div>
    </div>
  )
}
