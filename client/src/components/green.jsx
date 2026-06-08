import Logo from './Logo.jsx'

// Shared "forest + gold" surface for the Phase-4 onboarding / referral flow.
// Theme: dark green #1a3a2a / #0f241a + gold #f5c518. Full RTL, mobile-first.

export function GreenPage({ children, maxW = 'max-w-md' }) {
  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-[#0f241a] font-sans text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(at 85% -5%, rgba(245,197,24,0.20) 0, transparent 45%), radial-gradient(at 0% 100%, rgba(26,58,42,0.95) 0, transparent 55%)',
        }}
      />
      <div className={`relative mx-auto flex min-h-screen w-full ${maxW} flex-col px-4 py-8`}>
        {children}
      </div>
    </div>
  )
}

export function GreenHeader({ subtitle }) {
  return (
    <header className="mb-6 flex flex-col items-center gap-3 text-center animate-fade-up">
      <Logo size={56} withText={false} />
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">ליגת הניחושים</h1>
        <p className="text-sm font-bold tracking-widest text-[#f5c518]">מונדיאל 2026</p>
      </div>
      {subtitle && <p className="text-sm text-emerald-100/70">{subtitle}</p>}
    </header>
  )
}

export function Field({ label, value, onChange, type = 'text', placeholder, required, inputMode }) {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-sm font-bold text-emerald-100/80">{label}</span>
      <input
        dir="rtl"
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-[#f5c518]/25 bg-[#0f241a] px-4 py-3 text-right text-white
                   placeholder:text-emerald-100/30 outline-none transition
                   focus:border-[#f5c518]/70 focus:ring-2 focus:ring-[#f5c518]/25"
      />
    </label>
  )
}

export function GoldButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5c518] px-5 py-3.5
                  text-base font-extrabold text-[#0f241a] transition
                  hover:bg-[#ffd734] active:scale-[0.99] cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                  disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#f5c518]/30
                  bg-white/5 px-5 py-3.5 text-base font-bold text-white transition hover:bg-white/10
                  active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-2
                  focus-visible:ring-[#f5c518]/50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function EarlyBirdBanner() {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f5c518]/40 bg-[#f5c518]/10 px-4 py-3 text-sm font-bold text-[#f5c518] animate-fade-up">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f5c518] text-base text-[#0f241a]">
        🐤
      </span>
      <span>100 המשתמשים הראשונים מקבלים 20 נקודות בונוס!</span>
    </div>
  )
}
