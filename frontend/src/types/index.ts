// ── Shared domain types ────────────────────────────────────────────

export type Lang = 'so' | 'en'

export type Role = 'reader' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  avatarInitials: string
  joinedAt: string
  status: 'active' | 'suspended'
}

export interface Author {
  id: string
  name: string
}

export interface Category {
  id: string
  nameSo: string
  nameEn: string
}

// ── Cover art ──────────────────────────────────────────────────────

/** Geometric motif screen-printed onto a designed jacket. */
export type JacketMotif = 'arch' | 'wave' | 'rings' | 'star' | 'chevron' | 'grid' | 'moon'

/** Spec for a designed typographic jacket (used when no real cover exists). */
export interface JacketSpec {
  ground: string   // printed background
  ink: string      // title + author colour
  accent: string   // motif + rule colour
  motif: JacketMotif
}

/**
 * Every book gets a `cover`. Real artwork is fetched from Open Library when
 * a cover id or ISBN is known; the designed jacket is the fallback — so the
 * grid never shows a broken image and Somali-language titles always look
 * intentional.
 */
export interface CoverSource {
  coverId?: number
  isbn?: string
  jacket: JacketSpec
}

export interface Book {
  id: string
  title: string
  author: string
  categoryId: string
  language: 'so' | 'en'
  year: number
  description: string
  cover: CoverSource
  library: boolean        // available with subscription
  store: boolean          // available for purchase
  price: number | null    // store price in USD
  pages: number
  rating: number
  ratingCount: number
  popularity: number      // for "popular" sorting
  pdfPath: string         // filename served by the demo backend's /pdfs route
  createdAt: string
}

export interface SubscriptionPlan {
  id: string
  name: 'Basic' | 'Standard' | 'Premium'
  price: number
  durationDays: number
  bookLimit: number | null // null = unlimited
  popular?: boolean
  featuresSo: string[]
  featuresEn: string[]
}

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface Subscription {
  id: string
  userId: string
  planId: string
  startedAt: string
  expiresAt: string
  status: SubscriptionStatus
  paymentRef: string
}

export type PaymentType = 'SUBSCRIPTION' | 'BOOK_PURCHASE'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'EVC Plus' | 'ZAAD Service' | 'Card'

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: 'USD'
  type: PaymentType
  method: PaymentMethod
  reference: string
  status: PaymentStatus
  createdAt: string
}

export interface CartItem {
  bookId: string
  addedAt: string
}

export type PurchaseAccess = 'PURCHASED' | 'SUBSCRIPTION'

export interface UserBook {
  bookId: string
  access: PurchaseAccess
  acquiredAt: string        // purchased date
  expiresAt?: string        // only for subscription access
  progressPct: number
}

export interface ReadingHistoryEntry {
  bookId: string
  lastPage: number
  totalPages: number
  updatedAt: string
}

export interface Notification {
  id: string
  type: 'payment_success' | 'payment_failed' | 'book_new' | 'subscription_expiring' | 'subscription_expired'
  titleSo: string
  titleEn: string
  bodySo?: string
  bodyEn?: string
  createdAt: string
  read: boolean
  actionLabelSo?: string
  actionLabelEn?: string
}

// ── Admin-specific ─────────────────────────────────────────────────

export type BookStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'

export interface AdminBook extends Book {
  status: BookStatus
  pdfSize: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actor: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SUSPEND' | 'REFUND'
  entity: string
  details: string
  ip: string
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  subscription: { status: SubscriptionStatus; planName?: string; expiresAt?: string } | null
  purchasesCount: number
  purchasesTotal: number
  status: 'ACTIVE' | 'SUSPENDED'
}
