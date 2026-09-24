import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { booksRouter } from './routes/books'
import { authRouter } from './routes/auth'
import { booksPublicRouter } from './routes/booksPublic'
import { adminBooksRouter } from './routes/adminBooks'
import { libraryRouter } from './routes/library'
import { storeRouter } from './routes/store'
import { subscriptionsRouter } from './routes/subscriptions'
import { paymentsRouter } from './routes/payments'
import { adminRouter } from './routes/admin'
import { readerRouter } from './routes/reader'

/**
 * The express app without `listen()`, so `server.ts` owns the bootstrap and
 * tests (#14) can import the app directly.
 */
export const app = express()

// ── Global middleware ────────────────────────────────────────────────
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
})
app.use('/api', globalLimiter)

// ── Health check ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: env.nodeEnv })
})

// ── Mount routers ────────────────────────────────────────────────────
// Auth (public + protected)
app.use('/api', authRouter)

// Books — public list + get by id
app.use('/api', booksPublicRouter)

// Books — upload + reader (existing from #4)
app.use('/api', booksRouter)

// Admin books CRUD
app.use('/api', adminBooksRouter)

// User library + reading progress
app.use('/api', libraryRouter)

// Cart + checkout
app.use('/api', storeRouter)

// Plans + subscriptions
app.use('/api', subscriptionsRouter)

// Payments (user + admin)
app.use('/api', paymentsRouter)

// Admin users + audit logs
app.use('/api', adminRouter)

// Reader PDF token + stream
app.use('/api', readerRouter)

// ── 404 for unknown routes ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// ── Error handler ────────────────────────────────────────────────────
app.use(errorHandler)
