import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import { TrophyIcon, TargetIcon, BallIcon, FireIcon, UsersIcon } from '../lib/icons.jsx'

const predictionRules = [
  {
    points: 10,
    label: 'תוצאה מדויקת',
    desc: 'ניחשתם את הסקור המדויק של שני הקבוצות',
    icon: TargetIcon,
    highlight: true,
  },
  {
    points: 5,
    label: 'מנצחת נכונה / תיקו',
    desc: 'ניחשתם נכון מי תנצח, גם אם הסקור שגוי',
    icon: BallIcon,
  },
  {
    points: 2,
    label: 'מלך השערים',
    desc: 'ניחשתם נכון את שם כובש השער הראשון',
    icon: BallIcon,
  },
]

const bonusRules = [
  {
    points: 30,
    label: 'מחזור מושלם',
    desc: 'כל הניחושים בשלב אחד עלו יפה — בונוס ענק',
    icon: TrophyIcon,
    highlight: true,
  },
  {
    points: 10,
    label: 'רצף של 5',
    desc: '5 ניחושי מנצחת נכונים ברצף — שומרים על הלהבה',
    icon: FireIcon,
  },
]

const referralRules = [
  {
    points: 10,
    label: 'חבר הצטרף לקבוצה',
    desc: 'כשחבר שהזמנתם מגיע לניחוש השלישי בקבוצה',
    icon: UsersIcon,
    highlight: true,
  },
  {
    points: 3,
    label: 'חבר נכנס דרך הקישור',
    desc: 'כשמישהו פותח את קישור ההזמנה האישי שלכם',
    icon: UsersIcon,
  },
  {
    points: 50,
    label: 'מיילסטון קבוצתי',
    desc: 'כשהקבוצה שיצרתם מגיעה ל-9 משתתפים',
    icon: TrophyIcon,
    highlight: true,
  },
  {
    points: 20,
    label: 'ציפור מוקדמת',
    desc: '20 הנקודות הבונוס ל-100 המשתמשים הראשונים באפליקציה',
    icon: FireIcon,
  },
]

function RuleCard({ points, label, desc, icon: Icon, highlight }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors
      ${highlight ? 'border-gold/30 bg-gold/5' : 'border-white/5 bg-white/[0.03]'}`}>
      <div className={`shrink-0 grid h-14 w-14 place-items-center rounded-xl text-xl font-black
        ${highlight ? 'bg-gold/15 text-gold' : 'bg-white/5 text-slate-300'}`}>
        <span className="num">{points}</span>
      </div>
      <div className="flex-1">
        <div className="font-bold text-white">{label}</div>
        <div className="mt-0.5 text-sm text-slate-400">{desc}</div>
      </div>
      <Icon width={20} height={20} className={highlight ? 'text-gold/60' : 'text-slate-600'} />
    </div>
  )
}

function ScoringPodium() {
  const steps = [
    { pts: 5,  label: 'מנצחת נכונה', place: 2, h: 'h-24', medal: 'bg-slate-300 text-night' },
    { pts: 10, label: 'תוצאה מדויקת', place: 1, h: 'h-32', medal: 'bg-gold text-night' },
    { pts: 2,  label: 'מלך השערים',  place: 3, h: 'h-20', medal: 'bg-amber-700 text-white' },
  ]
  return (
    <div className="glass-card flex items-end justify-center gap-3 p-6 sm:gap-6 sm:p-8">
      {steps.map(({ pts, label, place, h, medal }) => (
        <div key={place} className="flex w-24 flex-col items-center sm:w-32">
          {place === 1 && <TrophyIcon className="mb-1 text-gold" width={24} height={24} />}
          <div className={`num grid h-14 w-14 place-items-center rounded-full bg-gradient-to-bl from-team to-gold text-2xl font-black text-white sm:h-16 sm:w-16`}>
            {pts}
          </div>
          <div className="mt-2 text-center text-xs font-bold text-slate-300 leading-tight">{label}</div>
          <div className="text-xs text-slate-500">נק׳</div>
          <div className={`mt-2 flex w-full ${h} items-start justify-center rounded-t-xl bg-gradient-to-t from-white/5 to-white/10 pt-2`}>
            <span className={`num grid h-9 w-9 place-items-center rounded-lg text-base font-black ${medal}`}>
              {place}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Section({ title, subtitle, rules, accent }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className={`border-b border-white/10 px-6 py-4 ${accent}`}>
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="space-y-2 p-4">
        {rules.map((r) => <RuleCard key={r.label} {...r} />)}
      </div>
    </div>
  )
}

export default function Scoring() {
  return (
    <div className="min-h-screen bg-night bg-stadium-mesh px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-3xl font-black text-white">איך מרוויחים נקודות?</h1>
          <p className="mt-2 text-slate-400">כל מה שצריך לדעת כדי לטפס לראש הטבלה</p>
        </div>

        {/* Total formula */}
        <div className="mb-6 glass-card p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">סה״כ נקודות</p>
          <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
            <div className="rounded-xl bg-team/15 px-4 py-2 text-sm font-black text-team-light">נקודות ניחוש</div>
            <span className="text-xl font-black text-slate-400">+</span>
            <div className="rounded-xl bg-gold/15 px-4 py-2 text-sm font-black text-gold">נקודות הזמנה (עד 100)</div>
          </div>
          <p className="mt-3 text-xs text-slate-500">נקודות ניחוש אין להן תקרה — נחשו יותר ודייקו יותר</p>
        </div>

        <ScoringPodium />

        <div className="space-y-4">
          <Section
            title="ניחוש תוצאות"
            subtitle="מרוויחים נקודות על כל משחק שניחשתם"
            rules={predictionRules}
            accent="bg-team/10"
          />
          <Section
            title="בונוסים"
            subtitle="נקודות נוספות על הישגים מיוחדים"
            rules={bonusRules}
            accent="bg-gold/10"
          />
          <Section
            title="הזמנת חברים"
            subtitle="מביאים חברים = מרוויחים נקודות. עד 100 נקודות הזמנה בסך הכל"
            rules={referralRules}
            accent="bg-emerald-900/30"
          />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/app" className="btn-gold px-6 py-2.5">התחל לנחש</Link>
          <Link to="/" className="btn-ghost px-6 py-2.5">דף הבית</Link>
        </div>
      </div>
    </div>
  )
}
