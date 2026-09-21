import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import * as db from '../../data/db'
import { Cover } from '../../components/Cover'
import { Icon, StatusPill } from '../../components/ui'
import { useT } from '../../i18n'

// Simple inline SVG line chart (no chart lib — keeps the bundle light)
function RevenueChart() {
  const sub = [1200, 1350, 1280, 1520, 1690, 1830]
  const bk = [1450, 1620, 1890, 2010, 2240, 2380]
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const max = 2600
  const w = 560
  const h = 180
  const px = (i: number) => 40 + (i * (w - 60)) / (sub.length - 1)
  const py = (v: number) => h - 30 - (v / max) * (h - 50)
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 650, 1300, 1950, 2600].map((v) => (
        <g key={v}>
          <line x1="40" y1={py(v)} x2={w - 10} y2={py(v)} stroke="#E3D9C7" strokeWidth="1" />
          <text x="8" y={py(v) + 4} fontSize="9" fill="#9E9082">
            ${v / 1000}k
          </text>
        </g>
      ))}
      <path d={path(sub)} fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d={path(bk)}
        fill="none"
        stroke="#A87C3C"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
      />
      {months.map((m, i) => (
        <text key={m} x={px(i)} y={h - 10} fontSize="9" fill="#9E9082" textAnchor="middle">
          {m}
        </text>
      ))}
    </svg>
  )
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  deltaUp = true,
}: {
  icon: ReactNode
  label: string
  value: string
  delta?: string
  deltaUp?: boolean
}) {
  return (
    <div className="rounded-card border border-divider bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-inset text-ink-soft">
          {icon}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-0.5 rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${
              deltaUp ? 'bg-[#E4EFE5] text-[#2B5C3D]' : 'bg-[#F7E2DC] text-[#8A3225]'
            }`}
          >
            <Icon.TrendUp className="h-3 w-3" />
            {delta}
          </span>
        )}
      </div>
      <p className="tnum mt-5 font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.11em] text-ink-faint">{label}</p>
    </div>
  )
}

function SectionCard({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`overflow-hidden rounded-card border border-divider bg-surface ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function AdminDashboard() {
  const { t, lang } = useT()
  const users = db.allUsers()
  const books = db.allBooks()
  const payments = db.allPayments()
  const auditLogs = db.allAudit()

  const totalUsers = users.length
  const activeSubs = users.filter((u) => db.activeSubscription(u.id)).length
  const bookRevenue = payments.filter((p) => p.type === 'BOOK_PURCHASE' && p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0)
  const subRevenue = payments.filter((p) => p.type === 'SUBSCRIPTION' && p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0)

  const popular = [...books].sort((a, b) => b.popularity - a.popularity).slice(0, 5)
  const recentPayments = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow-plain">{t('admin.dashboard.overview')}</p>
          <h1 className="display-title mt-2">{t('admin.dashboard.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/books/new" className="btn-primary !min-h-10 text-[13px]">
            <Icon.Plus className="h-4 w-4" />
            {t('admin.dashboard.addBook')}
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={<Icon.Users className="h-4 w-4" />}
          label={t('admin.dashboard.totalUsers')}
          value={totalUsers.toLocaleString()}
          delta={t('admin.dashboard.live')}
          deltaUp
        />
        <KpiCard
          icon={<Icon.Shield className="h-4 w-4" />}
          label={t('admin.dashboard.activeSubs')}
          value={activeSubs.toLocaleString()}
          delta={t('admin.dashboard.live')}
          deltaUp
        />
        <KpiCard
          icon={<Icon.Book className="h-4 w-4" />}
          label={t('admin.dashboard.titlesPublished')}
          value={String(books.filter((b) => b.status === 'PUBLISHED').length)}
          delta={t('admin.dashboard.live')}
          deltaUp
        />
        <KpiCard
          icon={<Icon.Card className="h-4 w-4" />}
          label={t('admin.dashboard.revenueAllTime')}
          value={`$${(bookRevenue + subRevenue).toFixed(2)}`}
          delta={t('admin.dashboard.live')}
          deltaUp
        />
      </div>

      {/* Charts + popular */}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title={t('admin.dashboard.revenue6m')}
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-4 text-[11px] text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" /> {t('admin.dashboard.legendSub')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-accent" /> {t('admin.dashboard.legendBooks')}
              </span>
            </div>
          }
        >
          <div className="p-5">
            <RevenueChart />
          </div>
        </SectionCard>

        <SectionCard title={t('admin.dashboard.popularBooks')}>
          <div className="space-y-3 p-5">
            {popular.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="tnum w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
                <div className="w-8 shrink-0 overflow-hidden rounded-[3px] shadow-book">
                  <Cover book={b} size="S" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{b.title}</p>
                  <p className="truncate text-[10px] text-ink-faint">{b.author}</p>
                </div>
                <span className="tnum text-xs font-bold text-primary-dark">{b.popularity}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={<Icon.Cart className="h-4 w-4" />} label={t('admin.dashboard.totalPurchases')} value={String(payments.filter((p) => p.type === 'BOOK_PURCHASE').length)} />
        <KpiCard
          icon={<Icon.BarChart className="h-4 w-4" />}
          label={t('admin.dashboard.subRevenue')}
          value={`$${subRevenue.toFixed(2)}`}
        />
        <KpiCard icon={<Icon.Store className="h-4 w-4" />} label={t('admin.dashboard.bookRevenue')} value={`$${bookRevenue.toFixed(2)}`} />
        <KpiCard
          icon={<Icon.Library className="h-4 w-4" />}
          label={t('admin.dashboard.libraryActive')}
          value={activeSubs.toLocaleString()}
        />
      </div>

      {/* Recent payments */}
      <SectionCard
        title={t('admin.dashboard.recentPayments')}
        action={
          <Link to="/admin/payments" className="text-xs font-semibold text-primary-dark hover:text-primary">
            {t('admin.dashboard.viewAll')}
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-divider bg-inset/40 text-left text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.ref')}</th>
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.user')}</th>
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.type')}</th>
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.amount')}</th>
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.method')}</th>
                <th className="px-5 py-3 font-semibold">{t('admin.dashboard.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {recentPayments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-inset/30">
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">{p.reference}</td>
                  <td className="px-5 py-3 text-xs font-medium text-ink">{db.getUser(p.userId)?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-[3px] bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-dark">
                      {p.type === 'SUBSCRIPTION' ? t('admin.dashboard.typeSub') : t('admin.dashboard.typeBook')}
                    </span>
                  </td>
                  <td className="tnum px-5 py-3 font-semibold text-ink">${p.amount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-xs text-ink-soft">{p.method}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Activity */}
      <SectionCard
        title={t('admin.dashboard.latestActivity')}
        action={
          <Link to="/admin/audit" className="text-xs font-semibold text-primary-dark hover:text-primary">
            {t('admin.dashboard.auditLogs')}
          </Link>
        }
      >
        <div className="divide-y divide-divider">
          {auditLogs.slice(0, 4).map((l) => (
            <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 text-xs">
              <span className="shrink-0 rounded-[3px] bg-inset px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                {l.action}
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-soft">
                {l.entity} — {l.details}
              </span>
              <span className="hidden shrink-0 text-ink-faint md:block">
                {new Date(l.timestamp).toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
