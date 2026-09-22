// ── Client-side persistence layer ─────────────────────────────────
// A real, working data layer backed by localStorage. Every mutation is
// written to disk immediately, so state survives refresh and restart.
// Structure mirrors the planned MySQL schema so a Phase-6 API swap is a
// drop-in: replace db.* calls with fetch() and keep the shapes.

import type {
  Book, Category, SubscriptionPlan, Payment, Notification, UserBook,
  ReadingHistoryEntry, User, AuditLog, Subscription, CartItem, JacketSpec,
} from '../types'

export type BookStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'

export interface DbBook extends Book {
  status: BookStatus
  pdfSize: string
  updatedAt: string
}

export interface DbUser extends User {
  password: string // salted digest (demo-grade; bcrypt arrives with the API)
}

export interface DbState {
  version: number
  users: DbUser[]
  books: DbBook[]
  categories: Category[]
  plans: SubscriptionPlan[]
  subscriptions: Subscription[]
  payments: Payment[]
  cart: Record<string, CartItem[]>            // userId -> items ('guest' allowed)
  userBooks: Record<string, UserBook[]>       // userId -> owned/accessed books
  progress: Record<string, ReadingHistoryEntry[]> // userId -> reading history
  notifications: Record<string, Notification[]>
  audit: AuditLog[]
  session: { userId: string | null }
}

// ── Persistence ────────────────────────────────────────────────────

const KEY = 'somalibrary.db.v1'
const VERSION = 2

/** The localStorage key backing the db — listen for it in `storage` events for cross-tab sync. */
export const DB_STORAGE_KEY = KEY

export function loadDb(): DbState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DbState
      if (parsed.version === VERSION) return parsed
      // Older stored state is upgraded in place — never silently discarded.
      const migrated = migrate(parsed)
      saveDb(migrated)
      return migrated
    }
  } catch {
    // corrupt state — fall through and reseed
  }
  const seeded = seed()
  saveDb(seeded)
  return seeded
}

/**
 * Upgrades stored state in place instead of throwing it away, so existing
 * accounts, carts and reading progress survive a schema change.
 */
function migrate(state: DbState): DbState {
  const books = (state.books ?? []) as Array<DbBook & { pdfPath?: string }>
  const needsPdfPaths = state.version < 2
  return {
    ...state,
    version: VERSION,
    books: books.map((book) =>
      needsPdfPaths ? { ...book, pdfPath: book.pdfPath ?? samplePdfForBook(book.id) } : book,
    ) as DbBook[],
  }
}

export function saveDb(state: DbState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked — the app keeps working in-memory
  }
}

export function resetDb(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

// ── Password hashing (demo-grade salted digest) ────────────────────
// Fine for a client-only app where the "attacker" is the user's own
// browser. The real backend replaces this with bcrypt.

function hashPassword(pw: string, salt: string): string {
  let h = 2166136261
  const input = salt + ':' + pw
  for (let round = 0; round < 512; round++) {
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i) + round
      h = Math.imul(h, 16777619)
    }
    h ^= h >>> 13
  }
  return salt + '$' + (h >>> 0).toString(36)
}

function makeSalt(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function hashNewPassword(pw: string): string {
  return hashPassword(pw, makeSalt())
}

export function verifyPassword(pw: string, stored: string): boolean {
  const idx = stored.indexOf('$')
  if (idx < 1) return false
  return hashPassword(pw, stored.slice(0, idx)) === stored
}

// ── Date helpers ───────────────────────────────────────────────────

const dayMs = 86_400_000

function iso(d: Date): string {
  return d.toISOString()
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * dayMs)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * dayMs)
}

// ── Seed content ───────────────────────────────────────────────────

const jacketPresets: Record<string, JacketSpec> = {
  ochre: { ground: '#8F5C12', ink: '#FFF7E6', accent: '#EFD5A2', motif: 'arch' },
  clay: { ground: '#A8452F', ink: '#FDF1E7', accent: '#F0BFA6', motif: 'chevron' },
  deepTeal: { ground: '#0F5148', ink: '#EAF5F1', accent: '#93C9B9', motif: 'wave' },
  slate: { ground: '#22333B', ink: '#F2EDE3', accent: '#9CC0B8', motif: 'grid' },
  plum: { ground: '#5B3550', ink: '#F6ECF3', accent: '#D3A9C4', motif: 'rings' },
  olive: { ground: '#5C6338', ink: '#F5F3E2', accent: '#C7CE9A', motif: 'moon' },
  indigo: { ground: '#2B3F6B', ink: '#EDF1FA', accent: '#A9BEE4', motif: 'star' },
  sand: { ground: '#CDAE83', ink: '#2E2415', accent: '#6B563A', motif: 'arch' },
  charcoal: { ground: '#2A2622', ink: '#F5EFE5', accent: '#C79A54', motif: 'rings' },
  rust: { ground: '#8C3B21', ink: '#FBE9DD', accent: '#E0A183', motif: 'wave' },
}

