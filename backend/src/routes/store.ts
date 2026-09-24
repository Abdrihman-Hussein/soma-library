import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const storeRouter = Router()

// All store routes require auth
storeRouter.use(requireAuth)

// GET /cart — list cart items
storeRouter.get(
  '/cart',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const items = await query<{
      book_id: number
      qty: number
      title: string
      author: string
      cover: string
      price_usd: number
    }>(
      `SELECT ci.book_id, ci.qty, b.title, b.author, b.cover, b.price_usd
       FROM cart_items ci
       JOIN books b ON b.id = ci.book_id
       WHERE ci.user_id = ?`,
      [userId],
    )

    res.json({
      items: items.map((i) => ({
        bookId: String(i.book_id),
        qty: i.qty,
        title: i.title,
        author: i.author,
        cover: i.cover ? JSON.parse(i.cover) : null,
        price: i.price_usd,
      })),
      total: items.reduce((sum, i) => sum + i.price_usd * i.qty, 0),
    })
  }),
)

// POST /cart — add item to cart
storeRouter.post(
  '/cart',
  asyncHandler(async (req, res) => {
    const schema = z.object({ bookId: z.string() })
    const body = schema.parse(req.body)
    const userId = req.user!.id

    // Verify book exists and is for sale
    const book = await queryOne<{ id: number; store: number }>(
      'SELECT id, store FROM books WHERE id = ?',
      [body.bookId],
    )
    if (!book) throw new ApiError(404, 'Book not found')
    if (!book.store) throw new ApiError(400, 'Book is not available for purchase')

    // Check if already in cart
    const existing = await queryOne<{ book_id: number }>(
      'SELECT book_id FROM cart_items WHERE user_id = ? AND book_id = ?',
      [userId, body.bookId],
    )
    if (existing) throw new ApiError(409, 'Book already in cart')

    // Check if already purchased
    const purchased = await queryOne<{ book_id: number }>(
      'SELECT book_id FROM user_books WHERE user_id = ? AND book_id = ?',
      [userId, body.bookId],
    )
    if (purchased) throw new ApiError(409, 'Book already purchased')

    await query('INSERT INTO cart_items (user_id, book_id, qty) VALUES (?, ?, 1)', [userId, body.bookId])

    res.status(201).json({ message: 'Added to cart' })
  }),
)

// DELETE /cart/:bookId — remove item from cart
storeRouter.delete(
  '/cart/:bookId',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const result = await query<{ affectedRows: number }>(
      'DELETE FROM cart_items WHERE user_id = ? AND book_id = ?',
      [userId, req.params.bookId],
    )

    if (result[0].affectedRows === 0) throw new ApiError(404, 'Item not in cart')

    res.json({ message: 'Removed from cart' })
  }),
)

// POST /checkout — create payment for cart items
storeRouter.post(
  '/checkout',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      method: z.enum(['evc_plus', 'zaad', 'card']),
    })
    const body = schema.parse(req.body)
    const userId = req.user!.id

    // Get cart items
    const items = await query<{ book_id: number; price_usd: number }>(
      `SELECT ci.book_id, b.price_usd
       FROM cart_items ci
       JOIN books b ON b.id = ci.book_id
       WHERE ci.user_id = ?`,
      [userId],
    )

    if (items.length === 0) throw new ApiError(400, 'Cart is empty')

    const total = items.reduce((sum, i) => sum + i.price_usd, 0)
    const ref = `PUR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Create payment record
    const result = await query<{ insertId: number }>(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES (?, ?, ?, 'pending', ?)`,
      [userId, total, body.method, ref],
    )

    const paymentId = String(result[0].insertId)

    // Clear cart
    await query('DELETE FROM cart_items WHERE user_id = ?', [userId])

    res.status(201).json({
      paymentId,
      reference: ref,
      amount: total,
      status: 'pending',
      message: 'Payment created. Awaiting confirmation.',
    })
  }),
)
