import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const adminBooksRouter = Router()

// All admin book routes require auth + admin role
adminBooksRouter.use(requireAuth, requireAdmin)

const createBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(150),
  categoryId: z.string().optional(),
  description: z.string().optional().default(''),
  cover: z.any().optional(),
  pages: z.number().int().positive().optional().default(0),
  price: z.number().min(0).optional(),
  library: z.boolean().optional().default(true),
  store: z.boolean().optional().default(true),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).default('PUBLISHED'),
  pdfPath: z.string().optional().default(''),
  language: z.enum(['so', 'en']).optional().default('en'),
  year: z.number().int().optional(),
})

const updateBookSchema = createBookSchema.partial()

async function writeAuditLog(
  actorUserId: string,
  action: string,
  entity: string,
  entityId: string,
  details: string,
) {
  await query(
    'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [actorUserId, action, entity, entityId, details],
  )
}

adminBooksRouter.post(
  '/books',
  asyncHandler(async (req, res) => {
    const body = createBookSchema.parse(req.body)

    const result = await query<{ insertId: number }>(
      `INSERT INTO books (title, author, category_id, description, cover, pages, price_usd, library, store, status, pdf_path, language, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title,
        body.author,
        body.categoryId ?? null,
        body.description,
        body.cover ? JSON.stringify(body.cover) : null,
        body.pages,
        body.price ?? null,
        body.library ? 1 : 0,
        body.store ? 1 : 0,
        body.status,
        body.pdfPath,
        body.language,
        body.year ?? new Date().getFullYear(),
      ],
    )

    const bookId = String(result[0].insertId)
    await writeAuditLog(req.user!.id, 'CREATE', 'book', bookId, `Created "${body.title}"`)

    res.status(201).json({ id: bookId, message: 'Book created' })
  }),
)

adminBooksRouter.put(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const body = updateBookSchema.parse(req.body)
    const { id } = req.params

    const existing = await queryOne<{ id: number }>('SELECT id FROM books WHERE id = ?', [id])
    if (!existing) throw new ApiError(404, 'Book not found')

    const fields: string[] = []
    const values: unknown[] = []

    if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
    if (body.author !== undefined) { fields.push('author = ?'); values.push(body.author) }
    if (body.categoryId !== undefined) { fields.push('category_id = ?'); values.push(body.categoryId) }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
    if (body.cover !== undefined) { fields.push('cover = ?'); values.push(JSON.stringify(body.cover)) }
    if (body.pages !== undefined) { fields.push('pages = ?'); values.push(body.pages) }
    if (body.price !== undefined) { fields.push('price_usd = ?'); values.push(body.price) }
    if (body.library !== undefined) { fields.push('library = ?'); values.push(body.library ? 1 : 0) }
    if (body.store !== undefined) { fields.push('store = ?'); values.push(body.store ? 1 : 0) }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status) }
    if (body.pdfPath !== undefined) { fields.push('pdf_path = ?'); values.push(body.pdfPath) }
    if (body.language !== undefined) { fields.push('language = ?'); values.push(body.language) }
    if (body.year !== undefined) { fields.push('year = ?'); values.push(body.year) }

    if (fields.length === 0) throw new ApiError(400, 'No fields to update')

    values.push(id)
    await query(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values)

    await writeAuditLog(req.user!.id, 'UPDATE', 'book', id, `Updated book #${id}`)

    res.json({ message: 'Book updated' })
  }),
)

adminBooksRouter.delete(
  '/books/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const existing = await queryOne<{ id: number; title: string }>('SELECT id, title FROM books WHERE id = ?', [id])
    if (!existing) throw new ApiError(404, 'Book not found')

    await query('DELETE FROM books WHERE id = ?', [id])

    await writeAuditLog(req.user!.id, 'DELETE', 'book', id, `Deleted "${existing.title}"`)

    res.json({ message: 'Book deleted' })
  }),
)

// Bulk status update
adminBooksRouter.put(
  '/books/bulk/status',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      ids: z.array(z.string()).min(1),
      status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']),
    })
    const body = schema.parse(req.body)

    await query('UPDATE books SET status = ? WHERE id IN (?)', [body.status, body.ids])

    await writeAuditLog(req.user!.id, 'UPDATE', 'book', body.ids.join(','), `Bulk set ${body.ids.length} books to ${body.status}`)

    res.json({ message: `${body.ids.length} book(s) updated` })
  }),
)

// Bulk delete
adminBooksRouter.put(
  '/books/bulk/delete',
  asyncHandler(async (req, res) => {
    const schema = z.object({ ids: z.array(z.string()).min(1) })
    const body = schema.parse(req.body)

    await query('DELETE FROM books WHERE id IN (?)', [body.ids])

    await writeAuditLog(req.user!.id, 'DELETE', 'book', body.ids.join(','), `Bulk deleted ${body.ids.length} books`)

    res.json({ message: `${body.ids.length} book(s) deleted` })
  }),
)
