import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Icon, StatusPill } from '../../components/ui'

export default function ManageSubscriptions() {
  const { user, toast } = useApp()
  const [tick, setTick] = useState(0)
  void tick
  const actor = user?.name ?? 'Admin'
  const refresh = () => setTick((t) => t + 1)

  const plans = db.allPlans()
  const subs = db.allSubscriptions()
  const now = new Date().toISOString().slice(0, 10)

  const active = subs.filter((s) => s.status === 'ACTIVE' && s.expiresAt >= now).length
  const expiringSoon = subs.filter((s) => {
    if (s.status !== 'ACTIVE') return false
    const days = (new Date(s.expiresAt + 'T23:59:59').getTime() - Date.now()) / 86_400_000
    return days >= 0 && days <= 7
  }).length
  const expired = subs.filter((s) => s.expiresAt < now).length

  const [priceDraft, setPriceDraft] = useState<Record<string, string>>(
    Object.fromEntries(plans.map((p) => [p.id, p.price.toFixed(2)])),
  )

  const savePrice = (planId: string) => {
    const value = parseFloat(priceDraft[planId])
    if (Number.isNaN(value) || value < 0) {
      toast('Enter a valid price', 'error')
      return
    }
    const plan = db.getPlan(planId)!
    if (value === plan.price) return
    db.updatePlan(planId, { price: value }, actor)
    toast(`${plan.name} price updated to $${value.toFixed(2)}`, 'success')
    refresh()
  }

  const usersFor = (userId: string) => db.getUser(userId)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-ink">Subscriptions</h1>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: active, tone: 'text-status-success' },
          { label: 'Expiring in 7 days', value: expiringSoon, tone: 'text-status-warning' },
          { label: 'Expired', value: expired, tone: 'text-status-danger' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className={`text-xl font-bold ${s.tone}`}>{s.value}</p>
            <p className="text-xs text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid gap-3 md:grid-cols-4">
        {plans.map((p) => (
          <div key={p.id} className={`card relative p-4 ${p.popular ? 'border-primary' : ''}`}>
            {p.popular && (
              <span className="absolute -top-2.5 right-3 rounded-[3px] bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink">Most popular</span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-lg font-bold text-primary-dark">${p.price.toFixed(2)}</p>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <label className="label" htmlFor={`price-${p.id}`}>Price (USD)</label>
                <input
                  id={`price-${p.id}`}
                  className="input !min-h-9 text-sm"
                  value={priceDraft[p.id] ?? ''}
                  onChange={(e) => setPriceDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  onBlur={() => savePrice(p.id)}
                  inputMode="decimal"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink-soft">
                <p>Duration: <span className="font-semibold text-ink">{p.durationDays} days</span></p>
                <p>Limit: <span className="font-semibold text-ink">{p.bookLimit == null ? 'Unlimited' : p.bookLimit}</span></p>
              </div>
              <button
                className="text-xs font-semibold text-primary"
                onClick={() => savePrice(p.id)}
              >
                Save price
              </button>
            </div>
          </div>
        ))}
        <div className="card flex min-h-40 flex-col items-center justify-center gap-1 border-dashed p-4 text-center text-ink-faint">
          <Icon.Plus className="h-5 w-5" />
          <span className="text-xs font-semibold">New plans arrive with the payment API</span>
        </div>
      </div>

      {/* Recent subscriptions table */}
      <div className="card overflow-hidden">
        <div className="border-b border-divider px-4 py-3">
          <h2 className="section-title">All Subscriptions ({subs.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b border-divider bg-canvas text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 font-semibold">Plan</th>
                <th className="px-4 py-2.5 font-semibold">Started</th>
                <th className="px-4 py-2.5 font-semibold">Expires</th>
                <th className="px-4 py-2.5 font-semibold">Ref</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {subs
                .slice()
                .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
                .map((s) => {
                  const u = usersFor(s.userId)
                  return (
                    <tr key={s.id} className="hover:bg-inset/40">
                      <td className="px-4 py-2.5">
                        <p className="font-semibold">{u?.name ?? s.userId}</p>
                        <p className="text-[11px] text-ink-faint">{u?.email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-[3px] bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-dark">
                          {db.getPlan(s.planId)?.name ?? s.planId}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs">{s.startedAt}</td>
                      <td className="px-4 py-2.5 text-xs">{s.expiresAt}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">{s.paymentRef}</td>
                      <td className="px-4 py-2.5"><StatusPill status={s.status} /></td>
                    </tr>
                  )
                })}
              {subs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-faint">No subscriptions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
