# ⚽ ליגת הניחושים - מונדיאל 2026 · World Cup Prediction Club

אפליקציית ווב Full-Stack לניחוש תוצאות מונדיאל 2026, עם תמיכה מלאה ב-RTL ובעברית.

A full-stack World Cup 2026 prediction game with **full RTL Hebrew support**.

| Layer    | Tech                                  |
| -------- | ------------------------------------- |
| Frontend | React + Vite + Tailwind CSS + React Router |
| Backend  | Node.js + Express                     |
| Database | Supabase (Postgres + Auth)            |
| Styling  | Tailwind, Heebo + Assistant (Hebrew fonts) |

---

## ✨ Features

- **Full RTL** — `dir="rtl"` + `lang="he"` on the HTML root, sidebar on the **right**, mirrored icons, right-aligned text.
- **Hebrew UI** — every label, button, and error message is in Hebrew.
- **Festive sports design** — championship red + gold over a stadium-night theme (per the `ui-ux-pro-max` / `frontend-design` skills).
- **Pages** — landing, dashboard, matches (with score prediction), my-predictions, live leaderboard with podium.
- **Works offline** — falls back to demo data when Supabase / the API aren't configured yet, so you can run it immediately.

---

## 📁 Structure

```
APP1/
├─ client/                 # React + Vite frontend
│  ├─ src/
│  │  ├─ components/        # Layout, Sidebar (RTL), Header, MatchCard, ...
│  │  ├─ pages/             # Home, Dashboard, Matches, Predictions, Leaderboard
│  │  ├─ lib/               # supabase client, api, icons, formatters
│  │  └─ data/              # demo fallback data
│  ├─ index.html           # <html lang="he" dir="rtl"> + Google Fonts
│  └─ tailwind.config.js    # design tokens (colors, fonts, animations)
├─ server/                 # Node + Express API
│  ├─ src/
│  │  ├─ routes/           # matches, predictions, leaderboard
│  │  ├─ services/         # football-data.org integration
│  │  └─ config/           # supabase client
│  └─ supabase-schema.sql  # DB tables + RLS
├─ .env.example            # root env template
└─ package.json            # root scripts (run client + server together)
```

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install                # root (concurrently)
npm run install:all        # installs both client and server
```

### 2. Configure environment

Copy the templates and fill in your keys:

```bash
cp .env.example .env                 # reference / root
cp server/.env.example server/.env   # backend
cp client/.env.example client/.env   # frontend (VITE_ vars)
```

Required keys (see `.env.example`):

```
SUPABASE_URL, SUPABASE_ANON_KEY,
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
FOOTBALL_DATA_API_KEY
```

> 💡 You can skip this step for a first look — the app runs in **demo mode** with sample data when no keys are set.

### 3. Set up the database (optional)

In the Supabase SQL editor, run [`server/supabase-schema.sql`](server/supabase-schema.sql).

### 4. Run

```bash
npm run dev          # runs client (5173) + server (4000) together
# or individually:
npm run dev:client
npm run dev:server
```

Open **http://localhost:5173**.

---

## 🔌 API

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/health`          | health + config status  |
| GET    | `/api/matches`         | all fixtures            |
| GET    | `/api/leaderboard`     | ranked players          |
| GET    | `/api/predictions?userId=` | a user's predictions |
| POST   | `/api/predictions`     | save / update a prediction |

---

## 🎨 Design

The visual language was generated with the `ui-ux-pro-max`, `frontend-design`, and
`canvas-design` skills — see [`design-system/MASTER.md`](design-system/MASTER.md) and
[`BRANDING-PHILOSOPHY.md`](BRANDING-PHILOSOPHY.md).
