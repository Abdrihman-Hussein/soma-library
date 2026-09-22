import path from 'path'
import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import multer from 'multer'
import { env } from '../config/env'
import { resolvePdfFile } from '../lib/storage'
import { requireAdmin, requireAuth, requireReaderAccess } from '../middleware/auth'
import { ApiError } from '../middleware/errorHandler'
import { pdfUpload } from '../middleware/upload'

export const booksRouter = Router()

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many uploads. Try again later.' },
})

const fileLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Slow down.' },
})

// ── Admin: upload a book PDF ───────────────────────────────────────
// Admin-only — this endpoint writes to server disk, so it must never be open
// (see core rule #5 and issues #10/#9).
booksRouter.post('/books/upload-pdf', uploadLimiter, requireAuth, requireAdmin, (req, res, next) => {
  pdfUpload.single('pdf')(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        next(new ApiError(413, `PDF must be ${env.maxPdfUploadMb} MB or smaller.`))
        return
      }
      next(
        error instanceof ApiError
          ? error
          : new ApiError(400, error instanceof Error ? error.message : 'PDF upload failed.'),
      )
      return
    }

    if (!req.file) {
      next(new ApiError(400, 'A PDF file is required.'))
      return
    }

    // TODO(#9, #10): tie the stored file to a book row and write an audit entry.
    res.status(201).json({ pdfPath: req.file.filename })
  })
})

// ── Reader: stream a stored PDF ────────────────────────────────────
// Replaces the previous public `express.static('/pdfs')` mount: there is no
// directory listing and nothing is reachable without authorisation.
booksRouter.get('/reader/file/:filename', fileLimiter, requireReaderAccess, (req, res, next) => {
  const file = resolvePdfFile(req.params.filename)
  if (!file) {
    next(new ApiError(404, 'PDF not found.'))
    return
  }

  // Private to the requesting reader, revalidated on every open. ETag /
  // Last-Modified still give a cheap 304 while paging through one file.
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate')
  res.setHeader('Content-Disposition', `inline; filename="${path.basename(file)}"`)
  // The frontend embeds this cross-origin in an iframe, so relax exactly the
  // helmet defaults that would block framing — and nothing else.
  res.removeHeader('X-Frame-Options')
  res.setHeader('Content-Security-Policy', `frame-ancestors ${env.corsOrigin}`)
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

  res.sendFile(file, { dotfiles: 'deny', headers: { 'Content-Type': 'application/pdf' } }, (error) => {
    if (error && !res.headersSent) next(error)
  })
})
