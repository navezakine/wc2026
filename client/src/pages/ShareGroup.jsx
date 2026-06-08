import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { GreenPage, GreenHeader, GoldButton, GhostButton } from '../components/green.jsx'
import { CheckIcon, UsersIcon, TrophyIcon } from '../lib/icons.jsx'

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard may be blocked */
    }
  }
  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold text-emerald-100/80">{label}</span>
      <div className="flex items-center gap-2">
        <code dir="ltr" className="num min-w-0 flex-1 truncate rounded-xl bg-[#0f241a] px-3 py-2.5 text-left text-sm text-emerald-100/90">
          {value}
        </code>
        <button
          onClick={copy}
          className="shrink-0 rounded-xl bg-[#f5c518] px-3 py-2.5 text-sm font-extrabold text-[#0f241a] hover:bg-[#ffd734] cursor-pointer"
        >
          {copied ? <CheckIcon width={16} height={16} /> : 'העתק'}
        </button>
      </div>
    </div>
  )
}

export default function ShareGroup() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state || JSON.parse(localStorage.getItem('wc_share') || 'null')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!data) navigate('/create')
  }, [data, navigate])

  useEffect(() => {
    if (!data?.member?.id) return
    api.getReferralStats(data.member.id).then(setStats).catch(() => {})
  }, [data])

  if (!data) return null

  const { links, qr, earlyBird, earlyBirdPoints, group } = data
  const waMessage =
    'הצטרפתי לליגת הניחושים של המונדיאל 2026!\n' +
    'נחש תוצאות וזכה בפרס!\n' +
    'הצטרף דרך הלינק שלי:\n' +
    links.referral
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waMessage)}`

  return (
    <GreenPage>
      <GreenHeader subtitle={`הקבוצה "${group?.name || ''}" מוכנה!`} />

      {earlyBird && (
        <div className="mb-5 rounded-2xl border border-[#f5c518]/40 bg-[#f5c518]/10 p-4 text-center font-bold text-[#f5c518] animate-fade-up">
          ברוך הבא! קיבלת {earlyBirdPoints || 20} נקודות בונוס על הצטרפות מוקדמת 🎉
        </div>
      )}

      {/* QR */}
      <div className="mb-5 flex flex-col items-center gap-3 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 shadow-2xl backdrop-blur animate-fade-up">
        <h2 className="text-lg font-extrabold text-white">הזמינו חברים</h2>
        {qr ? (
          <img
            src={qr}
            alt="קוד QR להצטרפות לקבוצה"
            className="h-44 w-44 rounded-2xl border-4 border-white bg-white"
          />
        ) : (
          <div className="grid h-44 w-44 place-items-center rounded-2xl bg-white/10 text-sm text-emerald-100/60">
            QR לא זמין
          </div>
        )}
        <p className="text-center text-xs text-emerald-100/60">צלמו את הקוד או שתפו את הקישור</p>
      </div>

      {/* Referral counter */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#f5c518]/20 bg-[#1a3a2a]/60 p-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5c518]/15 text-[#f5c518]">
            <UsersIcon width={20} height={20} />
          </span>
          <div className="text-sm">
            <div className="font-extrabold text-white">
              הזמנת <span className="num">{stats?.invited ?? 0}</span> חברים
            </div>
            <div className="text-emerald-100/70">
              קיבלת <span className="num">{stats?.points ?? 0}</span> נקודות
            </div>
          </div>
        </div>
        <TrophyIcon width={22} height={22} className="text-[#f5c518]" />
      </div>

      {stats?.capReached && (
        <div className="mb-5 rounded-2xl border border-[#f5c518] bg-[#f5c518]/15 p-4 text-center font-extrabold text-[#f5c518] animate-fade-up">
          הגעת למקסימום נקודות ההזמנה! 100/100 🏆
        </div>
      )}

      {/* Links + share */}
      <div className="space-y-4 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 shadow-2xl backdrop-blur animate-fade-up">
        <CopyRow label="קישור לקבוצה" value={links.group} />
        <CopyRow label="קישור ההזמנה האישי שלך" value={links.referral} />
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
          <GoldButton type="button" className="!bg-[#25D366] !text-white hover:!bg-[#1ebe5b]">
            שיתוף בוואטסאפ
          </GoldButton>
        </a>
      </div>

      <div className="mt-6">
        <Link to="/app">
          <GhostButton type="button">כניסה לליגה ←</GhostButton>
        </Link>
      </div>
    </GreenPage>
  )
}
