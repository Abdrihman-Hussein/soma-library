import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  Payment, PaymentMethod, Subscription, UserBook, Notification, Book,
} from '../types'
import * as db from '../data/db'
import type { DbUser } from '../data/db'

// ── Toast ──────────────────────────────────────────────────────────

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

// ── Context shape ──────────────────────────────────────────────────

export type LoginError = 'no-user' | 'bad-password' | 'suspended'

interface AppContextValue {
  // auth
  user: DbUser | null
  login: (email: string, password: string) => LoginError | null
  register: (name: string, email: string, phone: string, password: string) => { ok: boolean; error?: 'email-taken' }
  logout: () => void
  updateProfile: (patch: { name?: string; phone?: string; email?: string }) => { ok: boolean; error?: 'email-taken' }
  changePassword: (currentPw: string, newPw: string) => { ok: boolean; error?: 'bad-password' }

  // subscription
  subscription: Subscription | null
  subscribe: (planId: string, method: PaymentMethod) => { payment: Payment; subscription: Subscription }
  isSubscribed: boolean
  daysLeft: number

  // cart
  cartItems: { bookId: string; addedAt: string }[]
  cartCount: number
  cartTotal: number
  addToCart: (bookId: string) => void
  removeFromCart: (bookId: string) => void

  // library / purchases
  myBooks: UserBook[]
  checkout: (method: PaymentMethod) => { payment: Payment; bookIds: string[] } | null
  buySingleBook: (bookId: string, method: PaymentMethod) => Payment | null

  // payments history
  payments: Payment[]

  // notifications
  notifications: Notification[]
  unreadCount: number
  markAllRead: () => void

  // reader access check
  canRead: (bookId: string) => boolean

  // reading progress
  saveProgress: (bookId: string, page: number, totalPages: number) => void
  progressFor: (bookId: string) => { lastPage: number; updatedAt: string } | undefined
  continueReading: { book: Book; lastPage: number; totalPages: number; progressPct: number } | null

  // toast
  toasts: Toast[]
  toast: (message: string, tone?: Toast['tone']) => void

  // admin
  isAdmin: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

const dayMs = 24 * 60 * 60 * 1000

export function AppProvider({ children }: { children: ReactNode }) {
  // Seed version bump or first visit: read once at mount. db.* functions
  // persist every mutation, so state survives refresh by construction.
  const [, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const user = db.currentUser()

  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  // ── auth ──
  const login = useCallback(
    (email: string, password: string): LoginError | null => {
      const result = db.authenticate(email, password)
      if (!result.ok) return result.error ?? 'bad-password'
      refresh()
      return null
    },
    [refresh],
  )

  const register = useCallback(
    (name: string, email: string, phone: string, password: string) => {
      const result = db.createUser(name, email, phone, password)
      if (result.ok) refresh()
      return { ok: result.ok, error: result.error }
    },
    [refresh],
  )

  const logout = useCallback(() => {
    db.logout()
    refresh()
  }, [refresh])

  // ── subscription ──
  const subscription = useMemo(
    () => (user ? db.latestSubscription(user.id) ?? null : null),
    [user],
  )

  const daysLeft = useMemo(() => {
    if (!subscription) return 0
    const diff = new Date(subscription.expiresAt + 'T23:59:59').getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / dayMs))
  }, [subscription])

  const isSubscribed = Boolean(
    user && subscription?.status === 'ACTIVE' && daysLeft > 0 && user.status === 'active',
  )

  const subscribe = useCallback(
    (planId: string, method: PaymentMethod) => {
      const plan = db.getPlan(planId)
      if (!plan) throw new Error('Unknown plan')
      const uid = user?.id ?? 'guest'
      const payment = db.recordPayment(uid, plan.price, 'SUBSCRIPTION', method)
      const sub = db.createSubscription(uid, planId, payment.reference)
      db.pushNotification(uid, {
        type: 'payment_success',
        titleSo: `Lacag-bixintii waa la guuleystay — $${plan.price.toFixed(2)}`,
        titleEn: `Payment successful — $${plan.price.toFixed(2)}`,
        bodySo: `Subscription-ka ${plan.name} waa firfiran ilaa ${sub.expiresAt}. Ref: ${payment.reference}`,
        bodyEn: `${plan.name} subscription is active until ${sub.expiresAt}. Ref: ${payment.reference}`,
      })
      refresh()
      return { payment, subscription: sub }
    },
    [user, refresh],
  )

  // ── cart ──
  const cartItems = db.getCart()

  const addToCart = useCallback(
    (bookId: string) => {
      db.addToCart(bookId)
      refresh()
    },
    [refresh],
  )

