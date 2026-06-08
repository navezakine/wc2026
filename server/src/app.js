import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import authRouter from './routes/auth.js'
import matchesRouter from './routes/matches.js'
import leaderboardRouter from './routes/leaderboard.js'
import predictionsRouter from './routes/predictions.js'
import groupsRouter from './routes/groups.js'
import competitionRouter from './routes/competition.js'
import adminRouter from './routes/admin.js'
import { isSupabaseConfigured, usingServiceRole } from './config/supabase.js'

const clientDist = path.join(process.cwd(), 'client/dist')

export function createApp() {
  const app = express()

  // Behind a reverse proxy in production (so rate-limit sees the real client IP)
  app.set('trust proxy', 1)

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    }),
  )
  app.use(express.json({ limit: '100kb' })) // cap body size

  // Rate limiting — general API + stricter on admin (brute-force protection)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'יותר מדי בקשות — נסו שוב מאוחר יותר',
  })
  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'יותר מדי ניסיונות — נסו שוב מאוחר יותר',
  })
  app.use('/api', apiLimiter)
  app.use('/api/admin', adminLimiter)

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      supabase: isSupabaseConfigured,
      canWrite: usingServiceRole,
      time: new Date().toISOString(),
    })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/matches', matchesRouter)
  app.use('/api/leaderboard', leaderboardRouter)
  app.use('/api/predictions', predictionsRouter)
  app.use('/api/groups', groupsRouter)
  app.use('/api/competition', competitionRouter)
  app.use('/api/admin', adminRouter)

  // 404 for unknown API routes
  app.use('/api', (_req, res) => res.status(404).send('הנתיב לא נמצא'))

  // Serve built client (production)
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))

  // Error handler (Hebrew messages)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[error]', err)
    res.status(500).send(err.message || 'שגיאת שרת פנימית')
  })

  return app
}
