// Maps Hebrew team names to ISO codes for flag rendering (flagcdn.com).
const NAME_TO_ISO = {
  ברזיל: 'br',
  ארגנטינה: 'ar',
  צרפת: 'fr',
  אנגליה: 'gb-eng',
  ספרד: 'es',
  גרמניה: 'de',
  פורטוגל: 'pt',
  הולנד: 'nl',
  מקסיקו: 'mx',
  קנדה: 'ca',
  'ארה"ב': 'us',
  אורוגוואי: 'uy',
  בלגיה: 'be',
  קרואטיה: 'hr',
  איטליה: 'it',
  קרואטית: 'hr',
}

export function isoForTeam(name) {
  if (!name) return null
  return NAME_TO_ISO[name.trim()] || null
}
