import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { useSession } from '../lib/session.jsx'
import { api } from '../lib/api.js'
import { BallIcon } from '../lib/icons.jsx'

export default function Login() {
  const { login, isLoggedIn } = useSession()
  const navigate = useNavigate()

  // Navigate only after state has actually updated
  useEffect(() => {
    if (isLoggedIn) navigate('/app', { replace: true })
  }, [isLoggedIn, navigate])

  const [phone, setPhone] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState(null) // multiple matches

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const results = await api.login(phone.trim())
      if (results.length === 1) {
        login(results[0], remember)
        // navigate happens via the isLoggedIn useEffect above
      } else {
        setAccounts(results)
      }
    } catch (err) {
      setError(err.message || 'שגיאה בכניסה')
    } finally {
      setLoading(false)
    }
  }

  function selectAccount(account) {
    login(account, remember)
    // navigate happens via the isLoggedIn useEffect above
  }

  return (
    <div className="min-h-screen bg-night bg-stadium-mesh flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="glass-card p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-team/15 px-3 py-1 text-sm font-bold text-team-light">
              <BallIcon width={14} height={14} />
              מונדיאל 2026
            </span>
            <h1 className="text-2xl font-black text-white">ברוכים השבים!</h1>
            <p className="mt-1 text-sm text-slate-400">הזינו את מספר הטלפון שלכם כדי להיכנס</p>
          </div>

          {/* Account picker (shown when multiple accounts found) */}
          {accounts ? (
            <div>
              <p className="mb-3 text-sm font-bold text-slate-300">נמצאו מספר חשבונות — בחרו את שלכם:</p>
              <div className="space-y-2">
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectAccount(a)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    <div className="font-bold text-white">{a.display_name}</div>
                    <div className="text-xs text-slate-400">{a.group_name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAccounts(null)}
                className="mt-4 w-full text-center text-sm text-slate-400 hover:text-white cursor-pointer"
              >
                חזרה
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-300">מספר טלפון</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="050-0000000"
                  required
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right text-white placeholder-slate-500 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400">{error}</p>
              )}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                <div>
                  <div className="text-sm font-bold text-slate-200">זכור אותי</div>
                  <div className="text-xs text-slate-500">הישארו מחוברים בין ביקורים</div>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="btn-gold w-full py-3 disabled:opacity-50"
              >
                {loading ? 'מחפש...' : 'כניסה'}
              </button>
            </form>
          )}
        </div>

        {/* Footer links */}
        <div className="mt-6 flex justify-center gap-6 text-sm text-slate-400">
          <Link to="/create" className="hover:text-gold transition-colors">
            צור קבוצה חדשה
          </Link>
          <span className="text-slate-600">·</span>
          <Link to="/" className="hover:text-gold transition-colors">
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
