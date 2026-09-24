import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const booksPublicRouter = Router()

const listBooksSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).default('PUBLISHED'),
})

booksPublicRouter.get(
  '/books',
  asyncHandler(async (req, res) => {
    const params = listBooksSchema.parse(req.query)
    const offset = (params.page - 1) * params.limit

    let where = 'WHERE b.status = ?'
    const binds: unknown[] = [params.status]

    if (params.category) {
      where += ' AND b.category_id = ?'
      binds.push(params.category)
    }

    if (params.q) {
      where += ' AND (b.title LIKE ? OR b.author LIKE ?)'
      const like = `%${params.q}%`
      binds.push(like, like)
    }

    const countRow = await queryOne<{ total: number }>(
      `SELECT COUNT(*) AS total FROM books b ${where}`,
      binds,
    )

    const books = await query<{
      id: number
      title: string
      author: string
      category_id: string
      description: string
      cover: string
      pages: number
      price_usd: number
      status: string
      pdf_path: string
      created_at: string
    }>(
      `SELECT id, title, author, category_id, description, cover, pages, price_usd, status, pdf_path, created_at
       FROM books b ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...binds, params.limit, offset],
    )

    res.json({
      books: books.map((b) => ({
        id: String(b.id),
        title: b.title,
        author: b.author,
        categoryId: b.category_id,
        description: b.description,
        cover: b.cover ? JSON.parse(b.cover) : null,
        pages: b.pages,
        price: b.price_usd,
        status: b.status,
        pdfPath: b.pdf_path,
        createdAt: b.created_at,
      })),
      total: countRow?.total ?? 0,
      page: params.page,
      limit: params.limit,
    })
  }),
)

booksPublicRouter.get(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const book = await queryOne<{
      id: number
      title: string
      author: string
      category_id: string
      description: string
      cover: string
      pages: number
      price_usd: number
      status: string
      pdf_path: string
      created_at: string
      updated_at: string
    }>(
      'SELECT id, title, author, category_id, description, cover, pages, price_usd, status, pdf_path, created_at, updated_at FROM books WHERE id = ?',
      [req.params.id],
    )

    if (!book) throw new ApiError(404, 'Book not found')

    res.json({
      id: String(book.id),
      title: book.title,
      author: book.author,
      categoryId: book.category_id,
      description: book.description,
      cover: book.cover ? JSON.parse(book.cover) : null,
      pages: book.pages,
      price: book.price_usd,
      status: book.status,
      pdfPath: book.pdf_path,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
    })
  }),
)