const categories: Category[] = [
  { id: 'self-help', nameSo: 'Fikirka', nameEn: 'Self Help' },
  { id: 'history', nameSo: 'Taariikh', nameEn: 'History' },
  { id: 'science', nameSo: 'Cilmiga', nameEn: 'Science' },
  { id: 'arabic', nameSo: 'Carabiga', nameEn: 'Arabic' },
  { id: 'poetry', nameSo: 'Maayatga', nameEn: 'Poetry' },
  { id: 'tech', nameSo: 'Tignoolajiyad', nameEn: 'Technology' },
]

type SeedBook = Omit<DbBook, 'pdfPath'> & { pdfPath?: string }

/** Demo PDFs shipped in backend/fixtures/pdfs — the API serves them by filename. */
const SAMPLE_PDFS = ['sample-book-1.pdf', 'sample-book-2.pdf', 'sample-book-3.pdf']

/** One mapping for both the seed and the v1→v2 migration, so they cannot drift. */
function samplePdfForBook(id: string): string {
  const index = Number.parseInt(id.replace(/\D/g, ''), 10)
  return SAMPLE_PDFS[(Number.isNaN(index) ? 0 : Math.max(0, index - 1)) % SAMPLE_PDFS.length]
}

const books: SeedBook[] = [
  {
    id: 'b1', title: 'Atomic Habits', author: 'James Clear', categoryId: 'self-help',
    language: 'en', year: 2018, pages: 352, rating: 4.5, ratingCount: 1204, popularity: 100,
    description: 'Tiny changes, remarkable results. A proven framework for building good habits and breaking bad ones, every day.',
    cover: { coverId: 12539702, isbn: '9780735211292', jacket: jacketPresets.ochre },
    library: true, store: true, price: 10, createdAt: dateOnly(daysAgo(18)),
    status: 'PUBLISHED', pdfSize: '1.2 MB', updatedAt: dateOnly(daysAgo(2)),
  },
  {
    id: 'b2', title: 'Taariikhda Soomaaliya', author: 'Prof. Cabdullaahi Cabdi', categoryId: 'history',
    language: 'so', year: 2024, pages: 280, rating: 4.8, ratingCount: 532, popularity: 92,
    description: 'Taariikh dahablan oo Soomaaliya laga soo qaatay wakhtiyadii hore ilaa maanta, si cad oo laysku fahmi karo.',
    cover: { jacket: jacketPresets.deepTeal },
    library: true, store: true, price: 8, createdAt: dateOnly(daysAgo(9)),
    status: 'PUBLISHED', pdfSize: '1.6 MB', updatedAt: dateOnly(daysAgo(3)),
  },
  {
    id: 'b3', title: 'Clean Code', author: 'Robert C. Martin', categoryId: 'tech',
    language: 'en', year: 2008, pages: 464, rating: 4.7, ratingCount: 2280, popularity: 88,
    description: 'A handbook of agile software craftsmanship. Writing code that is easy to read, maintain and extend.',
    cover: { coverId: 8065615, isbn: '9780132350884', jacket: jacketPresets.slate },
    library: true, store: true, price: 15, createdAt: dateOnly(daysAgo(30)),
    status: 'PUBLISHED', pdfSize: '2.0 MB', updatedAt: dateOnly(daysAgo(4)),
  },
  {
    id: 'b4', title: 'Axdiga Nolosha', author: 'Halimo Khaliif', categoryId: 'self-help',
    language: 'so', year: 2025, pages: 198, rating: 4.4, ratingCount: 311, popularity: 81,
    description: 'Tallooyin practical ah oo ku caawiya inaad noloshaada horumarisay talaabo kasta oo aad qaaddo.',
    cover: { jacket: jacketPresets.olive },
    library: true, store: false, price: null, createdAt: dateOnly(daysAgo(14)),
    status: 'PUBLISHED', pdfSize: '2.4 MB', updatedAt: dateOnly(daysAgo(5)),
  },
  {
    id: 'b5', title: 'Python Basics', author: 'David Amos', categoryId: 'tech',
    language: 'en', year: 2021, pages: 210, rating: 4.3, ratingCount: 890, popularity: 76,
    description: 'A friendly introduction to Python programming with hands-on exercises for absolute beginners.',
    cover: { coverId: 10859060, isbn: '9781775093329', jacket: jacketPresets.indigo },
    library: true, store: true, price: 8, createdAt: dateOnly(daysAgo(22)),
    status: 'PUBLISHED', pdfSize: '2.8 MB', updatedAt: dateOnly(daysAgo(6)),
  },
  {
    id: 'b6', title: '55 Dhibaabo Jacayl ah', author: 'Dr. Musdafa Maxmuud', categoryId: 'poetry',
    language: 'so', year: 2024, pages: 226, rating: 4.9, ratingCount: 445, popularity: 90,
    description: 'Buug Somali ah oo si xasaasi ah uga hadlaya jacaylka, naxariista iyo caqabadaha nolosha.',
    cover: { jacket: jacketPresets.plum },
    library: true, store: true, price: 6, createdAt: dateOnly(daysAgo(7)),
    status: 'PUBLISHED', pdfSize: '3.2 MB', updatedAt: dateOnly(daysAgo(7)),
  },
  {
    id: 'b7', title: 'The Prophet', author: 'Kahlil Gibran', categoryId: 'arabic',
    language: 'en', year: 1923, pages: 128, rating: 4.6, ratingCount: 980, popularity: 74,
    description: 'Poetic essays on love, work, joy and sorrow from one of the best-loved philosophers of the 20th century.',
    cover: { coverId: 418324, jacket: jacketPresets.sand },
    library: true, store: true, price: 6, createdAt: dateOnly(daysAgo(51)),
    status: 'PUBLISHED', pdfSize: '3.6 MB', updatedAt: dateOnly(daysAgo(8)),
  },
  {
    id: 'b8', title: 'Cilmiga Xiligga', author: 'Dr. Faadumo Xasan', categoryId: 'science',
    language: 'so', year: 2026, pages: 240, rating: 4.2, ratingCount: 96, popularity: 60,
    description: 'Aasaaska cilmiga xiligga oo loo sharaxay ardayda da’da yar, tusaaloyin fudud oo muuqda.',
    cover: { jacket: jacketPresets.rust },
    library: true, store: false, price: null, createdAt: dateOnly(daysAgo(5)),
    status: 'DRAFT', pdfSize: '4.0 MB', updatedAt: dateOnly(daysAgo(1)),
  },
  {
    id: 'b9', title: 'Deep Work', author: 'Cal Newport', categoryId: 'self-help',
    language: 'en', year: 2016, pages: 304, rating: 4.5, ratingCount: 1540, popularity: 85,
    description: 'Rules for focused success in a distracted world — how to produce at an elite level, day after day.',
    cover: { coverId: 7988607, isbn: '9781455586691', jacket: jacketPresets.charcoal },
    library: true, store: true, price: 12, createdAt: dateOnly(daysAgo(35)),
    status: 'PUBLISHED', pdfSize: '4.8 MB', updatedAt: dateOnly(daysAgo(9)),
  },
  {
    id: 'b10', title: 'Halganka Aqoonla\u2019aanta', author: 'Cabdiraxmaan Yuusuf', categoryId: 'history',
    language: 'so', year: 2022, pages: 320, rating: 4.1, ratingCount: 210, popularity: 55,
    description: 'Sheeko taariikhi ah oo ku saabsan halganka akhristayaasha Soomaaliyeed ee soo jeestay dhaqanka akhriska.',
    cover: { jacket: jacketPresets.clay },
    library: false, store: true, price: 9, createdAt: dateOnly(daysAgo(93)),
    status: 'ARCHIVED', pdfSize: '4.4 MB', updatedAt: dateOnly(daysAgo(2)),
  },
]