  const removeFromCart = useCallback(
    (bookId: string) => {
      db.removeFromCart(bookId)
      refresh()
    },
    [refresh],
  )

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const book = db.getBook(item.bookId)
        return total + (book?.store ? book.price ?? 0 : 0)
      }, 0),
    [cartItems],
  )

  // ── purchases ──
  const myBooks = user ? db.getUserBooks(user.id) : []

  const checkout = useCallback(
    (method: PaymentMethod) => {
      if (!user) return null
      const result = db.checkoutCart(user.id, method)
      if (result.bookIds.length === 0) return null
      db.pushNotification(user.id, {
        type: 'payment_success',
        titleSo: `Iibsashadii waa la guuleystay — $${result.payment.amount.toFixed(2)}`,
        titleEn: `Purchase successful — $${result.payment.amount.toFixed(2)}`,
        bodySo: `${result.bookIds.length} buug ayaa lagu daray Buugaagtayda. Ref: ${result.payment.reference}`,
        bodyEn: `${result.bookIds.length} book(s) added to My Books. Ref: ${result.payment.reference}`,
      })
      refresh()
      return result
    },
    [user, refresh],
  )

  const buySingleBook = useCallback(
    (bookId: string, method: PaymentMethod) => {
      const book = db.getBook(bookId)
      if (!book?.store || book.price == null || !user) throw new Error('Book not purchasable')
      const payment = db.recordPayment(user.id, book.price, 'BOOK_PURCHASE', method)
      db.grantAccess(user.id, [bookId], 'PURCHASED')
      db.pushNotification(user.id, {
        type: 'payment_success',
        titleSo: `Iibsashadii waa la guuleystay — $${book.price.toFixed(2)}`,
        titleEn: `Purchase successful — $${book.price.toFixed(2)}`,
        bodySo: `'${book.title}' ayaa lagu daray Buugaagtayda. Ref: ${payment.reference}`,
        bodyEn: `'${book.title}' was added to My Books. Ref: ${payment.reference}`,
      })
      refresh()
      return payment
    },
    [user, refresh],
  )

  // ── payments ──
  const payments = user ? db.allPayments().filter((p) => p.userId === user.id) : []

  // ── notifications ──
  const notifications = user ? db.getNotifications(user.id) : []
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    if (!user) return
    db.markAllNotificationsRead(user.id)
    refresh()
  }, [user, refresh])

  // ── reader access ──
  const canRead = useCallback(
    (bookId: string) => db.canRead(user?.id ?? null, bookId, isSubscribed),
    [user, isSubscribed],
  )

  // ── reading progress ──
  const saveProgressFn = useCallback(
    (bookId: string, page: number, totalPages: number) => {
      if (!user) return
      db.saveProgress(user.id, bookId, page, totalPages)
      refresh()
    },
    [user, refresh],
  )

  const progressFor = useCallback(
    (bookId: string) => {
      if (!user) return undefined
      const entry = db.getProgress(user.id).find((h) => h.bookId === bookId)
      return entry ? { lastPage: entry.lastPage, updatedAt: entry.updatedAt } : undefined
    },
    [user],
  )

  const continueReading = useMemo(() => {
    if (!user) return null
    const hist = db.getProgress(user.id)
    for (const h of hist) {
      const book = db.getBook(h.bookId)
      if (book && h.lastPage > 1 && h.lastPage < h.totalPages) {
        return {
          book: book as Book,
          lastPage: h.lastPage,
          totalPages: h.totalPages,
          progressPct: Math.round((h.lastPage / h.totalPages) * 100),
        }
      }
    }
    return null
  }, [user, cartItems, myBooks]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({
      user, login, register, logout,
      updateProfile: (patch: { name?: string; phone?: string; email?: string }) => {
        if (!user) return { ok: false }
        const r = db.updateProfile(user.id, patch)
        refresh()
        return r
      },
      changePassword: (currentPw: string, newPw: string) => {
        if (!user) return { ok: false }
        const r = db.changePassword(user.id, currentPw, newPw)
        refresh()
        return r
      },
      subscription, subscribe, isSubscribed, daysLeft,
      cartItems, cartCount: cartItems.length, cartTotal,
      addToCart, removeFromCart,
      myBooks, checkout, buySingleBook,
      payments, notifications, unreadCount, markAllRead, canRead,
      saveProgress: saveProgressFn, progressFor, continueReading,
      toasts, toast,
      isAdmin: user?.role === 'admin',
    }),
    [user, login, register, logout, subscription, subscribe, isSubscribed, daysLeft,
     cartItems, cartTotal, addToCart, removeFromCart, myBooks, checkout,
     buySingleBook, payments, notifications, unreadCount, markAllRead, canRead,
     saveProgressFn, progressFor, continueReading, toasts, toast, refresh],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
