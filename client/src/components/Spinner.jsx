export default function Spinner({ label = 'טוען…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-gold" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}