export const plans: SubscriptionPlan[] = [
  {
    id: 'basic', name: 'Basic', price: 3, durationDays: 30, bookLimit: 20,
    featuresSo: ['Buugaag daahiran', 'Akhris xaddidan'],
    featuresEn: ['20 books per month', 'Limited reading'],
  },
  {
    id: 'standard', name: 'Standard', price: 5, durationDays: 30, bookLimit: null, popular: true,
    featuresSo: ['Buugaag daahiran', 'Akhris aan xaddidnayn', 'Taariikhda akhriska'],
    featuresEn: ['Unlimited books', 'Unlimited reading', 'Reading history'],
  },
  {
    id: 'premium', name: 'Premium', price: 8, durationDays: 30, bookLimit: null,
    featuresSo: ['Dhammaan waxyaabaha Standard', 'Buugaag cusub oo hore'],
    featuresEn: ['Everything in Standard', 'Early access to new books'],
  },
]

// ── Seed users, payments, subscriptions ───────────────────────────

function seed(): DbState {
  const users: DbUser[] = [
    {
      id: 'u-admin', name: 'Ismail Warsame', email: 'admin@somalibrary.so', phone: '+252 61 000 0001',
      role: 'admin', avatarInitials: 'IW', joinedAt: dateOnly(daysAgo(240)), status: 'active',
      password: hashNewPassword('admin123'),
    },
    {
      id: 'u-demo', name: 'Axmed Maxamed', email: 'reader@somalibrary.so', phone: '+252 61 555 0123',
      role: 'reader', avatarInitials: 'AX', joinedAt: dateOnly(daysAgo(120)), status: 'active',
      password: hashNewPassword('reader123'),
    },
    {
      id: 'u2', name: 'Caasha Nuur', email: 'caasha@example.com', phone: '+252 63 444 2211',
      role: 'reader', avatarInitials: 'CN', joinedAt: dateOnly(daysAgo(98)), status: 'active',
      password: hashNewPassword('password123'),
    },
    {
      id: 'u3', name: 'Liibaan Warsame', email: 'liibaan@example.com', phone: '+252 65 333 7788',
      role: 'reader', avatarInitials: 'LW', joinedAt: dateOnly(daysAgo(82)), status: 'active',
      password: hashNewPassword('password123'),
    },
    {
      id: 'u4', name: 'Hodan Abdirahman', email: 'hodan@example.com', phone: '+252 61 222 9911',
      role: 'reader', avatarInitials: 'HA', joinedAt: dateOnly(daysAgo(64)), status: 'active',
      password: hashNewPassword('password123'),
    },
    {
      id: 'u5', name: 'Guled Xasan', email: 'guled@example.com', phone: '+252 63 111 4455',
      role: 'reader', avatarInitials: 'GX', joinedAt: dateOnly(daysAgo(45)), status: 'suspended',
      password: hashNewPassword('password123'),
    },
  ]

  const demoSub: Subscription = {
    id: 's-demo', userId: 'u-demo', planId: 'standard',
    startedAt: dateOnly(daysAgo(6)), expiresAt: dateOnly(daysFromNow(24)),
    status: 'ACTIVE', paymentRef: 'SML-2026-00841',
  }

  const subs: Subscription[] = [
    demoSub,
    { id: 's2', userId: 'u2', planId: 'basic', startedAt: dateOnly(daysAgo(12)), expiresAt: dateOnly(daysFromNow(18)), status: 'ACTIVE', paymentRef: 'SML-2026-00830' },
    { id: 's3', userId: 'u3', planId: 'standard', startedAt: dateOnly(daysAgo(40)), expiresAt: dateOnly(daysAgo(10)), status: 'EXPIRED', paymentRef: 'SML-2026-00701' },
    { id: 's4', userId: 'u5', planId: 'premium', startedAt: dateOnly(daysAgo(20)), expiresAt: dateOnly(daysFromNow(10)), status: 'ACTIVE', paymentRef: 'SML-2026-00795' },
  ]

  const payments: Payment[] = [
    { id: 'p1', userId: 'u-demo', amount: 5, currency: 'USD', type: 'SUBSCRIPTION', method: 'EVC Plus', reference: 'SML-2026-00841', status: 'SUCCESS', createdAt: iso(daysAgo(6)) },
    { id: 'p2', userId: 'u-demo', amount: 10, currency: 'USD', type: 'BOOK_PURCHASE', method: 'EVC Plus', reference: 'SML-2026-00837', status: 'SUCCESS', createdAt: iso(daysAgo(8)) },
    { id: 'p3', userId: 'u3', amount: 15, currency: 'USD', type: 'BOOK_PURCHASE', method: 'ZAAD Service', reference: 'SML-2026-00820', status: 'SUCCESS', createdAt: iso(daysAgo(14)) },
    { id: 'p4', userId: 'u-demo', amount: 5, currency: 'USD', type: 'SUBSCRIPTION', method: 'EVC Plus', reference: 'SML-2026-00755', status: 'FAILED', createdAt: iso(daysAgo(36)) },
    { id: 'p5', userId: 'u2', amount: 3, currency: 'USD', type: 'SUBSCRIPTION', method: 'ZAAD Service', reference: 'SML-2026-00830', status: 'SUCCESS', createdAt: iso(daysAgo(12)) },
    { id: 'p6', userId: 'u5', amount: 8, currency: 'USD', type: 'SUBSCRIPTION', method: 'Card', reference: 'SML-2026-00795', status: 'SUCCESS', createdAt: iso(daysAgo(20)) },
  ]

  const userBooks: Record<string, UserBook[]> = {
    'u-demo': [
      { bookId: 'b1', access: 'SUBSCRIPTION', acquiredAt: dateOnly(daysAgo(6)), expiresAt: demoSub.expiresAt, progressPct: 45 },
      { bookId: 'b4', access: 'SUBSCRIPTION', acquiredAt: dateOnly(daysAgo(6)), expiresAt: demoSub.expiresAt, progressPct: 12 },
      { bookId: 'b3', access: 'PURCHASED', acquiredAt: dateOnly(daysAgo(8)), progressPct: 78 },
      { bookId: 'b9', access: 'PURCHASED', acquiredAt: dateOnly(daysAgo(30)), progressPct: 100 },
    ],
    'u3': [
      { bookId: 'b3', access: 'PURCHASED', acquiredAt: dateOnly(daysAgo(14)), progressPct: 20 },
    ],
  }

  const progress: Record<string, ReadingHistoryEntry[]> = {
    'u-demo': [
      { bookId: 'b1', lastPage: 158, totalPages: 352, updatedAt: iso(daysAgo(1)) },
      { bookId: 'b3', lastPage: 362, totalPages: 464, updatedAt: iso(daysAgo(2)) },
    ],
  }

  const notifications: Record<string, Notification[]> = {
    'u-demo': [
      { id: 'n1', type: 'payment_success', titleSo: 'Lacag-bixintii waa la guuleystay — $5.00', titleEn: 'Payment successful — $5.00', bodySo: 'Subscription-ka Standard waa firfiran. Ref: SML-2026-00841', bodyEn: 'Standard subscription is active. Ref: SML-2026-00841', createdAt: iso(daysAgo(6)), read: false },
      { id: 'n2', type: 'book_new', titleSo: "Buug cusub: 'Taariikhda Soomaaliya'", titleEn: "New book: 'Taariikhda Soomaaliya'", createdAt: iso(daysAgo(9)), read: false },
      { id: 'n3', type: 'subscription_expiring', titleSo: 'Subscription-kaagu wuu dhammaanayaa 3 maalmood gudahood.', titleEn: 'Your subscription expires in 3 days.', actionLabelSo: 'Cusboonaysii hadda', actionLabelEn: 'Renew now', createdAt: iso(daysAgo(11)), read: true },
    ],
  }

  const audit: AuditLog[] = [
    { id: 'a1', timestamp: iso(daysAgo(3)), actor: 'Ismail Warsame', action: 'CREATE', entity: 'Book: Taariikhda Soomaaliya', details: 'Book published to Library + Store', ip: 'local' },
    { id: 'a2', timestamp: iso(daysAgo(5)), actor: 'System', action: 'UPDATE', entity: 'Plan: Standard', details: 'Price changed $4.00 → $5.00', ip: 'local' },
    { id: 'a3', timestamp: iso(daysAgo(8)), actor: 'System', action: 'SUSPEND', entity: 'User: Guled Xasan', details: 'Repeated sharing of PDF links', ip: 'local' },
    { id: 'a4', timestamp: iso(daysAgo(12)), actor: 'Ismail Warsame', action: 'DELETE', entity: 'Book: Old Draft v2', details: 'Removed draft with no PDF attached', ip: 'local' },
    { id: 'a5', timestamp: iso(daysAgo(13)), actor: 'Ismail Warsame', action: 'LOGIN', entity: 'Session: admin@somalibrary.so', details: 'Successful login', ip: 'local' },
  ]

  return {
    version: VERSION,
    users,
    books: books.map((book) => ({
      ...book,
      pdfPath: book.pdfPath ?? samplePdfForBook(book.id),
    })) as DbBook[],
    categories,
    plans,
    subscriptions: subs,
    payments,
    cart: {},
    userBooks,
    progress,
    notifications,
    audit,
    session: { userId: null },
  }
}

