import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useSession } from '../lib/session.jsx'
import Logo from '../components/Logo.jsx'
import { UsersIcon } from '../lib/icons.jsx'

export default function Join() {
  const { inviteCode } = useParams()
  const [params] = useSearchParams()
  const ref = params.get('ref') || undefined
  const navigate = useNavigate()
  const { addMembership, loginAll, currentMember } = useSession()

  const [tab, setTab] = useState('signup')
  const [group, setGroup] = useState(null)
  const [notFound, setNotFound] = useState(false)

  // Sign-up state
  const [fullName, setFullName] = useState(currentMember?.display_name || '')
  const [signupPhone, setSignupPhone] = useState('')
  // Sign-in state
  const [phone, setPhone] = useState('')
  const [accounts, setAccounts] = useState(null)

  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getGroupByInvite(inviteCode)
      .then(setGroup)
      .catch(() => setNotFound(true))
  }, [inviteCode])

  function switchTab(t) { setTab(t); setError(''); setAccounts(null) }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.joinGroup({ inviteCode, fullName: fullName.trim(), phone: signupPhone.trim(), ref })
      addMembership({ memberId: res.member.id, groupId: res.group.id }, remember)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'שגיאה בהצטרפות')
    } finally {
      setLoading(false)
    }
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-night bg-stadium-mesh flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm glass-card p-8 text-center">
          <p className="text-lg font-extrabold text-white">הקבוצה לא נמצאה</p>
          <p className="mt-2 text-sm text-slate-400">ייתכן שקישור ההזמנה שגוי או שפג תוקפו.</p>
          <Link to="/create" className="btn-gold mt-5 inline-block px-6 py-2.5">צור קבוצה חדשה</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night bg-stadium-mesh flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="glass-card overflow-hidden">
          {/* Group info banner */}
          <div className="border-b border-white/10 bg-gradient-to-l from-team/20 to-gold/10 px-6 py-4 text-center">
            <p className="text-xs font-bold text-slate-400">הוזמנת להצטרף לקבוצה</p>
            <h2 className="mt-0.5 text-xl font-black text-gold">{group?.name || '…'}</h2>
            {group && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <UsersIcon width={12} height={12} />
                <span className="num">{group.member_count}</span> חברים בקבוצה
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'signup' ? 'border-b-2 border-gold bg-white/5 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              הרשמה
            </button>
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'signin' ? 'border-b-2 border-gold bg-white/5 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              כבר רשום? כניסה
            </button>
          </div>

          <div className="p-6">
            {/* Sign-up */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-300">שם מלא</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="השם שלך"
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
                    dir="ltr"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right text-white placeholder-slate-500 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400">{error}</p>}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-gold" />
                  <div>
                    <div className="text-sm font-bold text-slate-200">זכור אותי</div>
                    <div className="text-xs text-slate-500">הישארו מחוברים בין ביקורים</div>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  className="btn-gold w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'מצטרף...' : 'הצטרף לקבוצה'}
                </button>
              </form>
            )}

            {/* Sign-in */}
            {tab === 'signin' && (
              <>
                {accounts ? (
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-300">בחרו חשבון:</p>
                    <div className="space-y-2">
                      {accounts.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => loginAll(accounts, a, remember)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right transition-colors hover:bg-white/10 cursor-pointer"
                        >
                          <div className="font-bold text-white">{a.display_name}</div>
                          <div className="text-xs text-slate-400">{a.group_name}</div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setAccounts(null)} className="mt-4 w-full text-center text-sm text-slate-400 hover:text-white cursor-pointer">
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

                    {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400">{error}</p>}

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-gold" />
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
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-300 transition-colors">חזרה לדף הבית</Link>
        </div>
      </div>
    </div>
  )
}
