import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useSession } from '../lib/session.jsx'
import {
  HomeIcon,
  BallIcon,
  TargetIcon,
  ChartIcon,
  TrophyIcon,
  LogoutIcon,
  CloseIcon,
} from '../lib/icons.jsx'

const links = [
  { to: '/app', label: 'לוח בקרה', icon: HomeIcon, end: true },
  { to: '/app/matches', label: 'משחקים', icon: BallIcon },
  { to: '/app/predictions', label: 'הניחושים שלי', icon: TargetIcon },
  { to: '/app/leaderboard', label: 'טבלת הליגה', icon: ChartIcon },
  { to: '/competition', label: 'תחרות הפרסים', icon: TrophyIcon },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useSession()
  const navigate = useNavigate()

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