// ── Data access API ────────────────────────────────────────────────

let db: DbState = loadDb()

function flush(): void {
  saveDb(db)
}

/**
 * Re-read state from localStorage, discarding in-memory changes.
 * Call this when another tab writes to storage (see `storage` listener in
 * AppContext) so tabs stay in sync. Last writer still wins per key write —
 * acceptable for the localStorage prototype; the API layer resolves this
 * permanently (see #2).
 */
export function reloadDb(): void {
  db = loadDb()
}

// ── Books ──

export function allBooks(): DbBook[] {
  return db.books
}

export function getBook(id: string): DbBook | undefined {
  return db.books.find((b) => b.id === id)
}

export function allCategories(): Category[] {
  return db.categories
}

export function getCategory(id: string): Category | undefined {
  return db.categories.find((c) => c.id === id)
}

export function categoryName(id: string, lang: 'so' | 'en'): string {
  const c = getCategory(id)
  return !c ? '' : lang === 'so' ? c.nameSo : c.nameEn
}

/** Pick a deterministic jacket preset (for new books without real cover art). */
export function jacketForBook(key: string): JacketSpec {
  const presets = Object.values(jacketPresets)
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return presets[h % presets.length]
}

export function allPlans(): SubscriptionPlan[] {
  return db.plans
}

