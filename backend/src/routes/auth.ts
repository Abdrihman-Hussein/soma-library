import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../config/env'
import { query, queryOne } from '../config/database'
import { requireAuth } from '../middleware/auth'
import { ApiError, asyncHandler } from '../middleware/errorHandler'

export const authRouter = Router()

const registerSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().max(150),
  password: z.string().min(6).max(255),
  phone: z.string().max(50).optional().default(''),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwt.secret,
    { expiresIn: '7d' },
  )
}

authRouter.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body)

    const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = ?', [body.email])
    if (existing) throw new ApiError(409, 'Email already registered')

    const hash = await bcrypt.hash(body.password, 10)

    const result = await query<{ insertId: number }>(
      'INSERT INTO users (name, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [body.name, body.email, hash, body.phone, 'reader', 'active'],
    )

    const userId = String(result[0].insertId)
    const token = signToken({ id: userId, email: body.email, role: 'reader' })

    res.status(201).json({
      token,
      user: { id: userId, name: body.name, email: body.email, role: 'reader', status: 'active' },
    })
  }),
)

authRouter.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body)

    const user = await queryOne<{ id: number; name: string; email: string; password_hash: string; role: string; status: string }>(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [body.email],
    )

    if (!user) throw new ApiError(401, 'Invalid email or password')
    if (user.status === 'suspended') throw new ApiError(403, 'Account suspended')

    const valid = await bcrypt.compare(body.password, user.password_hash)
    if (!valid) throw new ApiError(401, 'Invalid email or password')

    const token = signToken({ id: String(user.id), email: user.email, role: user.role })

    res.json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })
  }),
)

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await queryOne<{ id: number; name: string; email: string; phone: string; role: string; status: string; created_at: string }>(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [req.user!.id],
    )

    if (!user) throw new ApiError(404, 'User not found')

    res.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      joinedAt: user.created_at,
    })
  }),
)
