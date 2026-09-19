import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Cover } from '../../components/Cover'
import { Icon, StatusPill } from '../../components/ui'

export default function ManageBooks() {
  const { toast, user } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'library' | 'store' | 'both' | 'draft'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tick, setTick] = useState(0)

  const actor = user?.name ?? 'Admin'
  const refresh = () => setTick((t) => t + 1)

  const books = db.allBooks()
  const filtered = useMemo(() => {
    let list = [...books]
    if (tab === 'library') list = list.filter((b) => b.library && !b.store)
    if (tab === 'store') list = list.filter((b) => b.store && !b.library)
    if (tab === 'both') list = list.filter((b) => b.library && b.store)
    if (tab === 'draft') list = list.filter((b) => b.status === 'DRAFT')
    if (q.trim()) {
      const query = q.toLowerCase()
      list = list.filter((b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query))
    }
    return list
  }, [books, q, tab, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const onDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    db.deleteBook(id, actor)
    toast('Book deleted', 'success')
    refresh()
  }

  const bulk = (status: db.BookStatus | 'DELETE') => {
    const ids = [...selected]
    if (status === 'DELETE') {
      if (!window.confirm(`Delete ${ids.length} book(s)? This cannot be undone.`)) return
      ids.forEach((id) => db.deleteBook(id, actor))
      toast(`${ids.length} book(s) deleted`, 'success')
    } else {
      db.setBookStatus(ids, status, actor)
      toast(`${ids.length} book(s) set to ${status.toLowerCase()}`, 'success')
    }
    setSelected(new Set())
    refresh()
  }

  const tabs = [
    { id: 'all', label: `All ${books.length}` },
    { id: 'library', label: `Library ${books.filter((b) => b.library).length}` },
    { id: 'store', label: `Store ${books.filter((b) => b.store).length}` },
    { id: 'both', label: `Both ${books.filter((b) => b.library && b.store).length}` },
    { id: 'draft', label: `Draft ${books.filter((b) => b.status === 'DRAFT').length}` },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">Books ({books.length})</h1>
        <Link to="/admin/books/new" className="btn-primary !min-h-10 text-sm">+ Add Book</Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Icon.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, author..." className="input pl-9" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={`chip ${tab === tb.id ? 'chip-active' : ''}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-sm">
            <thead>
              <tr className="border-b border-divider bg-canvas text-left text-[11px] uppercase tracking-wide text-ink-faint">
                <th className="w-10 px-3 py-2.5">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-2.5 font-semibold">Book</th>
                <th className="px-3 py-2.5 font-semibold">Category</th>
                <th className="px-3 py-2.5 font-semibold">Library</th>
                <th className="px-3 py-2.5 font-semibold">Store Price</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">PDF</th>
                <th className="px-3 py-2.5 font-semibold">Updated</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.map((b) => (
                <tr key={b.id} className={`hover:bg-inset/40 ${selected.has(b.id) ? 'bg-primary-light/40' : ''}`}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => toggle(b.id)}
                      aria-label={`Select ${b.title}`}
                      className="h-4 w-4 accent-[#0F766E]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 shrink-0 overflow-hidden rounded-[3px] shadow-book">
                        <Cover book={b} size="S" />
                      </div>
                      <div>
                        <p className="font-semibold">{b.title}</p>
                        <p className="text-[11px] text-ink-faint">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-soft">{db.categoryName(b.categoryId, 'en')}</td>
                  <td className="px-3 py-2.5">
                    {b.library
                      ? <span className="rounded-[3px] bg-[#E4EFE5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#2B5C3D]">Yes</span>
                      : <span className="rounded-[3px] bg-inset px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">No</span>}
                  </td>
                  <td className="px-3 py-2.5 font-bold text-primary-dark">{b.price != null ? `$${b.price.toFixed(2)}` : '—'}</td>
                  <td className="px-3 py-2.5"><StatusPill status={b.status} /></td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <Icon.FileText className="h-3.5 w-3.5" /> {b.pdfSize}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-faint">{b.updatedAt}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 text-ink-faint">
                      <button
                        onClick={() => navigate(`/admin/books/${b.id}`)}
                        className="rounded p-1.5 hover:bg-canvas hover:text-primary"
                        title="Edit"
                      >
                        <Icon.Pencil className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/book/${b.id}`}
                        className="rounded p-1.5 hover:bg-canvas hover:text-primary"
                        title="View"
                      >
                        <Icon.Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(b.id, b.title)}
                        className="rounded p-1.5 hover:bg-[#F7E2DC] hover:text-status-danger"
                        title="Delete"
                      >
                        <Icon.Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-sm text-ink-faint">
                    No books match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-4 py-2.5 text-xs text-ink-faint">
          Showing {filtered.length} of {books.length}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-btn bg-ink px-5 py-2.5 text-sm text-canvas shadow-lift">
          <span className="font-semibold">{selected.size} selected</span>
          <button onClick={() => bulk('PUBLISHED')} className="rounded-[4px] bg-canvas/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-canvas/20">Publish</button>
          <button onClick={() => bulk('ARCHIVED')} className="rounded-[4px] bg-canvas/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-canvas/20">Archive</button>
          <button onClick={() => bulk('DELETE')} className="rounded-[4px] bg-status-danger px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90">Delete</button>
          <button onClick={() => setSelected(new Set())} className="text-canvas/60 transition-colors hover:text-canvas" aria-label="Clear selection"><Icon.X className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  )
}
