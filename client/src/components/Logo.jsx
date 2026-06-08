export default function Logo({ size = 44, withText = true }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        width={size}
        height={size}
        alt="ליגת הניחושים - מונדיאל 2026"
        className="shrink-0 object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.35)]"
      />
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-lg font-extrabold text-white">ליגת הניחושים</div>
          <div className="text-[11px] font-bold tracking-widest text-gold">מונדיאל 2026</div>
        </div>
      )}
    </div>
  )
}
