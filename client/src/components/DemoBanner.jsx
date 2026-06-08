export default function DemoBanner() {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20 font-black">
        i
      </span>
      <span>
        מצב הדגמה — מוצגים נתונים לדוגמה. חברו את השרת ואת Supabase דרך קובץ ה־
        <code className="num mx-1 rounded bg-black/30 px-1">.env</code>
        כדי לטעון נתונים אמיתיים.
      </span>
    </div>
  )
}
