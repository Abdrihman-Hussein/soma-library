import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Cover } from '../../components/Cover'
import { ConfirmModal, Icon, StatusPill } from '../../components/ui'
import { useT } from '../../i18n'

export default function ManageBooks() {
  const { toast, user } = useApp()
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<'all' | 'library' | 'store' | 'both' | 'draft'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [tick, setTick] = useState(0)

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'single' | 'bulk'
    id?: string
    title?: string
    count?: number
    ids?: string[]
  } | null>(null)

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
    setConfirmDelete({ type: 'single', id, title })
  }

  const bulk = (status: db.BookStatus | 'DELETE') => {
    const ids = [...selected]
    if (status === 'DELETE') {
      setConfirmDelete({
        type: 'bulk',
        count: ids.length,
        ids,
      })
      return
    } else {
      db.setBookStatus(ids, status, actor)
      toast(t('admin.books.setToStatus', { count: ids.length, status: status.toLowerCase() }), 'success')
    }
    setSelected(new Set())
    refresh()
  }

  const tabs = [
    { id: 'all', label: t('admin.books.tabAll', { count: books.length }) },
    { id: 'library', label: t('admin.books.tabLibrary', { count: books.filter((b) => b.library).length }) },
    { id: 'store', label: t('admin.books.tabStore', { count: books.filter((b) => b.store).length }) },
    { id: 'both', label: t('admin.books.tabBoth', { count: books.filter((b) => b.library && b.store).length }) },
    { id: 'draft', label: t('admin.books.tabDraft', { count: books.filter((b) => b.status === 'DRAFT').length }) },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink">{t('admin.books.title', { count: books.length })}</h1>
        <Link to="/admin/books/new" className="btn-primary !min-h-10 text-sm">{t('admin.books.addBook')}</Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Icon.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.books.searchPh')} className="input pl-9" />
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
                  <span className="sr-only">{t('admin.books.select')}</span>
                </th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.book')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.category')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.library')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.storePrice')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.status')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.pdf')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('admin.books.updated')}</th>
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
                      aria-label={t('admin.books.selectBook', { title: b.title })}
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
                  <td className="px-3 py-2.5 text-xs text-ink-soft">{db.categoryName(b.categoryId, lang)}</td>
                  <td className="px-3 py-2.5">
                    {b.library
                      ? <span className="rounded-[3px] bg-[#E4EFE5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#2B5C3D]">{t('admin.books.yes')}</span>
                      : <span className="rounded-[3px] bg-inset px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-faint">{t('admin.books.no')}</span>}
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
                        title={t('admin.books.edit')}
                      >
                        <Icon.Pencil className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/book/${b.id}`}
                        className="rounded p-1.5 hover:bg-canvas hover:text-primary"
                        title={t('admin.books.view')}
                      >
                        <Icon.Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(b.id, b.title)}
                        className="rounded p-1.5 hover:bg-[#F7E2DC] hover:text-status-danger"
                        title={t('admin.books.delete')}
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
                    {t('admin.books.noMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-divider px-4 py-2.5 text-xs text-ink-faint">
          {t('admin.books.showing', { shown: filtered.length, total: books.length })}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-btn bg-ink px-5 py-2.5 text-sm text-canvas shadow-lift">
          <span className="font-semibold">{t('admin.books.selected', { count: selected.size })}</span>
          <button onClick={() => bulk('PUBLISHED')} className="rounded-[4px] bg-canvas/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-canvas/20">{t('admin.books.publish')}</button>
          <button onClick={() => bulk('ARCHIVED')} className="rounded-[4px] bg-canvas/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-canvas/20">{t('admin.books.archive')}</button>
          <button onClick={() => bulk('DELETE')} className="rounded-[4px] bg-status-danger px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90">{t('admin.books.deleteBtn')}</button>
          <button onClick={() => setSelected(new Set())} className="text-canvas/60 transition-colors hover:text-canvas" aria-label={t('admin.books.clearSelection')}><Icon.X className="h-4 w-4" /></button>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title={
          confirmDelete?.type === 'bulk'
            ? 'Delete selected books?'
            : 'Delete book?'
        }
        message={
          confirmDelete?.type === 'bulk'
            ? `Delete ${confirmDelete.count ?? 0} book(s)? This cannot be undone.`
            : `Delete "${confirmDelete?.title ?? ''}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          if (!confirmDelete) return

          if (confirmDelete.type === 'single' && confirmDelete.id) {
            db.deleteBook(confirmDelete.id, actor)
            toast('Book deleted', 'success')
          }

          if (confirmDelete.type === 'bulk') {
            const ids = confirmDelete.ids ?? []

            ids.forEach((id) => {
              db.deleteBook(id, actor)
            })

            toast(`${ids.length} book(s) deleted`, 'success')
            setSelected(new Set())
          }

          setConfirmDelete(null)
          refresh()
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
