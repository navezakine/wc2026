# Design System — ליגת הניחושים / World Cup Prediction Club

> Source of truth generated via the `ui-ux-pro-max` skill and refined for full RTL Hebrew.

## Direction

- **Pattern:** Hero → Features → How-it-works/Scoring → CTA.
- **Style:** Vibrant & block-based — bold, energetic, festive, high contrast. Best for gaming / social / sports.
- **Mood:** championship celebration meets premium sports broadcast.

## Color tokens

| Token        | Hex       | Use                          |
| ------------ | --------- | ---------------------------- |
| `team`       | `#DC2626` | primary (team red)           |
| `team.light` | `#EF4444` | primary hover / accents      |
| `gold`       | `#FBBF24` | CTA, highlights, scores      |
| `night`      | `#0b1020` | app background (stadium night)|
| `night.800`  | `#111834` | cards / surfaces             |
| text         | `#F1F5F9` (slate-100) | body on dark        |

> The skill suggested a light `#FEF2F2` background; we inverted to a **dark stadium-night**
> base for a more premium, broadcast-like feel while keeping the red + gold championship palette.

## Typography

- **Display / headings:** `Assistant` (700–800) — strong Hebrew display face.
- **Body:** `Heebo` (300–700) — highly legible Hebrew.
- Latin numerals isolated with the `.num` utility (`direction: ltr; tabular-nums`) so scores
  render correctly inside RTL text.

> Note: the skill's default (Barlow Condensed) is Latin-only and unsuitable for Hebrew, so
> Hebrew-first fonts were chosen per the project's hard RTL requirement.

## RTL rules

- `dir="rtl"` + `lang="he"` on `<html>`.
- Sidebar anchored to the **right** (`right-0`), content offset with `lg:mr-72`.
- Mobile sidebar slides in from the right (`translate-x-full` → `0`).
- Icons that imply direction (logout) are mirrored.
- Text aligned right by default; inputs use `text-right`.

## Effects

- Glassmorphic cards (`glass-card`): `bg-night-800/70 backdrop-blur-xl` + soft shadow.
- Gradient-mesh stadium background (`bg-stadium-mesh`).
- Gold glow on primary CTAs; `fade-up` staggered entrance; 200–300ms transitions.
- `prefers-reduced-motion` respected globally.

## Checklist (followed)

- [x] SVG icons (no emojis as UI icons — flags are content data)
- [x] `cursor-pointer` on all interactive elements
- [x] Visible focus rings (`focus-visible:ring-gold`)
- [x] 4.5:1 contrast on dark surfaces
- [x] Responsive 375 / 768 / 1024 / 1440
