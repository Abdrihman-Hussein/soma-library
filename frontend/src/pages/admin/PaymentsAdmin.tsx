import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { ConfirmModal, StatusPill } from '../../components/ui'

export default function PaymentsAdmin() {
  const { user, toast } = useApp()
  const [tick, setTick] = useState(0)
  const [typeFilter, setTypeFilter] = useState<'all' | 'SUBSCRIPTION' | 'BOOK_PURCHASE'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'REFUNDED'>('all')
  const actor = user?.name ?? 'Admin'
  const [confirmRefund, setConfirmRefund] = useState<{
    id: string
    ref: string
    amount: number
  } | null>(null)
  const refresh = () => setTick((t) => t + 1)

  const payments = db.allPayments()
  const rows = useMemo(() => {
    let list = [...payments]
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [payments, typeFilter, statusFilter, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const success = payments.filter((p) => p.status === 'SUCCESS')
  const volume = success.reduce((s, p) => s + p.amount, 0)
  const refunded = payments.filter((p) => p.status === 'REFUNDED')

  const onRefund = (id: string, ref: string, amount: number) => {
    setConfirmRefund({ id, ref, amount })
  }

  const confirmRefundPayment = () => {
    if (!confirmRefund) return

    db.refundPayment(confirmRefund.id, actor)
    toast(`${confirmRefund.ref} refunded`, 'success')
    setConfirmRefund(null)
    refresh()
  }

  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Payments</h1>
        <div className="flex gap-2">
          <select
            aria-label="Filter by type"
            className="input !min-h-9 w-40 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          >
            <option value="all">Type: All</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="BOOK_PURCHASE">Book purchase</option>
          </select>
          <select
            aria-label="Filter by status"
            className="input !min-h-9 w-40 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">Status: All</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Volume (all time)', value: `$${volume.toFixed(2)}` },
          { label: 'Successful', value: String(success.length) },
          { label: 'Failed', value: String(payments.filter((p) => p.status === 'FAILED').length) },
          { label: 'Refunded', value: String(refunded.length) },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <p className="text-lg font-bold">{k.value}</p>
            <p className="text-xs text-ink-soft">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            <thead>
              <tr className="border-b border-divider bg-canvas text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-semibold">Ref</th>
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 font-semibold">Amount</th>
                <th className="px-4 py-2.5 font-semibold">Method</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {rows.map((p) => {
                const u = db.getUser(p.userId)
                return (
                  <tr key={p.id} className="hover:bg-inset/40">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.reference}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold">{u?.name ?? p.userId}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-[3px] bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-dark">
                        {p.type === 'SUBSCRIPTION' ? 'Subscription' : 'Book'}
                      </span>
                    </td>
                    <td className="tnum px-4 py-2.5 font-bold">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-xs text-ink-soft">{p.method}</td>
                    <td className="px-4 py-2.5"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-2.5 text-xs text-ink-faint">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {p.status === 'SUCCESS' && (
                        <button
                          onClick={() => onRefund(p.id, p.reference, p.amount)}
                          className="rounded px-2 py-1 text-[11px] font-semibold text-status-danger transition-colors hover:bg-[#F7E2DC]"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-faint">No payments match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      <ConfirmModal
        open={confirmRefund !== null}
        title="Refund payment?"
        message={
          confirmRefund
            ? `Refund ${confirmRefund.ref} ($${confirmRefund.amount.toFixed(2)})? This will mark the payment as refunded.`
            : 'Refund this payment?'
        }
        confirmLabel="Refund"
        cancelLabel="Cancel"
        danger
        onConfirm={confirmRefundPayment}
        onCancel={() => setConfirmRefund(null)}
      />
    </>
  )
}
