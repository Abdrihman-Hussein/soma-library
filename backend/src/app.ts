import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { booksRouter } from './routes/books'

/**
 * The express app without `listen()`, so `server.ts` owns the bootstrap and
 * tests (#14) can import the app directly.
 */
export const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: env.nodeEnv })
})

app.use('/api', booksRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)
