import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const libraryRouter = Router()

// All library routes require auth
libraryRouter.use(requireAuth)

// GET /me/library — user's purchased/subscribed books
libraryRouter.get(
  '/me/library',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const books = await query<{
      book_id: number
      source: string
      purchased_at: string
      title: string
      author: string
      cover: string
      pages: number
      pdf_path: string
      last_page: number
      total_pages: number
      updated_at: string
    }>(
      `SELECT ub.book_id, ub.source, ub.purchased_at,
              b.title, b.author, b.cover, b.pages, b.pdf_path,
              rp.last_page, rp.total_pages, rp.updated_at
       FROM user_books ub
       JOIN books b ON b.id = ub.book_id
       LEFT JOIN reading_progress rp ON rp.user_id = ub.user_id AND rp.book_id = ub.book_id
       WHERE ub.user_id = ?
       ORDER BY ub.purchased_at DESC`,
      [userId],
    )

    res.json({
      books: books.map((b) => ({
        bookId: String(b.book_id),
        access: b.source === 'purchase' ? 'PURCHASED' : 'SUBSCRIPTION',
        acquiredAt: b.purchased_at,
        title: b.title,
        author: b.author,
        cover: b.cover ? JSON.parse(b.cover) : null,
        pages: b.pages,
        pdfPath: b.pdf_path,
        progressPct: b.total_pages > 0 ? Math.round((b.last_page / b.total_pages) * 100) : 0,
        lastPage: b.last_page,
        totalPages: b.total_pages,
        updatedAt: b.updated_at,
      })),
    })
  }),
)

// GET /me/reading-progress — all reading progress
libraryRouter.get(
  '/me/reading-progress',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const progress = await query<{
      book_id: number
      last_page: number
      total_pages: number
      updated_at: string
    }>(
      'SELECT book_id, last_page, total_pages, updated_at FROM reading_progress WHERE user_id = ?',
      [userId],
    )

    res.json({
      history: progress.map((p) => ({
        bookId: String(p.book_id),
        lastPage: p.last_page,
        totalPages: p.total_pages,
        updatedAt: p.updated_at,
      })),
    })
  }),
)

// PUT /me/reading-progress — update reading progress for a book
libraryRouter.put(
  '/me/reading-progress',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      bookId: z.string(),
      lastPage: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    })
    const body = schema.parse(req.body)
    const userId = req.user!.id

    // Verify user has access to this book
    const access = await queryOne<{ book_id: number }>(
      'SELECT book_id FROM user_books WHERE user_id = ? AND book_id = ?',
      [userId, body.bookId],
    )
    if (!access) throw new ApiError(403, 'You do not have access to this book')

    await query(
      `INSERT INTO reading_progress (user_id, book_id, last_page, total_pages)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE last_page = VALUES(last_page), total_pages = VALUES(total_pages)`,
      [userId, body.bookId, body.lastPage, body.totalPages],
    )

    res.json({ message: 'Progress updated' })
  }),
)
