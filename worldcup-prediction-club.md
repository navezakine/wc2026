# ליגת הניחושים — מונדיאל 2026
## World Cup Prediction Club — Project Document

---

## Overview

A Hebrew-first, RTL web app that lets groups of Israeli friends compete on World Cup 2026 match predictions. A group creator shares a link or QR code, friends join with one click, and every day WhatsApp polls go out automatically for that day's matches. Points are tracked automatically and a live leaderboard keeps the competition alive through the entire tournament.

**Tournament window:** June 11 – July 19, 2026
**Target market:** Israeli users, Hebrew speakers
**Language:** Hebrew (עברית), RTL throughout

---

## Core Features

### Group Management
- Create a prediction group with a name
- Invite friends via shareable link, QR code, or phone number
- Join page at `/join/[invite_code]` — no signup required, just name + phone

### Daily Polls (WhatsApp)
- Sent automatically every day at 9:00 AM for that day's matches
- Each poll covers 3 prediction types:
  - **Winner** — who wins or draw
  - **Score** — exact scoreline (e.g. 2-1)
  - **Top scorer** — player name
- Members reply via WhatsApp; replies are parsed and saved
- Confirmation message sent on receipt
- Predictions lock at kickoff

### Points System
| Prediction | Points |
|---|---|
| Correct winner | 3 pts |
| Correct exact score | 5 pts |
| Correct top scorer | 2 pts |

### Leaderboard
- Live leaderboard at `/group/[invite_code]/leaderboard`
- Shows rank, name, total points, predictions made
- Each match result with color-coded correct/wrong predictions
- Auto-refreshes every 60 seconds during live matches
- Shareable URL

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS + RTL support |
| Font | Heebo or Assistant (Google Fonts) |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| WhatsApp | Twilio WhatsApp API |
| Match Data | football-data.org API |
| Payments | Stripe |
| Hosting | Vercel |

---

## Database Schema

### Tables

```sql
groups
  id, name, created_by, invite_code, qr_code_url, tier, created_at

members
  id, group_id, phone_number, display_name, joined_at

matches
  id, home_team, away_team, match_date, home_score, away_score,
  top_scorer, status (scheduled | live | finished)

predictions
  id, member_id, match_id, predicted_winner, predicted_home_score,
  predicted_away_score, predicted_top_scorer, points_earned, submitted_at
```

### Views
```sql
leaderboard
  — calculates total points per member per group
```

---

## Monetization

### Free Tier
- 1 group, up to 8 members
- Winner prediction only

### Paid Tier — ₪29/month
- Unlimited groups + members
- Score + top scorer predictions
- Leaderboard history
- Custom group name + emoji

---

## Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
FOOTBALL_DATA_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

---

## Build Phases

### Phase 1 — Project Setup
- React + Vite + Tailwind scaffolding
- RTL + Hebrew font configuration
- `/client` and `/server` folder structure
- `.env` template

### Phase 2 — Database Schema
- Supabase tables + leaderboard view
- Points calculation logic

### Phase 3 — Match Data Service
- football-data.org integration
- Daily cron job at 6 AM to fetch matches
- Post-match result + top scorer update
- Auto points calculation on match end

### Phase 4 — Group Creation Flow
- Landing page → create group form
- Invite code generation
- QR code generation (qrcode npm package)
- `/join/[invite_code]` join page
- Add friends by phone number

### Phase 5 — WhatsApp Poll Sender
- Twilio WhatsApp API integration
- Daily 9 AM poll dispatch per group
- Reply parsing (WIN / DRAW / SCORE / SCORER)
- Prediction save + confirmation message
- Kickoff deadline lock

### Phase 6 — Leaderboard Page
- `/group/[invite_code]/leaderboard`
- Ranked table with points breakdown
- Color-coded predictions (green / red)
- 60-second auto-refresh
- Share button

### Phase 7 — Payments
- Stripe integration
- Upgrade flow on group page
- Feature gating by `groups.tier`

---

## Claude Code Prompts

