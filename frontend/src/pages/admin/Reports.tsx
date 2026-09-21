import { useState } from 'react'
import * as db from '../../data/db'
import { Cover } from '../../components/Cover'
import { Icon } from '../../components/ui'
import { useT } from '../../i18n'

function BarChart() {
  const data = [
    { m: 'Feb', v: 42 }, { m: 'Mar', v: 55 }, { m: 'Apr', v: 61 }, { m: 'May', v: 48 },
    { m: 'Jun', v: 70 }, { m: 'Jul', v: 82 }, { m: 'Aug', v: 91 }, { m: 'Sep', v: 100 },
  ]
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.m} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-[3px] bg-primary transition-all hover:bg-primary-dark"
            style={{ height: `${d.v}%` }}
          />
          <span className="text-[10px] text-ink-faint">{d.m}</span>
        </div>
      ))}
    </div>
  )
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  let acc = 0
  const stops = segments.map((s) => {
    const start = (acc / total) * 100
    acc += s.value
    const end = (acc / total) * 100
    return `${s.color} ${start}% ${end}%`
  })
  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops.join(',')})` }}>
        <div className="m-[22%] h-[56%] w-[56%] rounded-full bg-surface" />
      </div>
      <ul className="space-y-1.5 text-xs">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-ink-soft">{s.label}</span>
            <span className="font-semibold">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Reports() {
  const { t } = useT()
  const [tab, setTab] = useState<'store' | 'library'>('store')

  const books = db.allBooks()
  const users = db.allUsers()
  const payments = db.allPayments()

  const topBooks = [...books].sort((a, b) => b.popularity - a.popularity).slice(0, 5)
  const topUsers = users
    .map((u) => ({
      u,
      total: payments
        .filter((p) => p.userId === u.id && p.type === 'BOOK_PURCHASE' && p.status === 'SUCCESS')
        .reduce((s, p) => s + p.amount, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .filter((x) => x.total > 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">{t('admin.reports.title')}</h1>
        <div className="flex items-center gap-2">
          <button className="input flex w-64 items-center gap-2 text-left text-sm text-ink-faint">
            <Icon.Clock className="h-4 w-4" /> {t('admin.reports.dateRange')}
          </button>
          <button className="btn-outline !min-h-10 text-sm"><Icon.Download className="h-4 w-4" /> {t('admin.reports.exportCsv')}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['store', 'library'] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${tab === tb ? 'bg-ink text-canvas' : 'border border-divider bg-surface text-ink-soft hover:text-ink'}`}
          >
            {t(tb === 'store' ? 'admin.reports.tabStore' : 'admin.reports.tabLibrary')}
          </button>
        ))}
      </div>

      {tab === 'store' ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: t('admin.reports.bookRevenue'), value: '$12,830' },
              { label: t('admin.reports.orders'), value: '892' },
              { label: t('admin.reports.avgOrder'), value: '$14.38' },
              { label: t('admin.reports.topCategory'), value: t('admin.reports.catSelfHelp') },
            ].map((k) => (
              <div key={k.label} className="card p-4">
                <p className="text-lg font-bold text-ink">{k.value}</p>
                <p className="text-xs text-ink-soft">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.salesByMonth')}</h2>
              <BarChart />
            </div>
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.salesByCategory')}</h2>
              <Donut
                segments={[
                  { label: t('admin.reports.catSelfHelp'), value: 34, color: '#0F766E' },
                  { label: t('admin.reports.catTechnology'), value: 26, color: '#3E8E82' },
                  { label: t('admin.reports.catHistory'), value: 18, color: '#A87C3C' },
                  { label: t('admin.reports.catPoetry'), value: 12, color: '#C9A87C' },
                  { label: t('admin.reports.catOther'), value: 10, color: '#9E9082' },
                ]}
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.mostPurchased')}</h2>
              <div className="space-y-2.5">
                {topBooks.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="tnum w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
                    <div className="w-8 shrink-0 overflow-hidden rounded-[3px] shadow-book">
                      <Cover book={b} size="S" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{b.title}</p>
                      <p className="text-[10px] text-ink-faint">{b.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">{t('admin.reports.sales', { count: (b.popularity * 3.1).toFixed(0) })}</p>
                      <p className="text-[10px] text-ink-faint">{t('admin.reports.rev', { amount: ((b.price ?? 0) * b.popularity * 2.4).toFixed(0) })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.topSpenders')}</h2>
              <div className="space-y-2.5">
                {topUsers.map(({ u, total }, i) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary-dark">
                      {u.avatarInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{u.name}</p>
                      <p className="text-[10px] text-ink-faint">
                        {payments.filter((p) => p.userId === u.id && p.type === 'BOOK_PURCHASE' && p.status === 'SUCCESS').length} {t('admin.reports.orders')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-primary-dark">${total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: t('admin.reports.activeSubs'), value: '312' },
              { label: t('admin.reports.newSubs30'), value: '38' },
              { label: t('admin.reports.expired30'), value: '96' },
              { label: t('admin.reports.reads30'), value: '4,210' },
            ].map((k) => (
              <div key={k.label} className="card p-4">
                <p className="text-lg font-bold text-ink">{k.value}</p>
                <p className="text-xs text-ink-soft">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.subsVsCancel')}</h2>
              <BarChart />
            </div>
            <div className="card p-4">
              <h2 className="section-title mb-3">{t('admin.reports.activeVsExpired')}</h2>
              <Donut
                segments={[
                  { label: t('admin.reports.segActive'), value: 312, color: '#0F766E' },
                  { label: t('admin.reports.segExpired'), value: 96, color: '#B57A1F' },
                  { label: t('admin.reports.segCancelled'), value: 18, color: '#9E9082' },
                ]}
              />
            </div>
          </div>
          <div className="card p-4">              <h2 className="section-title mb-3">{t('admin.reports.mostRead')}</h2>
            <div className="space-y-2.5">
              {topBooks.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="tnum w-4 text-xs font-bold text-ink-faint">{i + 1}</span>
                  <div className="w-8 shrink-0 overflow-hidden rounded-[3px] shadow-book">
                    <Cover book={b} size="S" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold">{b.title}</p>
                  <span className="text-xs font-bold text-primary-dark">{t('admin.reports.reads', { count: (b.popularity * 5.7).toFixed(0) })}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
