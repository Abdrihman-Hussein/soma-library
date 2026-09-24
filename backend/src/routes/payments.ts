import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const paymentsRouter = Router()

// POST /payments — create a payment (user-facing)
paymentsRouter.post(
  '/payments',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      amount: z.number().positive(),
      method: z.enum(['evc_plus', 'zaad', 'card']),
      type: z.enum(['SUBSCRIPTION', 'BOOK_PURCHASE']),
    })
    const body = schema.parse(req.body)
    const userId = req.user!.id

    const ref = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const result = await query<{ insertId: number }>(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES (?, ?, ?, 'pending', ?)`,
      [userId, body.amount, body.method, ref],
    )

    res.status(201).json({
      paymentId: String(result[0].insertId),
      reference: ref,
      amount: body.amount,
      status: 'pending',
    })
  }),
)

// GET /payments/me — user's payment history
paymentsRouter.get(
  '/payments/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const payments = await query<{
      id: number
      amount: number
      method: string
      status: string
      reference: string
      created_at: string
    }>(
      'SELECT id, amount, method, status, reference, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    )

    res.json({
      payments: payments.map((p) => ({
        id: String(p.id),
        amount: p.amount,
        method: p.method,
        status: p.status,
        reference: p.reference,
        createdAt: p.created_at,
      })),
    })
  }),
)

// Admin-only routes below
paymentsRouter.use(requireAuth, requireAdmin)

// GET /admin/payments — list all payments
paymentsRouter.get(
  '/admin/payments',
  asyncHandler(async (_req, res) => {
    const payments = await query<{
      id: number
      user_id: number
      amount: number
      method: string
      status: string
      reference: string
      created_at: string
      user_name: string
    }>(
      `SELECT p.id, p.user_id, p.amount, p.method, p.status, p.reference, p.created_at, u.name AS user_name
       FROM payments p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`,
    )

    res.json({
      payments: payments.map((p) => ({
        id: String(p.id),
        userId: String(p.user_id),
        userName: p.user_name,
        amount: p.amount,
        method: p.method,
        status: p.status,
        reference: p.reference,
        createdAt: p.created_at,
      })),
    })
  }),
)

// PUT /admin/payments/:id/confirm — confirm a payment
paymentsRouter.put(
  '/admin/payments/:id/confirm',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const payment = await queryOne<{ id: number; user_id: number; status: string }>(
      'SELECT id, user_id, status FROM payments WHERE id = ?',
      [id],
    )
    if (!payment) throw new ApiError(404, 'Payment not found')
    if (payment.status !== 'pending') throw new ApiError(400, 'Payment is not pending')

    await query("UPDATE payments SET status = 'confirmed' WHERE id = ?", [id])

    // Write audit log
    await query(
      'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user!.id, 'CONFIRM', 'payment', id, `Confirmed payment #${id}`],
    )

    res.json({ message: 'Payment confirmed' })
  }),
)

// PUT /admin/payments/:id/refund — refund a payment
paymentsRouter.put(
  '/admin/payments/:id/refund',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const payment = await queryOne<{ id: number; user_id: number; status: string; reference: string }>(
      'SELECT id, user_id, status, reference FROM payments WHERE id = ?',
      [id],
    )
    if (!payment) throw new ApiError(404, 'Payment not found')
    if (payment.status === 'refunded') throw new ApiError(400, 'Already refunded')

    await query("UPDATE payments SET status = 'refunded' WHERE id = ?", [id])

    // Write audit log
    await query(
      'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user!.id, 'REFUND', 'payment', id, `Refunded payment ${payment.reference}`],
    )

    res.json({ message: 'Payment refunded' })
  }),
)
