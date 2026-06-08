import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { GreenPage, GreenHeader, Field, GoldButton, GhostButton } from '../components/green.jsx'

export default function Join() {
  const { inviteCode } = useParams()
  const [params] = useSearchParams()
  const ref = params.get('ref') || undefined
  const navigate = useNavigate()

  const [group, setGroup] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    api
      .getGroupByInvite(inviteCode)
      .then(setGroup)
      .catch(() => setNotFound(true))
  }, [inviteCode])

  async function submit(e) {
    e.preventDefault()
    if (!form.fullName.trim()) {
      setError('יש למלא שם מלא')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.joinGroup({ inviteCode, ...form, ref })
      localStorage.setItem('wc_group', res.group.id)
      localStorage.setItem('wc_member', res.member.id)
      setDone(res)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (notFound) {
    return (
      <GreenPage>
        <GreenHeader />
        <div className="rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-8 text-center animate-fade-up">
          <p className="text-lg font-extrabold text-white">הקבוצה לא נמצאה</p>
          <p className="mt-2 text-sm text-emerald-100/70">ייתכן שקישור ההזמנה שגוי או שפג תוקפו.</p>
          <Link to="/create" className="mt-5 inline-block">
            <GoldButton type="button">צור קבוצה חדשה</GoldButton>
          </Link>
        </div>
      </GreenPage>
    )
  }

  if (done) {
    return (
      <GreenPage>
        <GreenHeader />
        <div className="rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-8 text-center animate-fade-up">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-3 text-xl font-extrabold text-white">הצטרפת לקבוצה!</h2>
          <p className="mt-1 text-sm text-emerald-100/70">ברוך הבא ל"{done.group?.name}"</p>
          {done.upgradePrompt && (
            <div className="mt-4 rounded-xl border border-[#f5c518]/40 bg-[#f5c518]/10 px-4 py-3 text-sm font-bold text-[#f5c518]">
              הקבוצה שלך גדלה! שדרג ב-29 שקל כדי להוסיף עוד חברים
            </div>
          )}
          <button onClick={() => navigate('/app')} className="mt-6 w-full">
            <GoldButton type="button">התחל לנחש ←</GoldButton>
          </button>
        </div>
      </GreenPage>
    )
  }

  return (
    <GreenPage>
      <GreenHeader subtitle="הוזמנת להצטרף לקבוצת ניחושים" />

      <form
        onSubmit={submit}
        className="space-y-4 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 shadow-2xl backdrop-blur animate-fade-up"
      >
        <div className="text-center">
          <p className="text-sm text-emerald-100/70">הוזמנת לקבוצה</p>
          <h2 className="text-2xl font-extrabold text-[#f5c518]">{group?.name || '…'}</h2>
          {group && (
            <p className="mt-1 text-xs text-emerald-100/50">
              <span className="num">{group.member_count}</span> חברים בקבוצה
            </p>
          )}
        </div>

        <Field label="שם מלא" value={form.fullName} onChange={set('fullName')} placeholder="השם שלך" required />
        <Field
          label="מספר טלפון"
          value={form.phone}
          onChange={set('phone')}
          type="tel"
          inputMode="tel"
          placeholder="050-0000000"
        />

        {error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>}

        <GoldButton type="submit" disabled={loading}>
          {loading ? 'מצטרף…' : 'הצטרף לקבוצה'}
        </GoldButton>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-100/60">
        מעדיף קבוצה משלך?{' '}
        <Link to={ref ? `/create?ref=${ref}` : '/create'} className="font-bold text-[#f5c518] hover:underline">
          צור קבוצה חדשה
        </Link>
      </p>
    </GreenPage>
  )
}