export function getPlan(id: string): SubscriptionPlan | undefined {
  return db.plans.find((p) => p.id === id)
}

// ── Users & auth ──

export function allUsers(): DbUser[] {
  return db.users
}

export function getUser(id: string): DbUser | undefined {
  return db.users.find((u) => u.id === id)
}

export function findUserByEmail(email: string): DbUser | undefined {
  const e = email.trim().toLowerCase()
  return db.users.find((u) => u.email.toLowerCase() === e)
}

export interface AuthResult {
  ok: boolean
  error?: 'no-user' | 'bad-password' | 'suspended'
  user?: DbUser
}

export function authenticate(email: string, password: string): AuthResult {
  const user = findUserByEmail(email)
  if (!user) return { ok: false, error: 'no-user' }
  if (!verifyPassword(password, user.password)) return { ok: false, error: 'bad-password' }
  if (user.status === 'suspended') return { ok: false, error: 'suspended' }
  db.session.userId = user.id
  logAudit('LOGIN', `Session: ${user.email}`, 'Successful login', user.name)
  return { ok: true, user }
}

export function createUser(name: string, email: string, phone: string, password: string): { ok: boolean; error?: 'email-taken'; user?: DbUser } {
  if (findUserByEmail(email)) return { ok: false, error: 'email-taken' }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const user: DbUser = {
    id: 'u' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    role: 'reader',
    avatarInitials: initials || 'US',
    joinedAt: dateOnly(new Date()),
    status: 'active',
    password: hashNewPassword(password),
  }
  db.users.push(user)
  db.notifications[user.id] = [
    {
      id: 'n' + Date.now().toString(36),
      type: 'book_new',
      titleSo: 'Soo dhawoow SomaLibrary!',
      titleEn: 'Welcome to SomaLibrary!',
      bodySo: 'Akoonkaaga waa firfiran. Baadh maktabadda ama dukaanka.',
      bodyEn: 'Your account is ready. Browse the library or the store.',
      createdAt: iso(new Date()),
      read: false,
    },
  ]
  db.session.userId = user.id
  flush()
  return { ok: true, user }
}

