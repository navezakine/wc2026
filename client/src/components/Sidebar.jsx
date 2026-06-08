import { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useSession } from '../lib/session.jsx'
import {
  HomeIcon,
  BallIcon,
  TargetIcon,
  ChartIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  LogoutIcon,
  CloseIcon,
} from '../lib/icons.jsx'

const links = [
  { to: '/how-to-play', label: 'איך משחקים?', icon: ClockIcon },
  { to: '/app', label: 'לוח בקרה', icon: HomeIcon, end: true },
  { to: '/app/matches', label: 'משחקים', icon: BallIcon },
  { to: '/app/predictions', label: 'הניחושים שלי', icon: TargetIcon },
  { to: '/app/leaderboard', label: 'טבלת הליגה', icon: ChartIcon },
  { to: '/competition', label: 'ליגת הניחושים', icon: TrophyIcon },
  { to: '/scoring', label: 'מערכת הניקוד', icon: StarIcon },
]

export default function Sidebar({ open, onClose }) {
  const { logout, currentGroup, allMemberships, switchMembership } = useSession()
  const navigate = useNavigate()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef(null)

  useEffect(() => {
    if (!switcherOpen) return
    const handler = (e) => { if (!switcherRef.current?.contains(e.target)) setSwitcherOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [switcherOpen])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — anchored to the RIGHT for RTL. Slides in from the right on mobile. */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-white/10
                    bg-night-800/95 backdrop-blur-xl transition-transform duration-300
                    lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5">
          <Logo />
          <button
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden cursor-pointer"
            onClick={onClose}
            aria-label="סגירת התפריט"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Group switcher */}
        <div className="mx-3 mb-1 relative" ref={switcherRef}>
          {allMemberships.length >= 2 ? (
            <>
              <button
                onClick={() => setSwitcherOpen((o) => !o)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right hover:bg-white/5 transition-colors cursor-pointer"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">קבוצה פעילה</p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-gold truncate">{currentGroup?.name || '…'}</span>
                  <span className={`text-xs text-slate-400 transition-transform duration-200 ${switcherOpen ? '-rotate-180' : ''}`}>▾</span>
                </div>
              </button>
              {switcherOpen && (
                <div className="absolute right-0 left-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#0b1020]/98 shadow-xl backdrop-blur-xl">
                  {allMemberships.map((m) => (
                    <button
                      key={m.memberId}
                      onClick={() => { switchMembership(m.memberId); setSwitcherOpen(false); onClose() }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-right text-sm transition-colors cursor-pointer
                        ${m.isActive ? 'bg-gold/10 font-black text-white' : 'font-bold text-slate-300 hover:bg-white/5'}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${m.isActive ? 'bg-gold' : 'border border-white/20'}`} />
                      <span className="flex-1 truncate">{m.groupName || '…'}</span>
                      {m.isActive && <span className="text-[10px] font-bold text-gold">פעיל</span>}
                    </button>
                  ))}
                  <div className="border-t border-white/10">
                    <Link
                      to="/join"
                      onClick={() => { setSwitcherOpen(false); onClose() }}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-400 transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      <span className="text-gold">+</span>
                      הצטרף לקבוצה נוספת
                    </Link>
                    <Link
                      to="/create"
                      onClick={() => { setSwitcherOpen(false); onClose() }}
                      className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
                    >
                      <span>✦</span>
                      צור קבוצה חדשה
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">קבוצה פעילה</p>
              <p className="mt-0.5 text-sm font-black text-gold truncate">{currentGroup?.name || '…'}</p>
              <div className="mt-2 flex gap-3">
                <Link
                  to="/join"
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 transition-colors hover:text-gold"
                >
                  + הצטרף
                </Link>
                <span className="text-slate-700">·</span>
                <Link
                  to="/create"
                  onClick={onClose}
                  className="text-xs font-bold text-gold/70 transition-colors hover:text-gold"
                >
                  ✦ צור קבוצה
                </Link>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="ניווט ראשי">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors duration-200 cursor-pointer
                 ${
                   isActive
                     ? 'bg-gradient-to-l from-team/30 to-gold/10 text-white shadow-glow'
                     : 'text-slate-300 hover:bg-white/5 hover:text-white'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-lg transition-colors
                                ${isActive ? 'bg-gold text-night' : 'bg-white/5 text-gold group-hover:bg-white/10'}`}
                  >
                    <Icon />
                  </span>
                  <span>{label}</span>
                  {isActive && <span className="mr-auto h-2 w-2 rounded-full bg-gold" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-300">
              <LogoutIcon />
            </span>
            התנתקות
          </button>
        </div>
      </aside>
    </>
  )
}
