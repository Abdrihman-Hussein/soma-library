import { useNavigate } from 'react-router-dom'
import type { Book } from '../types'
import { useT } from '../i18n'
import { categoryName } from '../data/db'
import { Cover } from './Cover'
import { Icon, Stars } from './ui'

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`
}

// ── Grid card (Library / Store / Home) ─────────────────────────────

export function BookGridCard({ book, onAdd }: { book: Book; onAdd?: (id: string) => void }) {
  const { lang } = useT()
  const navigate = useNavigate()

  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={() => navigate(`/book/${book.id}`)}
        className="text-left"
        aria-label={book.title}
      >
        <div className="relative">
          <div className="overflow-hidden rounded-[3px] shadow-book transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lift">
            <Cover book={book} />
          </div>

          {!book.library && (
            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/75 text-canvas backdrop-blur-sm">
              <Icon.Lock className="h-3 w-3" />
            </span>
          )}
          {book.library && !book.store && (
            <span className="absolute left-2 top-2 rounded-[2px] bg-surface/92 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary-dark">
              {lang === 'so' ? 'Maktabad' : 'Library'}
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 font-display text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-primary">
          {book.title}
        </h3>
      </button>

      <p className="mt-0.5 truncate text-xs text-ink-soft">{book.author}</p>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-divider pt-2.5">
        {book.store && book.price != null ? (
          <span className="tnum text-sm font-semibold text-ink">{formatPrice(book.price)}</span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            {lang === 'so' ? 'Kala bax' : 'Included'}
          </span>
        )}

        {onAdd && book.store && (
          <button
            type="button"
            onClick={() => onAdd(book.id)}
            aria-label={`Add ${book.title} to cart`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-divider text-ink-soft transition-colors hover:border-primary hover:bg-primary hover:text-white active:scale-90"
          >
            <Icon.Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  )
}

// ── Row card (search results, tables, lists) ───────────────────────

export function BookRowCard({ book }: { book: Book }) {
  const { lang } = useT()
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/book/${book.id}`)}
      className="group flex w-full items-center gap-4 border-b border-divider py-3.5 text-left transition-colors hover:bg-inset/40"
    >
      <div className="w-11 shrink-0 overflow-hidden rounded-[3px] shadow-book">
        <Cover book={book} size="M" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-primary">
          {book.title}
        </p>
        <p className="truncate text-xs text-ink-soft">
          {book.author} · {book.year}
        </p>
        <div className="mt-1 flex items-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-ink-faint">
            {categoryName(book.categoryId, lang)}
          </span>
          {book.store && book.price != null ? (
            <span className="tnum text-xs font-semibold text-ink">{formatPrice(book.price)}</span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-primary">
              {lang === 'so' ? 'Maktabad' : 'Library'}
            </span>
          )}
        </div>
      </div>

      <Icon.ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </button>
  )
}

// ── Continue-reading feature (Home) ────────────────────────────────

export function ContinueReadingCard({
  book,
  progressPct,
  lastPage,
}: {
  book: Book
  progressPct: number
  lastPage: number
}) {
  const { lang } = useT()
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/read/${book.id}`)}
      className="group flex w-full items-center gap-5 rounded-card border border-divider bg-surface p-4 text-left shadow-soft transition-all hover:border-primary/35 hover:shadow-card sm:p-5"
    >
      <div className="w-16 shrink-0 overflow-hidden rounded-[3px] shadow-book transition-transform duration-300 group-hover:-translate-y-1 sm:w-20">
        <Cover book={book} size="M" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent-dark">
          {lang === 'so' ? 'Sii wad' : 'Continue'}
        </p>
        <p className="mt-1 truncate font-display text-base font-semibold tracking-tight text-ink">
          {book.title}
        </p>
        <p className="truncate text-xs text-ink-soft">
          {book.author} · {lang === 'so' ? 'Bogga' : 'Page'} {lastPage}
        </p>

        <div className="mt-2.5 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="tnum text-[11px] font-semibold text-ink-soft">
            {Math.round(progressPct)}%
          </span>
        </div>
      </div>

      <div className="hidden shrink-0 sm:block">
        <Stars rating={book.rating} />
      </div>
    </button>
  )
}
