import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as db from '../../data/db'
import { allCategories, createBook, getBook, jacketForBook, updateBook } from '../../data/db'
import { useApp } from '../../context/AppContext'
import { Button, Field, Icon, Toggle } from '../../components/ui'
import { apiUrl, authHeaders } from '../../lib/api'

// Uploads/reader URLs go through src/lib/api.ts so the base URL and reader
// token live in one place.

export default function AddEditBook() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, toast } = useApp()
  const editing = Boolean(id)
  const existing = id ? getBook(id) : undefined
  const actor = user?.name ?? 'Admin'

  const [title, setTitle] = useState(existing?.title ?? '')
  const [author, setAuthor] = useState(existing?.author ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? 'self-help')
  const [storeEnabled, setStoreEnabled] = useState(existing?.store ?? true)
  const [libraryEnabled, setLibraryEnabled] = useState(existing?.library ?? true)
  const [price, setPrice] = useState(existing?.price != null ? existing.price.toFixed(2) : '10.00')
  const [pdfPath, setPdfPath] = useState(existing?.pdfPath ?? '')
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [lang, setLang] = useState<'so' | 'en'>(existing?.language ?? 'en')
  const [year, setYear] = useState(existing ? String(existing.year) : String(new Date().getFullYear()))
  const [pages, setPages] = useState(existing ? String(existing.pages) : '200')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [status, setStatus] = useState<db.BookStatus>(existing?.status ?? 'PUBLISHED')

  useEffect(() => {
    if (id && !existing) {
      navigate('/admin/books', { replace: true })
    }
  }, [id, existing, navigate])

  const previewTitle = title || 'Untitled book'
  const previewAuthor = author || 'Unknown author'
  const preset = jacketForBook(existing?.id ?? previewTitle)

  const onSave = async (asDraft: boolean) => {
    if (!title.trim() || !author.trim()) {
      toast('Title and author are required', 'error')
      return
    }
    if (!selectedPdf && !pdfPath) {
      toast('Please select a PDF before saving this book.', 'error')
      return
    }

    let savedPdfPath = pdfPath
    if (selectedPdf) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('pdf', selectedPdf)
        const response = await fetch(apiUrl('/api/books/upload-pdf'), {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        })
        const payload = await response.json() as { pdfPath?: string; error?: string }
        if (!response.ok || !payload.pdfPath) throw new Error(payload.error ?? 'PDF upload failed.')
        savedPdfPath = payload.pdfPath
        setPdfPath(savedPdfPath)
      } catch (error) {
        toast(error instanceof Error ? error.message : 'PDF upload failed.', 'error')
        return
      } finally {
        setUploading(false)
      }
    }

    const parsedPrice = storeEnabled ? Math.max(0, parseFloat(price) || 0) : null
    const input = {
      title: title.trim(),
      author: author.trim(),
      categoryId,
      language: lang,
      year: Math.max(1400, parseInt(year, 10) || new Date().getFullYear()),
      pages: Math.max(1, parseInt(pages, 10) || 1),
      description: description.trim(),
      cover: existing?.cover ?? { jacket: preset },
      library: libraryEnabled,
      store: storeEnabled,
      price: parsedPrice,
      status: asDraft ? ('DRAFT' as db.BookStatus) : status,
      pdfPath: savedPdfPath,
    }
    if (editing && existing) {
      updateBook(existing.id, input, actor)
      toast('Book updated', 'success')
    } else {
      createBook(input, actor)
      toast('Book added to catalogue', 'success')
    }
    navigate('/admin/books')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            <Link to="/admin/books" className="hover:text-primary">Books</Link>
            <span className="text-divider">/</span>
            <span className="text-ink-soft">{editing ? 'Edit' : 'New'}</span>
          </nav>
          <h1 className="display-title mt-3">{editing ? 'Edit book' : 'Add book'}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Catalogue entry with availability in the Library, the Store, or both.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/books" className="btn-outline !min-h-10 text-[13px]">Cancel</Link>
          <Button className="!min-h-10 text-[13px]" onClick={() => void onSave(false)} disabled={uploading}>{uploading ? 'Uploading PDF...' : 'Save book'}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="space-y-5 lg:col-span-3">
          <section className="rounded-card border border-divider bg-surface p-6">
            <h2 className="section-title">Book info</h2>
            <div className="mt-5 space-y-4">
              <Field label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Atomic Habits" />
              <Field label="Author" required value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="James Clear" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="book-subject" className="label">Subject</label>
                  <select id="book-subject" className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    {allCategories().map((c) => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="book-language" className="label">Language</label>
                  <select id="book-language" className="input" value={lang} onChange={(e) => setLang(e.target.value as 'so' | 'en')}>
                    <option value="en">English</option>
                    <option value="so">Somali</option>
                  </select>
                </div>
                <Field label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2018" />
                <Field label="Pages" type="number" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="200" />
              </div>
            </div>
          </section>

          <section className="rounded-card border border-divider bg-surface p-6">
            <h2 className="section-title">Description</h2>
            <div className="mt-4">
              <textarea
                className="input min-h-28 resize-y"
                placeholder="Book description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-card border border-divider bg-surface p-6">
            <h2 className="section-title">Files</h2>

            <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-primary/35 bg-primary-light/25 p-7 text-center transition-colors hover:border-primary">
              <Icon.Download className="h-6 w-6 rotate-180 text-primary" />
              <span className="text-sm font-semibold text-ink">Drop a PDF here or browse</span>
              <span className="text-[11px] text-ink-faint">Max 50 MB · stored privately, never public</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  if (!file) return
                  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
                    setSelectedPdf(null)
                    e.target.value = ''
                    toast('Only PDF files are allowed.', 'error')
                    return
                  }
                  setSelectedPdf(file)
                }}
              />
            </label>

            {selectedPdf && (
              <div className="mt-3 flex items-center gap-3 rounded-btn bg-inset/60 px-4 py-3">
                <Icon.FileText className="h-4 w-4 text-primary" />
                <span className="flex-1 truncate text-xs font-medium text-ink">{selectedPdf.name}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-status-success">Selected</span>
              </div>
            )}
            {!selectedPdf && existing && pdfPath && (
              <p className="mt-3 text-[11px] text-ink-faint">
                Stored file: {existing.pdfPath}
              </p>
            )}
          </section>

          <section className="rounded-card border border-divider bg-surface p-6">
            <h2 className="section-title">Availability</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 rounded-btn border border-divider p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Library (subscription)</p>
                  <p className="text-[11px] text-ink-faint">Readable with an active subscription</p>
                </div>
                <Toggle on={libraryEnabled} onToggle={() => setLibraryEnabled((v) => !v)} label="Library" />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-btn border border-divider p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Store (purchase)</p>
                  <p className="text-[11px] text-ink-faint">Buy individually in USD</p>
                </div>
                <Toggle on={storeEnabled} onToggle={() => setStoreEnabled((v) => !v)} label="Store" />
              </div>

              {storeEnabled && (
                <div>
                  <label htmlFor="book-price" className="label">Store price (USD)</label>
                  <div className="relative">
                    <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-faint">$</span>
                    <input
                      id="book-price"
                      className="input pl-7"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                </div>
              )}
              {!libraryEnabled && !storeEnabled && (
                <p className="rounded-btn bg-[#F6EAD3] px-4 py-3 text-xs font-medium text-[#85561A]">
                  No availability set — the book will not appear anywhere for readers.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Preview / publishing */}
        <div className="lg:col-span-2">
          <div className="space-y-5 lg:sticky lg:top-8">
            <section className="rounded-card border border-divider bg-surface p-6">
              <h2 className="section-title">Preview</h2>
              <div className="mt-5">
                <p className="font-display text-base font-semibold leading-snug tracking-tight text-ink">{previewTitle}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{previewAuthor}</p>
                {storeEnabled && (
                  <p className="tnum mt-3 text-lg font-semibold text-primary-dark">${price || '0.00'}</p>
                )}
                <span className="mt-2 inline-flex rounded-[3px] bg-inset px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  {lang === 'so' ? 'Soomaali' : 'English'}
                </span>
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-divider pt-5">
                {[
                  { ok: Boolean(selectedPdf || pdfPath), label: selectedPdf ? 'PDF selected' : pdfPath ? 'PDF stored' : 'PDF pending' },
                  { ok: libraryEnabled || storeEnabled, label: libraryEnabled ? 'In Library' : storeEnabled ? 'Store only' : 'No availability' },
                  { ok: Boolean(title.trim() && author.trim()), label: title.trim() && author.trim() ? 'Info complete' : 'Title & author required' },
                ].map((row) => (
                  <li key={row.label} className="flex items-center gap-2.5 text-xs">
                    {row.ok ? (
                      <Icon.Check className="h-3.5 w-3.5 shrink-0 text-status-success" />
                    ) : (
                      <Icon.Alert className="h-3.5 w-3.5 shrink-0 text-status-warning" />
                    )}
                    <span className={row.ok ? 'text-ink-soft' : 'text-ink-faint'}>{row.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-card border border-divider bg-surface p-6">
              <h2 className="section-title">Publishing</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="book-status" className="label">Status</label>
                  <select id="book-status" className="input" value={status} onChange={(e) => setStatus(e.target.value as db.BookStatus)}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="space-y-2 border-t border-divider pt-4">
                  <Button full onClick={() => void onSave(false)} disabled={uploading}>{uploading ? 'Uploading PDF...' : 'Save book'}</Button>
                  <Button full variant="outline" onClick={() => void onSave(true)} disabled={uploading}>Save as draft</Button>
                  {editing && (
                    <Button
                      full
                      variant="danger"
                      onClick={() => {
                        if (existing && window.confirm(`Delete "${existing.title}"? This cannot be undone.`)) {
                          db.deleteBook(existing.id, actor)
                          toast('Book deleted', 'success')
                          navigate('/admin/books')
                        }
                      }}
                    >
                      Delete book
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
