import { Router } from 'express'
import { z } from 'zod'
import { query, queryOne } from '../config/database'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const adminRouter = Router()

// All admin routes require auth + admin
adminRouter.use(requireAuth, requireAdmin)

// GET /admin/users — list all users
adminRouter.get(
  '/admin/users',
  asyncHandler(async (_req, res) => {
    const users = await query<{
      id: number
      name: string
      email: string
      phone: string
      role: string
      status: string
      created_at: string
    }>(
      'SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC',
    )

    // Get subscription info for each user
    const userIds = users.map((u) => u.id)
    const subs = userIds.length > 0
      ? await query<{
          user_id: number
          status: string
          plan_name: string
          expires_at: string
        }>(
          `SELECT s.user_id, s.status, p.name AS plan_name, s.expires_at
           FROM subscriptions s
           JOIN plans p ON p.id = s.plan_id
           WHERE s.user_id IN (?) AND s.status = 'active' AND s.expires_at > NOW()`,
          [userIds],
        )
      : []

    const subMap = new Map(subs.map((s) => [String(s.user_id), s]))

    // Get purchase counts
    const purchases = userIds.length > 0
      ? await query<{ user_id: number; count: number; total: number }>(
          `SELECT user_id, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
           FROM payments WHERE type = 'BOOK_PURCHASE' AND status = 'SUCCESS'
           GROUP BY user_id`,
          [userIds],
        )
      : []

    const purchaseMap = new Map(purchases.map((p) => [String(p.user_id), p]))

    res.json({
      users: users.map((u) => {
        const sub = subMap.get(String(u.id))
        const purchases = purchaseMap.get(String(u.id))
        return {
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          joinedAt: u.created_at,
          subscription: sub
            ? { status: sub.status, planName: sub.plan_name, expiresAt: sub.expires_at }
            : null,
          purchasesCount: purchases?.count ?? 0,
          purchasesTotal: purchases?.total ?? 0,
        }
      }),
    })
  }),
)

// PUT /admin/users/:id/status — suspend or activate a user
adminRouter.put(
  '/admin/users/:id/status',
  asyncHandler(async (req, res) => {
    const schema = z.object({ status: z.enum(['active', 'suspended']) })
    const body = schema.parse(req.body)
    const { id } = req.params

    if (id === req.user!.id) throw new ApiError(400, 'Cannot change your own account status')

    const user = await queryOne<{ id: number; name: string }>('SELECT id, name FROM users WHERE id = ?', [id])
    if (!user) throw new ApiError(404, 'User not found')

    await query('UPDATE users SET status = ? WHERE id = ?', [body.status, id])

    // Write audit log
    await query(
      'INSERT INTO audit_logs (actor_user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user!.id, body.status === 'suspended' ? 'SUSPEND' : 'ACTIVATE', 'user', id, `${body.status === 'suspended' ? 'Suspended' : 'Activated'} ${user.name}`],
    )

    res.json({ message: `User ${body.status}` })
  }),
)

// PUT /admin/users/:id/role — change user role
adminRouter.put(
  '/admin/users/:id/role',
  asyncHandler(async (req, res) => {
    const schema = z.object({ role: z.enum(['reader', 'admin']) })
    const body = schema.parse(req.body)
    const { id } = req.params

    if (id === req.user!.id) throw new ApiError(400, 'Cannot change your own role')

    const user = await queryOne<{ id: number }>('SELECT id FROM users WHERE id = ?', [id])
    if (!user) throw new ApiError(404, 'User not found')

    await query('UPDATE users SET role = ? WHERE id = ?', [body.role, id])

    res.json({ message: `Role set to ${body.role}` })
  }),
)

// GET /admin/audit-logs — list audit logs
adminRouter.get(
  '/admin/audit-logs',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(50),
    })
    const params = schema.parse(req.query)
    const offset = (params.page - 1) * params.limit

    const logs = await query<{
      id: number
      actor_user_id: number
      action: string
      entity: string
      entity_id: string
      details: string
      created_at: string
      actor_name: string
    }>(
      `SELECT al.id, al.actor_user_id, al.action, al.entity, al.entity_id, al.details, al.created_at,
              u.name AS actor_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.actor_user_id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [params.limit, offset],
    )

    const countRow = await queryOne<{ total: number }>('SELECT COUNT(*) AS total FROM audit_logs')

    res.json({
      logs: logs.map((l) => ({
        id: String(l.id),
        actor: l.actor_name ?? 'System',
        action: l.action,
        entity: l.entity,
        entityId: l.entity_id,
        details: l.details,
        timestamp: l.created_at,
      })),
      total: countRow?.total ?? 0,
      page: params.page,
      limit: params.limit,
    })
  }),
)
