import { useEffect } from 'react'

// Auto-dismissing toast. type: 'ok' | 'err'
export default function Toast({ type = 'ok', message, onDone, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), type === 'err' ? duration + 1500 : duration)
    return () => clearTimeout(t)
  }, [type, duration, onDone])

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-1/2 z-50 translate-x-1/2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-card animate-fade-up
        ${type === 'err' ? 'bg-team' : 'bg-emerald-500'}`}
    >
      {message}
    </div>
  )
}
