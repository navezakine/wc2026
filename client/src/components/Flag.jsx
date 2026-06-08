import { isoForTeam } from '../lib/teams.js'

// Renders a country flag as an image (flagcdn.com) instead of an emoji,
// because Windows does not render flag emoji glyphs.
// Accepts either a team name (`name`), an explicit `iso`, or a `team` object.
export default function Flag({ name, iso, team, size = 32, className = '' }) {
  const code = iso || team?.iso || isoForTeam(name ?? team?.name)
  const w = Math.round(size * 1.33)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white/10 shadow-sm ${className}`}
      style={{ width: w, height: size }}
      aria-hidden="true"
    >
      {code ? (
        <img
          src={`https://flagcdn.com/${code}.svg`}
          alt=""
          width={w}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[10px] font-bold text-slate-300">
          {(name ?? team?.name ?? '?').slice(0, 2)}
        </span>
      )}
    </span>
  )
}
