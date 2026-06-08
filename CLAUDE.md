# CLAUDE.md — ליגת הניחושים / World Cup 2026 Prediction Club

Guidance for working in this repo. Read this first.

## What this is
A full-stack **Hebrew, RTL** World Cup 2026 prediction app: users create/join prediction
groups, predict match results, earn points, climb leaderboards, refer friends (referral
point economy), and compete in a global prize competition. There's an admin dashboard and
payment-ready infrastructure (no payment provider wired yet).

- **client/** — React 18 + Vite + Tailwind CSS, React Router. Full RTL (`<html lang="he" dir="rtl">`), Hebrew throughout, fonts Heebo (body) + Assistant (display).
- **server/** — Node + Express API. Talks to Supabase with the **service_role / secret key** (bypasses RLS). The browser NEVER talks to Supabase directly.
- **Supabase** (Postgres) — project ref `hiethperceumimlqdkkn`.

## Commands
```bash
# install (run once)
npm install              # root (for `concurrently`)
npm run install:all      # installs client + server deps

# dev (from repo root)
npm run dev              # runs client (5173) + server (4000) together
npm run dev:client       # client only
npm run dev:server       # server only

# build
npm run build            # builds the client (server runs from source)
```
- Client dev: http://localhost:5173 · API: http://localhost:4000 · health: `/api/health`
- Windows: kill a stuck port with PowerShell `Get-NetTCPConnection -LocalPort 4000 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }`

## Architecture & golden rules
- **Frontend → Express API → Supabase.** The client only calls the relative `/api/*` (Vite proxies to :4000 in dev). It has **no Supabase keys** — never add `VITE_SUPABASE_*` or any secret to the client.
- The Express server is the only thing with DB credentials. `server/src/config/supabase.js` builds a supabase-js client from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (a `sb_secret_…` key). It bypasses RLS.
- **RLS is locked down**: every table has RLS enabled and NO public read policies; anon/authenticated are revoked. So data is reachable ONLY through the server. Don't re-add "readable by all" policies.
- All new server routes that mutate data must go through the service_role client and validate input. Admin routes require the `x-admin-password` header (see `server/src/routes/admin.js`).

## Frontend conventions
- **Two themes coexist by design:**
  - Main app (dashboard/matches/predictions/leaderboard) = red `#DC2626` + gold `#FBBF24` over stadium-night `#0b1020` (Tailwind tokens in `client/tailwind.config.js`).
  - Onboarding / referral / competition / admin pages = dark green `#1a3a2a` + gold `#f5c518` (via `client/src/components/green.jsx` + arbitrary Tailwind values).
- RTL everywhere: sidebar on the right, `dir="rtl"`, text right-aligned. Numbers wrapped in `.num` (LTR, tabular).
- Pages live in `client/src/pages/`, shared UI in `client/src/components/`, API client in `client/src/lib/api.js`, fetch hooks in `lib/useAsync.js`, the active group/member context in `lib/session.jsx` (persisted to `localStorage` as `wc_group` / `wc_member`).
- **Flags:** Windows does NOT render flag-emoji. Use `components/Flag.jsx` (flagcdn.com images) keyed off ISO codes (`lib/teams.js` maps Hebrew team names → ISO). Real football-data fixtures use English names → flags fall back to a 2-letter chip (known limitation).
- Routing: `/app/*` is the authed shell (sidebar). `/competition*` is ALSO inside that shell. Public/standalone green pages: `/create`, `/share`, `/join/:inviteCode`, `/join`, `/group/:inviteCode/leaderboard`, `/admin`.

## Scoring & referral economy (source of truth)
- **Prediction points** (computed in Node, `server/src/services/scoring.js`): correct winner/draw 5, exact score 10, top scorer 2, perfect-round bonus 30, 5-streak bonus 10. Voided predictions & non-FINISHED matches never score.
- **Referral points** (`server/src/services/referrals.js`, hard-capped at 100): early_bird 20 (creators only), link_join 3, group_join 10 (once at the referred member's 3rd prediction), group_milestone 50 (once at 9 members, creator only).
- `total_points = prediction_points + MIN(referral_points, 100)`. The `enforce_referral_cap` DB trigger clamps referral_points and recomputes total on every member write.
- Recompute everything: `POST /api/admin/recalc` (admin) or `node server/scripts/recalc.js`.

## Database migrations
Schema is applied via idempotent SQL files run with a direct Postgres connection (NOT supabase-js — that can't run DDL):
- Files: `server/supabase-schema.sql` (base) + `server/supabase-patch*.sql` (phases) + `server/supabase-patch-security.sql`.
- Runner: `node server/scripts/run-sql.js <file.sql>` — needs `DATABASE_URL` (a Supabase **session-pooler** connection string) in env. It's normally BLANK in `.env` for security; set it inline only when migrating, then blank it again.
- Seed/recalc helpers in `server/scripts/` (`seed.js`, `recalc.js`, `sim-referrals.js`).

## Gotchas
- **PostgREST FK ambiguity:** `groups` has TWO foreign keys to `members` (`group_id` and `creator_member_id`). Any embed must disambiguate: `members!members_group_id_fkey(count)`, not `members(count)`.
- The football-data.org `/v4/competitions/WC/matches` endpoint gives English team names and no per-match top scorer.
- Statuses are UPPERCASE: `SCHEDULED | LIVE | FINISHED | POSTPONED | CANCELLED`. Predictions editable only while SCHEDULED/POSTPONED (DB trigger enforces, Hebrew error). CANCELLED voids predictions.
- All match times display in `Asia/Jerusalem` (`client/src/lib/format.js`).

## Env vars (see .env.example files)
- `server/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (sb_secret_…), `TWILIO_*`, `FOOTBALL_DATA_API_KEY`, `PAYPLUS_*` (empty until payment phase), `ADMIN_PASSWORD`, `PORT`, `CLIENT_ORIGIN`, `DATABASE_URL` (blank except when migrating).
- `client/.env`: only `VITE_API_BASE_URL` (empty in dev; prod = deployed API origin). NO secrets.
- `.env` files are gitignored; `.env.example` templates are committed.

## Security posture (done — keep it this way)
RLS locked to server-only; admin endpoints password-gated + rate-limited (`express-rate-limit`); timing-safe password compare; no DB keys in the client bundle; legacy Supabase JWT keys disabled in favor of an `sb_secret_` key. When deploying: set `CLIENT_ORIGIN` + `VITE_API_BASE_URL` to real domains and serve over HTTPS.
