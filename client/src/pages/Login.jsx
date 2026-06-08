import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { useSession } from '../lib/session.jsx'
import { api } from '../lib/api.js'

export default function Login() {
  const { loginAll, addMembership, isLoggedIn } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) navigate('/app', { replace: true })
  }, [isLoggedIn, navigate])

  const [tab, setTab] = useState('signin') // 'signin' | 'signup'

  // Sign-in state
  const [phone, setPhone] = useState('')
  const [remember, setRemember] = useState(true)
  const [accounts, setAccounts] = useState(null)

  // Sign-up state
  const [fullName, setFullName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function switchTab(t) {
    setTab(t)
    setError('')
    setAccounts(null)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const results = await api.login(phone.trim())
      if (results.length === 1) {
        loginAll(results, results[0], remember)
      } else {
        setAccounts(results)
      }
    } catch (err) {
      setError(err.message || 'שגיאה בכניסה')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.joinGroup({
        inviteCode: inviteCode.trim(),
        fullName: fullName.trim(),
        phone: signupPhone.trim(),
      })
      addMembership({ memberId: res.member.id, groupId: res.group.id }, remember)
    } catch (err) {
      setError(err.message || 'שגיאה בהרשמה')
    } finally {
      setLoading(false)
    }
  }

  function selectAccount(account) {
    loginAll(accounts, account, remember)
  }

  return (
    <div className="min-h-screen bg-night bg-stadium-mesh flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'signin'
                  ? 'border-b-2 border-gold bg-white/5 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              כניסה
            </button>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'signup'
                  ? 'border-b-2 border-gold bg-white/5 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              הרשמה
            </button>
          </div>

          <div className="p-8">
            {/* Sign-in */}
            {tab === 'signin' && (
              <>
                <p className="mb-5 text-center text-sm text-slate-400">
                  הזינו את מספר הטלפון שנרשמתם איתו
                </p>

                {accounts ? (
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-300">בחרו חשבון:</p>
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
                  <form onSubmit={handleSignIn} className="space-y-4">
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
              </>
            )}

            {/* Sign-up */}
            {tab === 'signup' && (
              <>
                <p className="mb-5 text-center text-sm text-slate-400">
                  קיבלתם קוד הזמנה? הצטרפו לקבוצה כאן
                </p>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-300">שם מלא</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="ישראל ישראלי"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right text-white placeholder-slate-500 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-300">מספר טלפון</label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="050-0000000"
                      required
                      dir="ltr"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right text-white placeholder-slate-500 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-slate-300">קוד הזמנה</label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="הדביקו את קוד ההזמנה כאן"
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
                    disabled={loading || !fullName.trim() || !signupPhone.trim() || !inviteCode.trim()}
                    className="btn-gold w-full py-3 disabled:opacity-50"
                  >
                    {loading ? 'מצטרף...' : 'הצטרפות לקבוצה'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Create group CTA */}
        <div className="mt-4">
          <Link
            to="/create"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="text-gold">+</span>
            צור קבוצה חדשה
          </Link>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-300 transition-colors">חזרה לדף הבית</Link>
          <span>·</span>
          <Link to="/how-to-play" className="hover:text-slate-300 transition-colors">איך זה עובד?</Link>
        </div>
      </div>
    </div>
  )
}