export function logout(): void {
  db.session.userId = null
  flush()
}

export function currentUser(): DbUser | null {
  if (!db.session.userId) return null
  return db.users.find((u) => u.id === db.session.userId) ?? null
}

export function updateProfile(
  userId: string,
  patch: { name?: string; phone?: string; email?: string },
): { ok: boolean; error?: 'email-taken' } {
  const user = getUser(userId)
  if (!user) return { ok: false }
  if (patch.email && patch.email.trim().toLowerCase() !== user.email.toLowerCase()) {
    if (findUserByEmail(patch.email)) return { ok: false, error: 'email-taken' }
    user.email = patch.email.trim().toLowerCase()
  }
  if (patch.name) user.name = patch.name.trim()
  if (patch.phone !== undefined) user.phone = patch.phone.trim()
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  if (initials) user.avatarInitials = initials
  flush()
  return { ok: true }
}

export function changePassword(userId: string, currentPw: string, newPw: string): { ok: boolean; error?: 'bad-password' } {
  const user = getUser(userId)
  if (!user || !verifyPassword(currentPw, user.password)) return { ok: false, error: 'bad-password' }
  user.password = hashNewPassword(newPw)
  flush()
  return { ok: true }
}

// ── Admin: users ──

export function setUserStatus(userId: string, status: 'active' | 'suspended', actor: string): void {
  const u = getUser(userId)
  if (!u) return
  u.status = status
  logAudit(status === 'active' ? 'UPDATE' : 'SUSPEND', `User: ${u.name}`, status === 'active' ? 'User reinstated' : 'User suspended', actor)
  flush()
}

export function setUserRole(userId: string, role: 'reader' | 'admin', actor: string): void {
  const u = getUser(userId)
  if (!u) return
  u.role = role
  logAudit('UPDATE', `User: ${u.name}`, `Role changed to ${role}`, actor)
  flush()
}

// ── Cart ──

function cartKey(): string {
  return currentUser()?.id ?? 'guest'
}

export function getCart(): CartItem[] {
  return db.cart[cartKey()] ?? []
}

export function addToCart(bookId: string): void {
  const k = cartKey()
  const items = db.cart[k] ?? []
  if (!items.some((i) => i.bookId === bookId)) {
    items.push({ bookId, addedAt: iso(new Date()) })
    db.cart[k] = items
    flush()
  }
}

export function removeFromCart(bookId: string): void {
  const k = cartKey()
  db.cart[k] = (db.cart[k] ?? []).filter((i) => i.bookId !== bookId)
  flush()
}

export function clearCart(): void {
  db.cart[cartKey()] = []
  flush()
}

// ── Ownership & access ──

export function getUserBooks(userId: string): UserBook[] {
  return db.userBooks[userId] ?? []
}

