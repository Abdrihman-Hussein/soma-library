import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Icon, StatusPill } from '../../components/ui'
import { useT } from '../../i18n'

export default function ManageUsers() {
  const { user: me, toast } = useApp()
  const { t } = useT()
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'reader' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const actor = me?.name ?? 'Admin'
  const refresh = () => setTick((t) => t + 1)

  const users = db.allUsers()
  const filtered = useMemo(() => {
    let list = [...users]
    if (roleFilter !== 'all') list = list.filter((u) => u.role === roleFilter)
    if (statusFilter !== 'all') list = list.filter((u) => u.status === statusFilter)
    if (q.trim()) {
      const query = q.toLowerCase()
      list = list.filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.phone.includes(query))
    }
    return list
  }, [users, q, roleFilter, statusFilter, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = users.find((u) => u.id === selectedId)
  const selectedSub = selected ? db.latestSubscription(selected.id) : undefined
  const selectedPayments = selected
    ? db.allPayments().filter((p) => p.userId === selected.id).slice(0, 4)
    : []

  const setStatus = (userId: string, status: 'active' | 'suspended') => {
    const target = db.getUser(userId)
    if (!target) return
    if (target.id === me?.id) {
      toast(t('admin.users.suspendOwn'), 'error')
      return
    }
    if (status === 'suspended' && !window.confirm(t('admin.users.confirmSuspend', { name: target.name }))) return
    db.setUserStatus(userId, status, actor)
    toast(t(status === 'active' ? 'admin.users.reinstated' : 'admin.users.suspendedToast', { name: target.name }), 'success')
    refresh()
  }

  const setRole = (userId: string, role: 'reader' | 'admin') => {
    const target = db.getUser(userId)
    if (!target || target.id === me?.id) return
    db.setUserRole(userId, role, actor)
    toast(t('admin.users.roleSet', { name: target.name, role: t(role === 'reader' ? 'admin.users.reader' : 'admin.users.admin') }), 'success')
    refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">{t('admin.users.title', { count: users.length })}</h1>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Icon.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.users.searchPh')} className="input pl-9" />
        </div>
        <select aria-label={t('admin.users.filterRole')} className="input w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
          <option value="all">{t('admin.users.roleAll')}</option>
          <option value="reader">{t('admin.users.reader')}</option>
          <option value="admin">{t('admin.users.admin')}</option>
        </select>
        <select aria-label={t('admin.users.filterStatus')} className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">{t('admin.users.statusAll')}</option>
          <option value="active">{t('admin.users.active')}</option>
          <option value="suspended">{t('admin.users.suspended')}</option>
        </select>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        <span className="chip !cursor-default">{t('admin.users.chipActive', { count: users.filter((u) => u.status === 'active').length })}</span>
        <span className="chip !cursor-default">{t('admin.users.chipSuspended', { count: users.filter((u) => u.status === 'suspended').length })}</span>
        <span className="chip !cursor-default">{t('admin.users.chipWithSub', { count: users.filter((u) => db.activeSubscription(u.id)).length })}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Table */}
        <div className="card overflow-hidden xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-divider bg-canvas text-left text-[11px] uppercase tracking-wide text-ink-faint">
                  <th className="px-3 py-2.5 font-semibold">{t('admin.users.user')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('admin.users.phone')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('admin.users.subscription')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('admin.users.purchases')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('admin.users.status')}</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filtered.map((u) => {
                  const sub = db.latestSubscription(u.id)
                  const purchases = db.allPayments().filter((p) => p.userId === u.id && p.type === 'BOOK_PURCHASE' && p.status === 'SUCCESS')
                  const total = purchases.reduce((s, p) => s + p.amount, 0)
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className={`cursor-pointer hover:bg-canvas/60 ${selectedId === u.id ? 'bg-primary-light/40' : ''}`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary-dark">
                            {u.avatarInitials}
                          </span>
                          <div>
                            <p className="font-semibold">
                              {u.name}
                              {u.id === me?.id && <span className="ml-1.5 text-[10px] font-normal text-primary">{t('admin.users.you')}</span>}
                            </p>
                            <p className="text-[11px] text-ink-faint">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-ink-soft">{u.phone}</td>
                      <td className="px-3 py-2.5">
                        {sub ? (
                          <div>
                            <StatusPill status={sub.status} />
                            <p className="mt-0.5 text-[10px] text-ink-faint">{t('admin.users.till', { date: sub.expiresAt })}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-faint">{t('admin.users.none')}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <span className="font-semibold">{purchases.length}</span>{' '}
                        <span className="text-ink-faint">(${total.toFixed(2)})</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`rounded-[3px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${u.status === 'active' ? 'bg-[#E4EFE5] text-[#2B5C3D]' : 'bg-[#F7E2DC] text-[#8A3225]'}`}>
                          {u.status === 'active' ? t('admin.users.active') : t('admin.users.suspended')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Icon.ChevronRight className="ml-auto h-4 w-4 text-ink-faint" />
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-ink-faint">{t('admin.users.noMatch')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail drawer */}
        <div className="card h-fit p-4 xl:sticky xl:top-8">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {selected.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{selected.name}</p>
                  <p className="truncate text-xs text-ink-faint">{selected.email}</p>
                </div>
              </div>

              <div>
                <p className="label">{t('admin.users.detailSub')}</p>
                <div className="rounded-btn bg-canvas p-3 text-xs">
                  {selectedSub ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink">{db.getPlan(selectedSub.planId)?.name ?? selectedSub.planId}</span>
                      <StatusPill status={selectedSub.status} />
                      <span className="text-ink-faint">{t('admin.users.till', { date: selectedSub.expiresAt })}</span>
                    </div>
                  ) : (
                    <span className="text-ink-faint">{t('admin.users.noPlan')}</span>
                  )}
                </div>
              </div>

              <div>
                <p className="label">{t('admin.users.recentPayments')}</p>
                <div className="space-y-1.5 text-xs">
                  {selectedPayments.length === 0 && <p className="text-ink-faint">{t('admin.users.none')}</p>}
                  {selectedPayments.map((p) => (
                    <div key={p.id} className="flex justify-between gap-2">
                      <span className="truncate text-ink-soft">{p.reference}</span>
                      <span className={`font-semibold ${p.status === 'SUCCESS' ? '' : 'text-status-danger'}`}>${p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  aria-label={t('admin.users.changeRole')}
                  className="input !min-h-9 flex-1 text-xs"
                  value={selected.role}
                  onChange={(e) => setRole(selected.id, e.target.value as 'reader' | 'admin')}
                  disabled={selected.id === me?.id}
                >
                  <option value="reader">{t('admin.users.reader')}</option>
                  <option value="admin">{t('admin.users.admin')}</option>
                </select>
                {selected.status === 'active' ? (
                  <button
                    onClick={() => setStatus(selected.id, 'suspended')}
                    disabled={selected.id === me?.id}
                    className="btn-danger !min-h-9 flex-1 text-xs disabled:opacity-40"
                  >
                    {t('admin.users.suspend')}
                  </button>
                ) : (
                  <button
                    onClick={() => setStatus(selected.id, 'active')}
                    className="btn-outline !min-h-9 flex-1 text-xs"
                  >
                    {t('admin.users.reinstate')}
                  </button>
                )}
              </div>
              {selected.id === me?.id && (
                <p className="text-center text-[10px] text-ink-faint">{t('admin.users.ownAccount')}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Icon.User className="h-8 w-8 text-ink-faint" />
              <p className="text-xs text-ink-soft">{t('admin.users.selectHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
