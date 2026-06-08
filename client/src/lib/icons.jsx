// Lightweight inline SVG icon set (Lucide-style, 24x24 viewBox).
// Using SVG instead of emojis per design guidelines.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const TrophyIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

export const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    <path d="M9 21v-6h6v6" />
  </svg>
)

export const BallIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7 3 2.2-1.1 3.5h-3.8L9 9.2 12 7Z" />
    <path d="M12 7V3.5M9 9.2 5.6 8M14.9 12.7l2.1 2.9M9.1 12.7 7 15.6M15 9.2l3.4-1.2" />
  </svg>
)

export const ChartIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3v18h18" />
    <rect x="7" y="12" width="3" height="6" rx="1" />
    <rect x="12" y="8" width="3" height="10" rx="1" />
    <rect x="17" y="5" width="3" height="13" rx="1" />
  </svg>
)

export const TargetIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
)

export const FireIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-2 1-2 2 2 3 4 3 7a6 6 0 1 1-12 0c0-4 3-6 6-12Z" />
  </svg>
)

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const LogoutIcon = (p) => (
  // Mirrored for RTL: arrow points right (toward the start in RTL)
  <svg {...base} {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M9 16l4-4-4-4" />
    <path d="M13 12H3" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const MedalIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7.21 4 8.5 9M16.79 4 15.5 9" />
    <path d="M5 4h14" />
    <circle cx="12" cy="15" r="5" />
    <path d="M12 13v4M10 15h4" />
  </svg>
)

export const StarIcon = (p) => (
  <svg {...base} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
