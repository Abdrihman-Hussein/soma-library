import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { FormEvent, ReactNode } from 'react'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allBooks } from '../data/db'
import { Cover } from './Cover'
import { Breadcrumbs, Icon, LanguageSwitch, ToastHost } from './ui'

// ── Brand mark ─────────────────────────────────────────────────────

function Mark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[6px] bg-primary text-surface shadow-[0_1px_2px_rgba(10,79,74,.3),0_8px_16px_-10px_rgba(10,79,74,.6)] ${className}`}
    >
      <Icon.Book className="h-[55%] w-[55%]" />
    </span>
  )
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-0 font-display text-[19px] font-semibold tracking-tight text-ink">
      Soma
      <span className="text-primary">Library</span>
    </span>
  )
}

// ── Site header ────────────────────────────────────────────────────

export function SiteHeader() {
  const { t } = useT()
  const { user, cartCount, logout, unreadCount } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Close the drawer whenever the route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const navLinks = [
    { to: '/library', label: t('nav.library') },
    { to: '/store', label: t('nav.store') },
    { to: '/plans', label: t('nav.plans') },
    { to: '/my-books', label: t('nav.myBooks') },
  ]

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = String(data.get('q') ?? '').trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const iconBtn =
    'relative flex h-10 w-10 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-inset hover:text-ink'

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement strip — the first thing that says "shop", not "app" */}
      <div className="bg-ink text-canvas">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-canvas/65">
            {t('footer.announce')}
          </p>
          <Link
            to="/plans"
            className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-canvas/65 transition-colors hover:text-canvas md:block"
          >
            {t('footer.announceLink')} →
          </Link>
        </div>
      </div>

      <div
        className={`border-b bg-canvas/88 backdrop-blur-xl transition-shadow ${
          scrolled ? 'border-divider shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[72px] md:gap-5 md:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('common.menu')}
            className={`${iconBtn} lg:hidden`}
          >
            <Icon.List />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="SomaLibrary">
            <Mark />
            <span className="hidden sm:flex">
              <Wordmark />
            </span>
          </Link>

          {/* Desktop nav — only once the search field has room to sit beside it */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-btn px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-ink underline decoration-primary decoration-2 underline-offset-[7px]'
                      : 'text-ink-soft hover:text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search */}
          <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 lg:block" role="search">
            <div className="relative">
              <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                name="q"
                type="search"
                placeholder={t('common.searchPlaceholder')}
                aria-label={t('common.search')}
                className="input !min-h-10 !rounded-full pl-9 text-[13px]"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            {/* The full-width search row below already covers every width
                under lg, so a separate search icon would be redundant. */}
            <div className="hidden lg:block">
              <LanguageSwitch compact />
            </div>

            <Link
              to="/notifications"
              className={iconBtn}
              aria-label={
                unreadCount > 0
                  ? `${t('notifications.title')} (${unreadCount} ${t('notifications.unread')})`
                  : t('notifications.title')
              }
            >
              <Icon.Bell />
              {unreadCount > 0 && (
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>

            <Link to="/cart" className={iconBtn} aria-label={t('nav.cart')}>
              <Icon.Cart />
              {cartCount > 0 && (
                <span className="tnum absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="ml-1 flex items-center gap-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-divider bg-surface py-1 pl-1 pr-3 transition-colors hover:border-primary/40"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                    {user.avatarInitials}
                  </span>
                  <span className="hidden max-w-24 truncate text-xs font-semibold text-ink sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title={t('common.logout')}
                  aria-label={t('common.logout')}
                  className={`${iconBtn} hidden lg:flex hover:text-status-danger`}
                >
                  <Icon.Logout className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-ink ml-1 !min-h-10 !px-4 text-[13px]">
                {t('common.login')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search row — a bookshop needs search in reach */}
        <div className="border-t border-divider/70 px-4 py-2.5 lg:hidden">
          <form onSubmit={submitSearch} role="search" className="relative">
            <Icon.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              name="q"
              type="search"
              placeholder={t('common.searchPlaceholder')}
              aria-label={t('common.search')}
              className="input !min-h-10 pl-9 text-[13px]"
            />
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col border-r border-divider bg-canvas shadow-lift">
            <div className="flex items-center justify-between border-b border-divider px-5 py-4">
              <Link to="/" className="flex items-center gap-2.5">
                <Mark className="h-8 w-8" />
                <Wordmark />
              </Link>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={t('common.close')} className={iconBtn}>
                <Icon.X />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `block border-b border-divider/70 px-3 py-3.5 font-display text-lg font-semibold tracking-tight ${
                      isActive ? 'text-primary' : 'text-ink'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              <div className="mt-5 space-y-0.5">
                {[
                  { to: '/profile', label: t('profile.title'), icon: Icon.User },
                  {
                    to: '/notifications',
                    label:
                      unreadCount > 0
                        ? `${t('notifications.title')} (${unreadCount})`
                        : t('notifications.title'),
                    icon: Icon.Bell,
                  },
                  { to: '/cart', label: t('nav.cart'), icon: Icon.Cart },
                ].map(({ to, label, icon: I }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-inset hover:text-ink"
                  >
                    <I className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="space-y-3 border-t border-divider px-5 py-4">
              <p className="eyebrow-plain">{t('common.language')}</p>
              <LanguageSwitch />
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="btn-outline w-full"
                >
                  <Icon.Logout className="h-4 w-4" />
                  {t('common.logout')}
                </button>
              ) : (
                <Link to="/login" className="btn-primary w-full">
                  {t('common.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ── Site footer ────────────────────────────────────────────────────

export function SiteFooter() {
  const { t } = useT()
  const [subscribed, setSubscribed] = useState(false)

  const columns = [
    {
      heading: t('footer.colShop'),
      links: [
        { to: '/library', label: t('nav.library') },
        { to: '/store', label: t('nav.store') },
        { to: '/plans', label: t('nav.plans') },
        { to: '/my-books', label: t('nav.myBooks') },
      ],
    },
    {
      heading: t('footer.colCompany'),
      links: [
        { to: '/', label: t('footer.about') },
        { to: '/', label: t('footer.contact') },
        { to: '/', label: t('footer.careers') },
        { to: '/', label: t('footer.press') },
      ],
    },
    {
      heading: t('footer.colSupport'),
      links: [
        { to: '/', label: t('footer.help') },
        { to: '/', label: t('footer.faq') },
        { to: '/', label: t('footer.terms') },
        { to: '/', label: t('footer.privacy') },
      ],
    },
  ]

  return (
    <footer className="mt-20 border-t border-divider bg-inset/45">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <Mark />
              <Wordmark />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">{t('footer.tagline')}</p>
            <p className="eyebrow-plain mt-6">{t('footer.madeIn')}</p>
          </div>

          <div>
            <h3 className="font-display text-title-sm font-semibold tracking-tight text-ink">
              {t('footer.newsletterTitle')}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              {t('footer.newsletterText')}
            </p>

            {subscribed ? (
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-status-success">
                <Icon.Check className="h-4 w-4" />
                {t('footer.newsletterOk')}
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubscribed(true)
                }}
                className="mt-4 flex max-w-md gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder={t('footer.newsletterPlaceholder')}
                  aria-label={t('footer.newsletterPlaceholder')}
                  className="input"
                />
                <button type="submit" className="btn-primary shrink-0">
                  {t('footer.subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-divider py-12 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="eyebrow-plain mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink-soft transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-5 border-t border-divider py-6">
          <p className="text-xs text-ink-faint">{t('footer.rights', { year: String(new Date().getFullYear()) })}</p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow-plain">{t('footer.paymentsHeading')}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['EVC Plus', 'ZAAD', 'Visa', 'Mastercard'].map((p) => (
                <span
                  key={p}
                  className="rounded-[3px] border border-divider bg-surface px-2 py-1 text-[10px] font-semibold text-ink-soft"
                >
                  {p}
                </span>
              ))}
            </div>
            <LanguageSwitch compact />
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Page header for interior pages ─────────────────────────────────

export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumbs,
  actions,
  align = 'left',
}: {
  title: string
  eyebrow?: string
  description?: string
  breadcrumbs?: { to?: string; label: string }[]
  actions?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div className={`border-b border-divider pb-7 pt-8 md:pb-9 md:pt-10 ${align === 'center' ? 'text-center' : ''}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={`mb-5 ${align === 'center' ? 'flex justify-center' : ''}`}>
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <div className={`flex flex-wrap items-end justify-between gap-5 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="display-title text-balance">{title}</h1>
          {description && <p className="lede mt-3 text-pretty">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

// ── Auth shell (login / register) ──────────────────────────────────
// Two panes: the form on paper, and a printed-cover panel that carries
// the brand. Replaces the old centred mobile form.

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  const covers = ['b2', 'b1', 'b7'].map((id) => allBooks().find((b) => b.id === id)).filter(Boolean) as NonNullable<ReturnType<typeof allBooks>[number]>[]
  const rotation = [-9, 0, 8]
  const lift = [16, 0, 18]
  const z = [1, 3, 2]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form pane */}
      <div className="flex flex-col border-r border-divider">
        <div className="flex items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <Mark />
            <Wordmark />
          </Link>
          <LanguageSwitch compact />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-sm">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display-title mt-4">{title}</h1>
            <p className="lede mt-2.5">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <p className="px-6 pb-6 text-center text-[10px] uppercase tracking-[0.14em] text-ink-faint md:px-10">
          © {new Date().getFullYear()} SomaLibrary
        </p>
      </div>

      {/* Art pane */}
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="flex items-end justify-center">
          {covers.map((b, i) => (
            <div
              key={b.id}
              style={{ transform: `rotate(${rotation[i]}deg) translateY(${lift[i]}px)`, zIndex: z[i] }}
              className={`w-[30%] shrink-0 ${i > 0 ? '-ml-[8%]' : ''}`}
            >
              <div className="shadow-lift">
                <Cover book={b} />
              </div>
            </div>
          ))}
        </div>

        <blockquote className="mx-auto mt-16 max-w-md text-center">
          <p className="font-display text-xl font-medium leading-snug text-canvas/90">
            “Akhrisku waa furaha aqoonta — kan wax akhrin maanta, waa kan hogaamin doona berri.”
          </p>
          <footer className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-canvas/45">
            SomaLibrary · Muqdisho
          </footer>
        </blockquote>
      </aside>
    </div>
  )
}

// ── User site layout ───────────────────────────────────────────────

export function AppLayout() {
  const { toasts } = useApp()
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ToastHost toasts={toasts} />
    </div>
  )
}

// ── Admin layout ───────────────────────────────────────────────────

const adminNav = [
  { to: '/admin', labelKey: 'admin.layout.dashboard', icon: Icon.Grid, end: true },
  { to: '/admin/books', labelKey: 'admin.layout.books', icon: Icon.Book, end: false },
  { to: '/admin/users', labelKey: 'admin.layout.users', icon: Icon.Users, end: false },
  { to: '/admin/subscriptions', labelKey: 'admin.layout.subs', icon: Icon.BarChart, end: false },
  { to: '/admin/payments', labelKey: 'admin.layout.payments', icon: Icon.Card, end: false },
  { to: '/admin/reports', labelKey: 'admin.layout.reports', icon: Icon.TrendUp, end: false },
  { to: '/admin/audit', labelKey: 'admin.layout.audit', icon: Icon.List, end: false },
  { to: '/admin/settings', labelKey: 'admin.layout.settings', icon: Icon.Settings, end: false },
]

export function AdminLayout() {
  const { t } = useT()
  const { toasts, user, logout } = useApp()

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-divider bg-inset/40 md:flex">
        <div className="border-b border-divider px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Mark className="h-8 w-8" />
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              Soma<span className="text-primary">Library</span>
            </span>
          </Link>
          <p className="eyebrow-plain mt-2.5">{t('admin.layout.console')}</p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {adminNav.map(({ to, labelKey, icon: I, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-btn px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-surface font-semibold text-ink shadow-soft'
                    : 'text-ink-soft hover:bg-surface/70 hover:text-ink'
                }`
              }
            >
              <I className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-divider p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-canvas">
              {user?.avatarInitials ?? 'AD'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">{user?.name ?? t('admin.layout.adminFallback')}</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{t('admin.layout.superAdmin')}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              title={t('admin.layout.logout')}
              className="rounded-btn p-1.5 text-ink-faint transition-colors hover:text-status-danger"
            >
              <Icon.Logout className="h-4 w-4" />
            </button>
          </div>
          <Link
            to="/"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-btn border border-divider bg-surface px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <Icon.ArrowLeft className="h-3.5 w-3.5" />
            {t('admin.layout.backToSite')}
          </Link>
        </div>
      </aside>

      {/* Mobile admin bar */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-divider bg-canvas/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <Mark className="h-7 w-7" />
              <span className="font-display text-sm font-semibold tracking-tight">
                {t('admin.layout.adminFallback')}<span className="text-ink-faint"> · SomaLibrary</span>
              </span>
            </Link>
            <Link to="/" className="text-xs font-semibold text-primary">
              {t('admin.layout.site')} →
            </Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2.5">
          {adminNav.map(({ to, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive ? 'bg-ink text-canvas' : 'bg-surface text-ink-soft border border-divider'
                }`
              }
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-16 pt-28 md:px-8 md:pt-8">
        <Outlet />
      </main>
      <ToastHost toasts={toasts} />
    </div>
  )
}
