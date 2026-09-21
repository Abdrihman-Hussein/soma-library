import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthUser {
  id: string
  email: string
  role: 'reader' | 'admin'
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthUser
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(role: 'reader' | 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' })
    if (req.user.role !== role) return res.status(403).json({ error: 'Insufficient permissions' })
    next()
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next)
}

/**
 * Authorises a PDF stream. A viewer embedded in an `<iframe>` cannot send
 * headers, so a short-lived token may also travel as `?token=` — mint it
 * scoped to one file (`file` claim) so it cannot unlock the rest of the shelf.
 *
 * TODO(#9, #10): once MySQL and API auth land, the reader token endpoint also
 * verifies an active subscription or an unlocked purchase for this user.
 */
export function requireReaderAccess(req: Request, res: Response, next: NextFunction) {
  // Development only: `pdfDevPublic` is forced false in production (env.ts).
  if (env.pdfDevPublic) {
    next()
    return
  }

  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : typeof req.query.token === 'string'
      ? req.query.token
      : null

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthUser & { file?: string }
    if (payload.file && payload.file !== req.params.filename) {
      return res.status(403).json({ error: 'Token is not valid for this file' })
    }
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
