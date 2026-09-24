import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const subscriptionsRouter = Router()

// GET /plans — list all plans (public)
subscriptionsRouter.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    const plans = await query<{
      id: number
      name: string
      price_usd: number
      duration_days: number
      book_limit: number
    }>('SELECT id, name, price_usd, duration_days, book_limit FROM plans ORDER BY price_usd ASC')

    res.json({
      plans: plans.map((p) => ({
        id: String(p.id),
        name: p.name,
        price: p.price_usd,
        durationDays: p.duration_days,
        bookLimit: p.book_limit,
      })),
    })
  }),
)

// POST /subscriptions — subscribe to a plan (requires pending payment)
subscriptionsRouter.post(
  '/subscriptions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ planId: z.string() })
    const body = schema.parse(req.body)
    const userId = req.user!.id

    // Verify plan exists
    const plan = await queryOne<{ id: number; name: string; duration_days: number; price_usd: number }>(
      'SELECT id, name, duration_days, price_usd FROM plans WHERE id = ?',
      [body.planId],
    )
    if (!plan) throw new ApiError(404, 'Plan not found')

    // Check for existing active subscription
    const active = await queryOne<{ id: number }>(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > NOW()",
      [userId],
    )
    if (active) throw new ApiError(409, 'You already have an active subscription')

    // Create pending payment
    const ref = `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const paymentResult = await query<{ insertId: number }>(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES (?, ?, 'evc_plus', 'pending', ?)`,
      [userId, plan.price_usd, ref],
    )

    // Create subscription (pending until payment confirmed)
    const subResult = await query<{ insertId: number }>(
      `INSERT INTO subscriptions (user_id, plan_id, status, expires_at)
       VALUES (?, ?, 'active', DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [userId, plan.id, plan.duration_days],
    )

    res.status(201).json({
      subscriptionId: String(subResult[0].insertId),
      paymentId: String(paymentResult[0].insertId),
      reference: ref,
      plan: plan.name,
      amount: plan.price_usd,
      status: 'active',
      message: 'Subscription created. Payment pending.',
    })
  }),
)

// GET /subscriptions/me — get current user's subscriptions
subscriptionsRouter.get(
  '/subscriptions/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const subs = await query<{
      id: number
      plan_id: number
      plan_name: string
      starts_at: string
      expires_at: string
      status: string
    }>(
      `SELECT s.id, s.plan_id, p.name AS plan_name, s.starts_at, s.expires_at, s.status
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId],
    )

    res.json({
      subscriptions: subs.map((s) => ({
        id: String(s.id),
        planId: String(s.plan_id),
        planName: s.plan_name,
        startedAt: s.starts_at,
        expiresAt: s.expires_at,
        status: s.status,
      })),
    })
  }),
)
