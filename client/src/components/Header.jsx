import { MenuIcon, UsersIcon } from '../lib/icons.jsx'
import { useSession } from '../lib/session.jsx'

export default function Header({ onMenu, title }) {
  const { currentGroup, members, memberId, setMemberId, currentMember } = useSession()
  const avatar = (currentMember?.display_name || '?').slice(0, 1)

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/10 bg-night/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <button
        className="rounded-lg p-2 text-slate-200 hover:bg-white/10 lg:hidden cursor-pointer"
        onClick={onMenu}
        aria-label="פתיחת התפריט"
      >
        <MenuIcon />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold text-white sm:text-2xl">{title}</h1>
        {currentGroup && (
          <p className="flex items-center gap-1 text-xs font-bold text-gold">
            <UsersIcon width={12} height={12} />
            {currentGroup.name}
          </p>
        )}
      </div>

      <div className="mr-auto flex items-center gap-2 sm:gap-3">
        {/* "Who am I" member selector (demo stand-in for auth) */}
        <label className="hidden text-xs font-bold text-slate-400 sm:block">מי אני?</label>
        <select
          value={memberId || ''}
          onChange={(e) => setMemberId(e.target.value)}
          aria-label="בחירת המשתתף הפעיל"
          className="cursor-pointer rounded-xl border border-white/10 bg-night-700/60 px-3 py-2 text-sm font-bold text-slate-100 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id} className="bg-night-800">
              {m.display_name}
            </option>
          ))}
        </select>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-bl from-team to-gold text-base font-extrabold text-white"
          aria-label={`המשתמש ${currentMember?.display_name || ''}`}
        >
          {avatar}
        </div>
      </div>
    </header>
  )
}
