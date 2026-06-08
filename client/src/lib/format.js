// Hebrew date / time formatting helpers — always in Israel time (Asia/Jerusalem).
const TZ = 'Asia/Jerusalem'
const dateFmt = new Intl.DateTimeFormat('he-IL', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: TZ,
})
const timeFmt = new Intl.DateTimeFormat('he-IL', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TZ,
})

export function formatDate(iso) {
  try {
    return dateFmt.format(new Date(iso))
  } catch {
    return ''
  }
}

export function formatTime(iso) {
  try {
    return timeFmt.format(new Date(iso))
  } catch {
    return ''
  }
}

// Relative countdown in Hebrew, e.g. "בעוד 3 ימים"
export function timeUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'החל'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `בעוד ${days} ימים`
  if (hours > 0) return `בעוד ${hours} שעות`
  return 'בקרוב'
}