### Phase 1
```
Create a new full-stack web app called "World Cup Prediction Club"
(בעברית: "ליגת הניחושים - מונדיאל 2026") using:
- React + Vite for the frontend
- Node.js + Express for the backend
- Supabase for the database
- Tailwind CSS for styling

Important UI requirements:
- Full RTL (right-to-left) support throughout the entire app
- Set dir="rtl" and lang="he" on the HTML element
- Use a Hebrew-compatible font (Heebo or Assistant from Google Fonts)
- All UI text, buttons, labels, and error messages in Hebrew
- RTL-aware layout: sidebar on right, text aligned right,
  icons mirrored where needed

Set up the project structure with separate /client and /server folders.
Include a .env file template with placeholders for:
SUPABASE_URL, SUPABASE_ANON_KEY, TWILIO_ACCOUNT_SID,
TWILIO_AUTH_TOKEN, FOOTBALL_DATA_API_KEY
```

### Phase 2
```
Create the Supabase schema with these tables:

groups: id, name, created_by, invite_code, qr_code_url, created_at
members: id, group_id, phone_number, display_name, joined_at
matches: id, home_team, away_team, match_date, home_score, away_score,
         top_scorer, status (scheduled/live/finished)
predictions: id, member_id, match_id, predicted_winner, predicted_home_score,
             predicted_away_score, predicted_top_scorer, points_earned, submitted_at
leaderboard: view that calculates total points per member per group

Point system:
- Correct winner: 3 points
- Correct score: 5 points
- Correct top scorer: 2 points
```

### Phase 3
```
Create a service that fetches today's World Cup 2026 matches from
football-data.org API (endpoint: /v4/competitions/WC/matches).

- Fetch matches daily at 6am via a cron job
- Store them in the matches table
- After each match ends, fetch the result and update home_score,
  away_score, top_scorer, and status
- Trigger points calculation for all predictions on that match
```

### Phase 4
```
Build the group creation flow:

1. Landing page with "Create a Group" button (Hebrew: "צור קבוצה")
2. Form: enter your name + phone number + group name
3. On submit: generate a unique invite_code, generate a QR code
   using the qrcode npm package pointing to /join/[invite_code]
4. Show the creator a share page with:
   - Shareable link: yourapp.com/join/[invite_code]
   - QR code image they can screenshot
   - "Add friends by phone" button that opens a form to enter numbers
5. /join/[invite_code] page: shows group name, lets new member
   enter their name + phone and join
All text in Hebrew, full RTL layout.
```

### Phase 5
```
Using Twilio WhatsApp API, build a daily poll sender:

Every day at 9am, for each group that has members:
1. Fetch today's matches
2. For each match, send a WhatsApp message to every member:

"🏆 [קבוצה א'] נגד [קבוצה ב'] - היום בשעה [שעה]

שלח את הניחוש שלך:
1️⃣ מי מנצח? ענה: WINNER [שם קבוצה] או DRAW
2️⃣ תוצאה? ענה: SCORE 2-1
3️⃣ מלך השערים? ענה: SCORER [שם שחקן]

יש לך עד הקיקאוף לשלוח!"

3. When a member replies, parse their message and save to predictions table
4. Send a confirmation: "✅ הניחוש נשמר! בהצלחה 🎯"
```

### Phase 6
```
Build a public leaderboard page at /group/[invite_code]/leaderboard

Show:
- Group name + member count
- Ranked list: position, name, total points, predictions made
- Each match result with what each member predicted vs actual
- Highlight correct predictions in green, wrong in red
- "Share leaderboard" button that copies the URL
- Auto-refresh every 60 seconds during live matches

Full Hebrew RTL layout. Dark green and gold color scheme.
```

### Phase 7
```
Add a freemium model:

Free tier:
- 1 group, up to 8 members
- Winner prediction only

Paid tier (₪29/month):
- Unlimited groups + members
- Score + top scorer predictions
- Leaderboard history
- Custom group name + emoji

Add Stripe payment integration:
- Upgrade button on the group page (Hebrew: "שדרג לפרימיום")
- After payment, update group.tier to "paid" in Supabase
- Gate premium features based on tier
```

---

## External Services — Setup Checklist

- [ ] [supabase.com](https://supabase.com) — create project, get URL + anon key
- [ ] [twilio.com](https://twilio.com) — enable WhatsApp sandbox for testing
- [ ] [football-data.org](https://www.football-data.org) — get free API key
- [ ] [stripe.com](https://stripe.com) — create account, get test keys

---

## Timeline

| Day | Phase |
|---|---|
| 1 | Setup + Database |
| 2 | Match data + Group creation |
| 3 | WhatsApp polls |
| 4 | Leaderboard |
| 5 | Payments + Launch |

---

*Built for the Israeli market — Hebrew first, WhatsApp native, מונדיאל 2026 🏆*
