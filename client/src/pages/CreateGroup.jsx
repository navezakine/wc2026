import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { GreenPage, GreenHeader, Field, GoldButton, EarlyBirdBanner } from '../components/green.jsx'

export default function CreateGroup() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ref = params.get('ref') || undefined

  const [form, setForm] = useState({ fullName: '', phone: '', groupName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.fullName.trim() || !form.groupName.trim()) {
      setError('יש למלא שם מלא ושם קבוצה')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.createGroup({ ...form, ref })
      // remember the share details + set the creator as the active member
      localStorage.setItem('wc_share', JSON.stringify(res))
      localStorage.setItem('wc_group', res.group.id)
      localStorage.setItem('wc_member', res.member.id)
      navigate('/share', { state: res })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <GreenPage>
      <GreenHeader subtitle="צרו קבוצת ניחושים והזמינו את החברים" />

      <EarlyBirdBanner />

      <form
        onSubmit={submit}
        className="space-y-4 rounded-3xl border border-[#f5c518]/20 bg-[#1a3a2a]/80 p-6 shadow-2xl backdrop-blur animate-fade-up [animation-delay:80ms]"
      >
        <h2 className="text-xl font-extrabold text-white">יצירת קבוצה חדשה</h2>
        {ref && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
            הצטרפת דרך הזמנה של חבר — תודה! 🙌
          </p>
        )}

        <Field label="שם מלא" value={form.fullName} onChange={set('fullName')} placeholder="השם שלך" required />
        <Field
          label="מספר טלפון"
          value={form.phone}
          onChange={set('phone')}
          type="tel"
          inputMode="tel"
          placeholder="050-0000000"
        />
        <Field label="שם הקבוצה" value={form.groupName} onChange={set('groupName')} placeholder="לדוגמה: חברים מהעבודה" required />

        {error && (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">{error}</p>
        )}

        <GoldButton type="submit" disabled={loading}>
          {loading ? 'יוצר קבוצה…' : 'צור קבוצה'}
        </GoldButton>
      </form>

      <p className="mt-6 text-center text-sm text-emerald-100/60">
        כבר יש לך קבוצה?{' '}
        <Link to="/app" className="font-bold text-[#f5c518] hover:underline">
          כניסה לליגה
        </Link>
      </p>
    </GreenPage>
  )
}