export function ownsBook(userId: string, bookId: string, access?: 'PURCHASED' | 'SUBSCRIPTION'): boolean {
  return getUserBooks(userId).some(
    (ub) => ub.bookId === bookId && (access === undefined || ub.access === access),
  )
}

export function grantAccess(userId: string, bookIds: string[], access: 'PURCHASED' | 'SUBSCRIPTION', expiresAt?: string): void {
  const owned = db.userBooks[userId] ?? []
  for (const bookId of bookIds) {
    if (access === 'PURCHASED') {
      if (!owned.some((ub) => ub.bookId === bookId)) {
        owned.push({ bookId, access, acquiredAt: dateOnly(new Date()), progressPct: 0 })
      } else {
        const existing = owned.find((ub) => ub.bookId === bookId)!
        if (existing.access === 'SUBSCRIPTION') {
          existing.access = 'PURCHASED'
          existing.acquiredAt = dateOnly(new Date())
          delete existing.expiresAt
        }
      }
    } else {
      const existing = owned.find((ub) => ub.bookId === bookId)
      if (existing && existing.access === 'PURCHASED') continue
      if (existing) {
        existing.expiresAt = expiresAt
      } else {
        owned.push({ bookId, access, acquiredAt: dateOnly(new Date()), expiresAt, progressPct: 0 })
      }
      // seed progress if none
      const hist = db.progress[userId] ?? []
      if (!hist.some((h) => h.bookId === bookId)) {
        const book = getBook(bookId)
        if (book) hist.push({ bookId, lastPage: 1, totalPages: book.pages, updatedAt: iso(new Date()) })
        db.progress[userId] = hist
      }
    }
  }
  db.userBooks[userId] = owned
  flush()
}

export function canRead(userId: string | null, bookId: string, activeSub: boolean): boolean {
  if (userId) {
    const owned = getUserBooks(userId).find((ub) => ub.bookId === bookId)
    if (owned?.access === 'PURCHASED') return true
    if (owned?.access === 'SUBSCRIPTION' && activeSub) return true
  }
  const book = getBook(bookId)
  return Boolean(book?.library && activeSub)
}

// ── Reading progress ──

export function getProgress(userId: string): ReadingHistoryEntry[] {
  return db.progress[userId] ?? []
}

export function saveProgress(userId: string, bookId: string, page: number, totalPages: number): void {
  const hist = db.progress[userId] ?? []
  const entry = hist.find((h) => h.bookId === bookId)
  const now = iso(new Date())
  if (entry) {
    entry.lastPage = page
    entry.totalPages = totalPages
    entry.updatedAt = now
  } else {
    hist.unshift({ bookId, lastPage: page, totalPages, updatedAt: now })
  }
  db.progress[userId] = hist

  const pct = Math.min(100, Math.round((page / Math.max(1, totalPages)) * 100))
  const owned = (db.userBooks[userId] ?? []).find((ub) => ub.bookId === bookId)
  if (owned) owned.progressPct = pct
  flush()
}

// ── Subscriptions ──

export function activeSubscription(userId: string): Subscription | undefined {
  const now = dateOnly(new Date())
  return db.subscriptions.find(
    (s) => s.userId === userId && s.status === 'ACTIVE' && s.expiresAt >= now,
  )
}

export function latestSubscription(userId: string): Subscription | undefined {
  const subs = db.subscriptions.filter((s) => s.userId === userId)
  return subs.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
}

export function createSubscription(userId: string, planId: string, paymentRef: string): Subscription {
  const plan = getPlan(planId)
  if (!plan) throw new Error('Unknown plan: ' + planId)
  const startedAt = dateOnly(new Date())
  const expiresAt = dateOnly(daysFromNow(plan.durationDays))
  const sub: Subscription = {
    id: 's' + Date.now().toString(36),
    userId, planId, startedAt, expiresAt,
    status: 'ACTIVE', paymentRef,
  }
  db.subscriptions.push(sub)
  flush()
  return sub
}

// ── Payments ──

function makeRef(): string {
  return `SML-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`
}

export function recordPayment(
  userId: string,
  amount: number,
  type: Payment['type'],
  method: Payment['method'],
): Payment {
  const payment: Payment = {
    id: 'p' + Date.now().toString(36),
    userId, amount, currency: 'USD', type, method,
    reference: makeRef(),
    status: 'SUCCESS',
    createdAt: iso(new Date()),
  }
  db.payments.unshift(payment)
  flush()
  return payment
}

export function allPayments(): Payment[] {
  return db.payments
}

