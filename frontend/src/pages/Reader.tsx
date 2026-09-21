import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { Icon, LanguageSwitch } from '../components/ui'
import { checkReaderFile, readerFileUrl, type ReaderFileStatus } from '../lib/api'

type ViewStatus = ReaderFileStatus | 'checking'

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useT()
  const { user, canRead, isSubscribed, progressFor, saveProgress } = useApp()
  const book = getBook(id ?? '')

  const pages = book ? Math.max(1, book.pages) : 1
  const saved = book ? progressFor(book.id) : undefined
  const [page, setPage] = useState(() =>
    saved && saved.lastPage > 1 && saved.lastPage <= pages ? saved.lastPage : 1,
  )
  const [slider, setSlider] = useState(page)
  const [status, setStatus] = useState<ViewStatus>('checking')

  const pdfPath = book?.pdfPath ?? ''

  // Reading position still persists, so Home's "continue reading" card and the
  // My Books progress bars keep working now that the reader shows a real PDF.
  useEffect(() => {
    if (!book || !user) return
    const timer = window.setTimeout(() => {
      saveProgress(book.id, page, pages)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [book, user, page, pages, saveProgress])

  useEffect(() => {
    setSlider(page)
  }, [page])

  // The embedded viewer cannot report why it failed, so probe the file first
  // and explain the failure instead of rendering an empty frame.
  useEffect(() => {
    if (!pdfPath) {
      setStatus('missing')
      return
    }
    let cancelled = false
    setStatus('checking')
    void checkReaderFile(pdfPath).then((next) => {
      if (!cancelled) setStatus(next)
    })
    return () => {
      cancelled = true
    }
  }, [pdfPath])

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-soft">
        {t('common.notFound')}
      </div>
    )
  }

  // Access check. The API enforces this server-side as well once the reader
  // token endpoint lands (#9/#10).
  if (!canRead(book.id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-status-warning bg-[#F6EAD3] text-[#85561A]">
          <Icon.Lock className="h-6 w-6" />
        </span>
        <h1 className="display-title mt-2">{t('reader.accessTitle')}</h1>
        <p className="lede max-w-sm">{t('reader.accessBody')}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            {t('common.back')}
          </button>
          <button type="button" onClick={() => navigate('/plans')} className="btn-primary">
            {t('reader.choosePlan')}
          </button>
        </div>
        {!isSubscribed && (
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            SML · {user?.email ?? 'guest'}
          </p>
        )}
      </div>
    )
  }

  const statusText: Record<ViewStatus, string> = {
    checking: t('reader.loading'),
    ready: '',
    locked: t('reader.locked'),
    missing: t('reader.missing'),
    offline: t('reader.offline'),
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF7EF]">
      <header className="sticky top-0 z-30 border-b border-divider bg-[#FBF7EF]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate(`/book/${book.id}`)}
            aria-label={t('common.back')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-inset hover:text-ink"
          >
            <Icon.ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-sm font-semibold tracking-tight text-ink">
              {book.title}
            </h1>
            <p className="truncate text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {book.author}
            </p>
          </div>

          {status === 'ready' && (
            <a
              href={readerFileUrl(pdfPath, page)}
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 text-xs font-semibold text-primary-dark hover:text-primary sm:block"
            >
              {t('reader.openNewTab')} ↗
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-5">
        {status === 'ready' ? (
          <iframe
            key={page}
            src={readerFileUrl(pdfPath, page)}
            title={book.title}
            className="h-[calc(100vh-9.5rem)] w-full rounded-card border border-divider bg-surface"
          />
        ) : (
          <div className="flex h-[calc(100vh-9.5rem)] flex-col items-center justify-center gap-3 rounded-card border border-divider bg-surface px-6 text-center">
            {status === 'checking' ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-divider border-t-primary" />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-status-warning bg-[#F6EAD3] text-[#85561A]">
                <Icon.Lock className="h-5 w-5" />
              </span>
            )}
            <p className="lede max-w-sm">{statusText[status]}</p>
            {status === 'offline' && (
              <code className="rounded-btn border border-divider bg-inset px-3 py-1.5 font-mono text-xs text-ink-soft">
                cd backend &amp;&amp; npm run dev
              </code>
            )}
            {status === 'locked' && (
              <button type="button" onClick={() => navigate('/login')} className="btn-primary mt-2">
                {t('common.login')}
              </button>
            )}
            {status === 'missing' && (
              <button
                type="button"
                onClick={() => navigate(`/book/${book.id}`)}
                className="btn-outline mt-2"
              >
                {t('common.back')}
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-divider bg-[#FBF7EF]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-outline !min-h-9 !px-3 text-xs disabled:opacity-40"
          >
            <Icon.ArrowLeft className="h-3.5 w-3.5" />
            {t('reader.previous')}
          </button>

          <span className="tnum shrink-0 text-[11px] font-semibold text-ink-soft">
            {page} {t('reader.of')} {pages}
          </span>

          <input
            type="range"
            min={1}
            max={pages}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            onPointerUp={() => setPage(slider)}
            onKeyUp={() => setPage(slider)}
            aria-label={t('reader.page')}
            className="h-1 flex-1 cursor-pointer accent-primary"
          />

          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="btn-outline !min-h-9 !px-3 text-xs disabled:opacity-40"
          >
            {t('reader.next')}
            <Icon.ChevronRight className="h-3.5 w-3.5" />
          </button>

          <div className="hidden sm:block">
            <LanguageSwitch compact />
          </div>
        </div>

        {/* Per-user watermark (anti-piracy) */}
        <p className="pb-2 text-center text-[9px] uppercase tracking-[0.16em] text-ink-faint/70">
          © SomaLibrary · {user?.email ?? 'guest@example.com'} · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
