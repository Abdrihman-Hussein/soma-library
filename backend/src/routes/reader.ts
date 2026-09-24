import path from 'path'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env'
import { queryOne } from '../config/database'
import { resolvePdfFile } from '../lib/storage'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const readerRouter = Router()

const fileLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
})

// GET /books/:id/pdf-token — get a short-lived signed token for reading a PDF
readerRouter.get(
  '/books/:id/pdf-token',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user!.id

    // Verify user has access to this book (purchased or subscription)
    const access = await queryOne<{ book_id: number }>(
      'SELECT book_id FROM user_books WHERE user_id = ? AND book_id = ?',
      [userId, id],
    )
    if (!access) throw new ApiError(403, 'You do not have access to this book')

    // Get the book's PDF path
    const book = await queryOne<{ id: number; pdf_path: string }>(
      'SELECT id, pdf_path FROM books WHERE id = ?',
      [id],
    )
    if (!book || !book.pdf_path) throw new ApiError(404, 'PDF not found')

    // Mint a short-lived token scoped to this file
    const token = jwt.sign(
      { id: userId, role: req.user!.role, file: book.pdf_path },
      env.jwt.secret,
      { expiresIn: '1h' },
    )

    res.json({ token, expiresIn: '1h' })
  }),
)

// GET /stream/:token — stream a PDF using a signed reader token
readerRouter.get(
  '/stream/:token',
  fileLimiter,
  asyncHandler(async (req, res, next) => {
    const { token } = req.params

    let payload: { id: string; role: string; file: string }
    try {
      payload = jwt.verify(token, env.jwt.secret) as { id: string; role: string; file: string }
    } catch {
      throw new ApiError(401, 'Invalid or expired token')
    }

    if (!payload.file) throw new ApiError(403, 'Token does not grant file access')

    const file = resolvePdfFile(payload.file)
    if (!file) throw new ApiError(404, 'PDF not found')

    // Private to the requesting reader
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate')
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(file)}"`)
    res.removeHeader('X-Frame-Options')
    res.setHeader('Content-Security-Policy', `frame-ancestors ${env.corsOrigin}`)
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    res.sendFile(file, { dotfiles: 'deny', headers: { 'Content-Type': 'application/pdf' } }, (error) => {
      if (error && !res.headersSent) next(error)
    })
  }),
)
