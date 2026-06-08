import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import Flag from '../components/Flag.jsx'
import { TrophyIcon, TargetIcon, UsersIcon, FireIcon, BallIcon } from '../lib/icons.jsx'
import { scoringRules } from '../data/demo.js'

const features = [
  {
    icon: TargetIcon,
    title: 'נחשו כל משחק',
    desc: 'הזינו את התוצאה המדויקת לכל משחק במונדיאל וקבלו נקודות על הדיוק שלכם.',
  },
  {
    icon: UsersIcon,
    title: 'התחרו מול החברים',
    desc: 'הצטרפו לליגה פרטית עם החברים, המשפחה או הקולגות מהעבודה.',
  },
  {
    icon: TrophyIcon,
    title: 'עלו לראש הטבלה',
    desc: 'טבלת ליגה חיה שמתעדכנת אחרי כל שריקת סיום — מי יהיה האלוף?',
  },
  {
    icon: FireIcon,
    title: 'שמרו על רצף',
    desc: 'ניחושים מדויקים ברצף מזכים אתכם בבונוסים ובתואר הכבוד בקבוצה.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-night bg-stadium-mesh">
      {/* Top nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/create" className="btn-ghost px-4 py-2 text-sm">
            צור קבוצה
          </Link>
          <Link to="/login" className="btn-gold">
            כניסה לליגה
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up text-center lg:text-right">
            <span className="badge mb-5 bg-team/15 text-team-light">
              <BallIcon width={16} height={16} />
              קיץ 2026 · ארה״ב · קנדה · מקסיקו
            </span>

            {/* Early bird banner */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-bold text-gold">
              🐤 100 המשתמשים הראשונים מקבלים 20 נקודות בונוס!
            </div>
            <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              נחשו את המונדיאל.
              <br />
              <span className="bg-gradient-to-l from-gold to-team bg-clip-text text-transparent">
                כבשו את הטבלה.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slate-300 lg:mx-0">
              ליגת הניחושים הכי לוהטת של מונדיאל 2026. נחשו תוצאות, צברו נקודות,
              והוכיחו לכולם מי באמת מבין בכדורגל.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to="/create" className="btn-gold px-7 py-3 text-base">
                צור קבוצה
              </Link>
              <Link to="/app" className="btn-primary px-7 py-3 text-base">
                הצטרף לתחרות הגלובלית
              </Link>
              <Link to="/scoring" className="btn-ghost px-7 py-3 text-base">
                איך זה עובד?
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 mx-auto">
              {[
                ['48', 'נבחרות'],
                ['104', 'משחקים'],
                ['∞', 'כיף'],
              ].map(([n, l]) => (
                <div key={l} className="glass-card px-3 py-4 text-center">
                  <dd className="num text-3xl font-black text-gold">{n}</dd>
                  <dt className="mt-1 text-xs font-bold text-slate-400">{l}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual: floating prediction card */}
          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-bl from-team/30 to-gold/20 blur-2xl" />
            <div className="glass-card p-6 shadow-glow">
              <div className="mb-4 flex items-center justify-between text-xs">
                <span className="badge bg-gold/10 text-gold">משחק הפתיחה</span>
                <span className="text-slate-400">בעוד 5 ימים</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
                  <div className="flex items-center gap-3">
                    <Flag team={{ iso: 'mx' }} size={30} />
                    <span className="font-bold text-white">מקסיקו</span>
                  </div>
                  <span className="num grid h-12 w-12 place-items-center rounded-lg bg-gold text-2xl font-black text-night">
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
                  <div className="flex items-center gap-3">
                    <Flag team={{ iso: 'ca' }} size={30} />
                    <span className="font-bold text-white">קנדה</span>
                  </div>
                  <span className="num grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-2xl font-black text-white">
                    1
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm font-bold text-emerald-300">
                <TrophyIcon width={18} height={18} />
                ניחוש מדויק = 10 נקודות!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card group p-6 transition-colors hover:bg-night-700/70">
              <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-bl from-team to-gold text-white">
                <Icon width={24} height={24} />
              </span>
              <h3 className="text-lg text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works / scoring */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-12 sm:px-6">
        <div className="glass-card overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-10">
              <h2 className="text-3xl font-black text-white">איך מנקדים?</h2>
              <p className="mt-3 text-slate-300">
                כל ניחוש שווה נקודות. ככל שתדייקו יותר — כך תצברו יותר. פשוט, הוגן וממכר.
              </p>
              <div className="mt-6 space-y-3">
                {scoringRules.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <span className="num grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gold/15 text-lg font-black text-gold">
                      {r.points}
                    </span>
                    <div>
                      <div className="font-bold text-white">{r.label}</div>
                      <div className="text-sm text-slate-400">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-5 bg-gradient-to-bl from-team/20 to-gold/10 p-8 text-center lg:p-10">
              <TrophyIcon width={64} height={64} className="text-gold" />
              <h3 className="text-2xl font-black text-white">מוכנים לכבוש את הטבלה?</h3>
              <p className="max-w-sm text-slate-300">
                הצטרפו עכשיו, הזמינו את החברים, ותתחילו לצבור נקודות לקראת הפתיחה הגדולה.
              </p>
              <Link to="/app" className="btn-gold px-8 py-3 text-base animate-pulse-glow">
                הצטרפות לליגה
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-slate-500 sm:px-6">
        ליגת הניחושים · מונדיאל 2026 — נבנה באהבה לכדורגל ⚽
      </footer>
    </div>
  )
}
