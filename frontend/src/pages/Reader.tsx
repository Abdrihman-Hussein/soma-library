import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { Icon, LanguageSwitch } from '../components/ui'

// Mock PDF page content — replaced by the secure backend PDF stream in Phase 6
const SAMPLE_PARAGRAPHS = [
  'Wax yar oo maalin kasta waa mid ka fiican wax badan oo mar dambe ah. Xirfadaha waa midab nolosha.',
  'Habka 1: Bilow wax yar. Haddii aad wax walba si ballaadhan u qaadato, waxaad ku guuleysan doontaa si fudud.',
  'Small habits do not seem to make a difference in the moment, yet they compound into remarkable results over months and years.',
  'You do not rise to the level of your goals; you fall to the level of your systems. Build better systems daily.',
  'Waxaad noqotaa waxa aad si joogto ah u sameyso. Sidaa darteed, doorsoomayaasha yaryar ayaa muhiim ah.',
]

const FONT_STEPS = [
  { label: 'S', size: '1rem', leading: '1.85' },
  { label: 'M', size: '1.0625rem', leading: '1.85' },
  { label: 'L', size: '1.1875rem', leading: '1.8' },
]

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useT()
  const { user, canRead, isSubscribed, progressFor, saveProgress } = useApp()
  const book = getBook(id ?? '')

  const pages = useMemo(() => (book ? Math.min(book.pages, 352) : 0), [book])
  const saved = book ? progressFor(book.id) : undefined
  const [page, setPageState] = useState(() => {
    if (saved && saved.lastPage > 1 && saved.lastPage <= pages) return saved.lastPage
    return 1
  })
  const [font, setFont] = useState(1)
  const [bookmarked, setBookmarked] = useState(false)

  const setPage = (next: number | ((p: number) => number)) => {
    setPageState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      return value
    })
  }

  // Persist reading position (debounced by effect below)
  useEffect(() => {
    if (!book || !user) return
    const timer = window.setTimeout(() => {
      saveProgress(book.id, page, pages)
    }, 600)
    return () => window.clearTimeout(timer)
  }, [book, user, page, pages, saveProgress])

  const so = lang === 'so'
  const step = FONT_STEPS[font]

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink-soft">404</div>
    )
  }

  // Access check (mock of the backend authorization in Phase 6)
  if (!canRead(book.id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-status-warning bg-[#F6EAD3] text-[#85561A]">
          <Icon.Lock className="h-6 w-6" />
        </span>
        <h1 className="display-title mt-2">
          {so ? 'Gelitaan la xaday' : 'Access restricted'}
        </h1>
        <p className="lede max-w-sm">
          {so
            ? 'Waxaad u baahan tahay rukun firfiran ama iibsasho si aad u akhrido buuggan.'
            : 'You need an active subscription or a purchase to read this book.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">
            {t('common.back')}
          </button>
          <button type="button" onClick={() => navigate('/plans')} className="btn-primary">
            {so ? 'Dooro qorshe' : 'Choose a plan'}
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

  const pct = Math.round((page / pages) * 100)
  const chapter = page % 4 === 1 ? (so ? 'Habka 1: Wax yar oo maalin kasta' : 'Chapter 1: Small Habits, Big Results') : so ? 'Habka 2: Nidaamka' : 'Chapter 2: The System'

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF7EF]">
      {/* Reading chrome */}
      <header className="sticky top-0 z-30 border-b border-divider bg-[#FBF7EF]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => navigate(`/book/${book.id}`)}
            aria-label={t('common.back')}
            className="flex h-9 w-9 items-center justify-center rounded-btn text-ink-soft transition-colors hover:bg-inset hover:text-ink"
          >
            <Icon.ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            {/* The reader is immersive and has no page heading otherwise, so the
                running title doubles as the h1 for the document outline. */}
            <h1 className="truncate font-display text-sm font-semibold tracking-tight text-ink">
              {book.title}
            </h1>
            <p className="tnum truncate text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {t('reader.page')} {page} {t('reader.of')} {pages}
            </p>
          </div>

          {/* Font size */}
          <div className="hidden items-center rounded-btn border border-divider bg-surface p-0.5 sm:flex">
            {FONT_STEPS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setFont(i)}
                aria-pressed={font === i}
                className={`h-7 w-7 rounded-[4px] text-[11px] font-bold transition-colors ${
                  font === i ? 'bg-ink text-canvas' : 'text-ink-faint hover:text-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setBookmarked((b) => !b)}
            aria-pressed={bookmarked}
            aria-label={so ? 'Calaamadee' : 'Bookmark'}
            className={`flex h-9 w-9 items-center justify-center rounded-btn transition-colors ${
              bookmarked ? 'text-primary' : 'text-ink-faint hover:text-ink'
            }`}
          >
            <Icon.Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-inset">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 px-5 py-12 md:py-16">
        <article className="mx-auto max-w-[38rem] font-display text-ink">
          <p className="eyebrow-plain mb-6">{chapter}</p>

          <p
            className="drop-cap text-pretty"
            style={{ fontSize: step.size, lineHeight: step.leading }}
          >
            {SAMPLE_PARAGRAPHS[0]}
          </p>

          {SAMPLE_PARAGRAPHS.slice(1).map((p, i) => (
            <p
              key={i}
              className="mt-6 text-pretty"
              style={{ fontSize: step.size, lineHeight: step.leading }}
            >
              {p}
            </p>
          ))}

          {/* Per-user watermark (anti-piracy) */}
          <p className="mt-14 border-t border-divider pt-5 text-center text-[9px] uppercase tracking-[0.16em] text-ink-faint/70">
            © SomaLibrary · {user?.email ?? 'guest@example.com'} · {new Date().getFullYear()}
          </p>
        </article>

        {/* Page controls */}
        <div className="mx-auto mt-12 flex max-w-[38rem] items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-outline !px-4 disabled:opacity-40"
          >
            <Icon.ArrowLeft className="h-4 w-4" />
            {so ? 'Hore' : 'Previous'}
          </button>

          <span className="tnum text-xs font-semibold text-ink-faint">{pct}%</span>

          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="btn-outline !px-4 disabled:opacity-40"
          >
            {so ? 'Xiga' : 'Next'}
            <Icon.ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Footer controls */}
      <footer className="sticky bottom-0 border-t border-divider bg-[#FBF7EF]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <span className="tnum shrink-0 text-[11px] font-semibold text-ink-soft">
            {page} / {pages}
          </span>
          <input
            type="range"
            min={1}
            max={pages}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            aria-label={t('reader.page')}
            className="h-1 flex-1 cursor-pointer accent-primary"
          />
          <div className="hidden sm:block">
            <LanguageSwitch compact />
          </div>
        </div>
      </footer>
    </div>
  )
}
