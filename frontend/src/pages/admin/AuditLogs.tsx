import { useMemo, useState } from 'react'
import * as db from '../../data/db'
import { Icon } from '../../components/ui'

const actionStyle: Record<string, string> = {
  CREATE: 'bg-[#E4EFE5] text-[#2B5C3D]',
  UPDATE: 'bg-[#F6EAD3] text-[#85561A]',
  DELETE: 'bg-[#F7E2DC] text-[#8A3225]',
  LOGIN: 'bg-inset text-ink-soft',
  SUSPEND: 'bg-[#F7E2DC] text-[#8A3225]',
  REFUND: 'bg-primary-light text-primary-dark',
}

export default function AuditLogs() {
  const [tick] = useState(0)
  const [action, setAction] = useState('all')
  const [q, setQ] = useState('')

  const logs = db.allAudit()
  const filtered = useMemo(() => {
    let list = [...logs]
    if (action !== 'all') list = list.filter((l) => l.action === action)
    if (q.trim()) {
      const query = q.toLowerCase()
      list = list.filter((l) => l.entity.toLowerCase().includes(query) || l.details.toLowerCase().includes(query) || l.actor.toLowerCase().includes(query))
    }
    return list
  }, [logs, action, q, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Audit Logs ({logs.length})</h1>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Icon.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entity, details, actor..." className="input pl-9" />
        </div>
        <select
          aria-label="Filter by action"
          className="input w-44"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="all">Action: All</option>
          {Object.keys(actionStyle).map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-divider bg-canvas text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                <th className="px-4 py-2.5 font-semibold">Actor</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="px-4 py-2.5 font-semibold">Entity</th>
                <th className="px-4 py-2.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.map((l) => (
                <tr key={l.id} className={`hover:bg-inset/40 ${l.action === 'DELETE' ? 'bg-[#F7E2DC]/40' : ''}`}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-ink-soft">
                    {new Date(l.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold">{l.actor}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-[3px] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${actionStyle[l.action]}`}>{l.action}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium">{l.entity}</td>
                  <td className="px-4 py-2.5 text-xs text-ink-soft">{l.details}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-faint">No events match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-4 py-2.5 text-xs text-ink-faint">
          Showing {filtered.length} of {logs.length} events
        </div>
      </div>
    </div>
  )
}
