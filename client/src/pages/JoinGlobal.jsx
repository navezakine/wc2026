import { useSearchParams, Link } from 'react-router-dom'
import { GreenPage, GreenHeader, GoldButton, GhostButton } from '../components/green.jsx'

// Global referral entry point: /join?ref=CODE
// The referrer's points are awarded on the create/join action that follows.
export default function JoinGlobal() {
  const [params] = useSearchParams()
  const ref = params.get('ref') || undefined
  const createTo = ref ? `/create?ref=${ref}` : '/create'

  return (
    <GreenPage>
      <GreenHeader subtitle="ברוכים הבאים לליגת הניחושים" />

      <div className="space-y-4 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 text-center shadow-2xl backdrop-blur animate-fade-up">
        {ref && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
            הוזמנת על ידי חבר 🙌
          </p>
        )}
        <h2 className="text-xl font-extrabold text-white">איך תרצו להתחיל?</h2>
        <p className="text-sm text-emerald-100/70">
          פתחו קבוצה חדשה והזמינו חברים, או הצטרפו לקבוצה קיימת דרך קישור הזמנה שקיבלתם.
        </p>

        <Link to={createTo} className="block">
          <GoldButton type="button">צור קבוצה חדשה</GoldButton>
        </Link>
        <Link to="/app" className="block">
          <GhostButton type="button">כניסה לליגה הקיימת</GhostButton>
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-emerald-100/50">
        כדי להצטרף לקבוצה ספציפית, השתמשו בקישור ההזמנה המלא שקיבלתם מחבר.
      </p>
    </GreenPage>
  )
}
