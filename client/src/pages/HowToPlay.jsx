import { Link } from 'react-router-dom'
import { TrophyIcon, TargetIcon, BallIcon, UsersIcon, FireIcon, ChartIcon } from '../lib/icons.jsx'

const steps = [
  {
    num: 1,
    icon: UsersIcon,
    title: 'הצטרפו לקבוצה',
    desc: 'צרו קבוצה חדשה והזמינו חברים, או הצטרפו דרך קישור הזמנה שקיבלתם.',
  },
  {
    num: 2,
    icon: BallIcon,
    title: 'נחשו משחקים',
    desc: 'לפני כל משחק הזינו את הסקור הצפוי שלכם — בית וחוץ. ניחושים נסגרים בזמן הקיקאוף.',
  },
  {
    num: 3,
    icon: TargetIcon,
    title: 'צברו נקודות',
    desc: null,
    descJsx: (
      <span>
        תוצאה מדויקת = <span className="num font-black text-gold">10</span> נק׳ · קבוצה מנצחת נכונה  ={' '}
        <span className="num font-black text-gold">5</span> נק׳ ·{' '}
        <Link to="/scoring" className="font-bold text-gold/70 hover:text-gold underline decoration-dotted">
          לטבלת הניקוד המלאה ↗
        </Link>
      </span>
    ),
  },
  {
    num: 4,
    icon: ChartIcon,
    title: 'עלו בטבלה',
    desc: 'הנקודות מצטברות בזמן אמת אחרי כל משחק שמסתיים. הטבלה מתעדכנת אוטומטית.',
  },
  {
    num: 5,
    icon: UsersIcon,
    title: 'הזמינו חברים',
    desc: 'כל חבר שמצטרף לקבוצה דרך הקישור שלכם מזכה אתכם ב־+10 נקודות בונוס (עד 100).',
  },
  {
    num: 6,
    icon: TrophyIcon,
    title: 'ליגת הניחושים הישראלית',
    desc: 'הצטרפו לתחרות כלל-ארצית — מי ינחש הכי טוב את המונדיאל?',
    descJsx: (
      <span>
        הצטרפו לתחרות כלל-ארצית — מי ינחש הכי טוב את המונדיאל?{' '}
        <Link to="/competition" className="font-bold text-gold/70 hover:text-gold underline decoration-dotted">
          פרטים נוספים ↗
        </Link>
      </span>
    ),
  },
]

const quickRules = [
  { rule: 'ניחושים נסגרים בזמן קיקאוף', note: 'לא ניתן לשנות לאחר תחילת המשחק' },
  { rule: 'אפשר לשנות ניחוש לפני הקיקאוף', note: 'עד הרגע האחרון לפני הסטארט' },
  { rule: 'משחק מבוטל = ניחוש לא נחשב', note: 'לא מרוויחים ולא מפסידים' },
  { rule: 'מקסימום 100 נקודות הזמנה', note: 'נקודות ניחוש — ללא תקרה' },
]

export default function HowToPlay() {
  return (
    <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-white">איך משחקים?</h1>
          <p className="mt-2 text-slate-400">המדריך המלא — מההצטרפות עד לראש הטבלה</p>
        </div>

        {/* Steps timeline */}
        <div className="relative mb-8">
          {/* Dashed connector line — RTL: on the right side */}
          <div className="absolute right-[2.35rem] top-12 bottom-12 w-px border-r-2 border-dashed border-white/10 sm:right-[2.6rem]" />

          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.num} className="glass-card animate-fade-up flex items-start gap-4 p-5">
                {/* Step number bubble */}
                <div className="relative z-10 shrink-0">
                  <span className="num grid h-11 w-11 place-items-center rounded-full bg-gradient-to-bl from-team to-gold text-lg font-black text-white shadow-glow sm:h-12 sm:w-12">
                    {s.num}
                  </span>
                </div>

                <div className="flex flex-1 items-start gap-3 pt-0.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <s.icon width={16} height={16} className="shrink-0 text-gold/70" />
                      <h3 className="font-extrabold text-white">{s.title}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {s.descJsx ?? s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick rules card */}
        <div className="glass-card mb-8 overflow-hidden">
          <div className="border-b border-white/10 bg-gold/10 px-6 py-4">
            <h2 className="font-black text-white">כללים חשובים לזכור</h2>
            <p className="mt-0.5 text-sm text-slate-400">הדברים שכדאי לדעת לפני הניחוש הראשון</p>
          </div>
          <div className="grid gap-px bg-white/5 sm:grid-cols-2">
            {quickRules.map((r) => (
              <div key={r.rule} className="flex items-start gap-3 bg-night p-4">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div>
                  <div className="text-sm font-bold text-white">{r.rule}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/app" className="btn-gold px-8 py-3 text-base">
            בואו נשחק ⚽
          </Link>
          <Link to="/scoring" className="btn-ghost px-8 py-3 text-base">
            טבלת הניקוד המלאה
          </Link>
        </div>
    </div>
  )
}