export function refundPayment(paymentId: string, actor: string): void {
  const p = db.payments.find((x) => x.id === paymentId)
  if (!p || p.status !== 'SUCCESS') return
  p.status = 'REFUNDED'
  logAudit('REFUND', `Payment: ${p.reference}`, `Refunded $${p.amount.toFixed(2)}`, actor)
  flush()
}

// ── Checkout (cart -> purchase) ──

export function checkoutCart(
  userId: string,
  method: Payment['method'],
): { payment: Payment; bookIds: string[] } {
  const items = getCart()
  const bookIds = items.map((i) => i.bookId).filter((id) => {
    const b = getBook(id)
    return Boolean(b?.store && b.price != null)
  })
  const amount = bookIds.reduce((sum, id) => sum + (getBook(id)?.price ?? 0), 0)
  const payment = recordPayment(userId, amount, 'BOOK_PURCHASE', method)
  grantAccess(userId, bookIds, 'PURCHASED')
  clearCart()
  return { payment, bookIds }
}

// ── Notifications ──

export function getNotifications(userId: string): Notification[] {
  return db.notifications[userId] ?? []
}

export function pushNotification(userId: string, n: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
  const list = db.notifications[userId] ?? []
  list.unshift({
    ...n,
    id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: iso(new Date()),
    read: false,
  })
  db.notifications[userId] = list
  flush()
}

export function markAllNotificationsRead(userId: string): void {
  db.notifications[userId] = (db.notifications[userId] ?? []).map((n) => ({ ...n, read: true }))
  flush()
}

// ── Admin: books CRUD ──

export interface BookInput {
  title: string
  author: string
  categoryId: string
  language: 'so' | 'en'
  year: number
  pages: number
  description: string
  cover: Book['cover']
  library: boolean
  store: boolean
  price: number | null
  status: BookStatus
  pdfPath: string
}

function estimateSize(pages: number): string {
  return `${Math.max(0.4, pages * 0.012).toFixed(1)} MB`
}

export function createBook(input: BookInput, actor: string): DbBook {
  const book: DbBook = {
    id: 'b' + Date.now().toString(36),
    rating: 0,
    ratingCount: 0,
    popularity: 0,
    createdAt: dateOnly(new Date()),
    updatedAt: dateOnly(new Date()),
    pdfSize: estimateSize(input.pages),
    ...input,
  }
  db.books.push(book)
  logAudit('CREATE', `Book: ${book.title}`, `Added to ${[book.library && 'Library', book.store && 'Store'].filter(Boolean).join(' + ') || 'catalogue'}`, actor)
  flush()
  return book
}

export function updateBook(id: string, input: Partial<BookInput>, actor: string): DbBook | undefined {
  const book = getBook(id)
  if (!book) return undefined
  Object.assign(book, input, { updatedAt: dateOnly(new Date()) })
  logAudit('UPDATE', `Book: ${book.title}`, 'Book details updated', actor)
  flush()
  return book
}

export function deleteBook(id: string, actor: string): boolean {
  const book = getBook(id)
  if (!book) return false
  db.books = db.books.filter((b) => b.id !== id)
  logAudit('DELETE', `Book: ${book.title}`, 'Removed from catalogue', actor)
  flush()
  return true
}

export function setBookStatus(ids: string[], status: BookStatus, actor: string): void {
  for (const id of ids) {
    const book = getBook(id)
    if (book) {
      book.status = status
      book.updatedAt = dateOnly(new Date())
    }
  }
  if (ids.length > 0) {
    logAudit('UPDATE', `Books (${ids.length})`, `Bulk status set to ${status}`, actor)
  }
  flush()
}

// ── Admin: plans ──

export function updatePlan(id: string, patch: Partial<SubscriptionPlan>, actor: string): void {
  const plan = getPlan(id)
  if (!plan) return
  Object.assign(plan, patch)
  logAudit('UPDATE', `Plan: ${plan.name}`, `Plan updated`, actor)
  flush()
}

// ── Admin: subscriptions overview ──

export function allSubscriptions(): Subscription[] {
  return db.subscriptions
}

// ── Audit log ──

export function allAudit(): AuditLog[] {
  return db.audit
}

export function logAudit(action: AuditLog['action'], entity: string, details: string, actor: string): void {
  db.audit.unshift({
    id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: iso(new Date()),
    actor,
    action,
    entity,
    details,
    ip: 'local',
  })
  flush()
}

export function clearOldAudit(actor: string): void {
  const cutoff = iso(daysAgo(365))
  const before = db.audit.length
  db.audit = db.audit.filter((l) => l.timestamp >= cutoff)
  const removed = before - db.audit.length
  logAudit('DELETE', 'Audit retention', `Purged ${removed} events older than 12 months`, actor)
  flush()
}

// ── Init helper (dev console convenience) ──

export function resetAndReseed(): void {
  resetDb()
  db = loadDb()
}
