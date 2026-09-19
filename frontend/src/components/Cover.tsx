import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Book, JacketMotif, JacketSpec } from '../types'
import { openLibraryCoverUrl } from '../data/covers'
import type { CoverSize } from '../data/covers'

// ── Geometric motifs screen-printed onto designed jackets ──────────

const motifs: Record<JacketMotif, ReactNode> = {
  arch: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      <path d="M6 132V58a22 22 0 0 1 44 0v74" />
      <path d="M46 132V30a22 22 0 0 1 44 0v102" />
      <path d="M86 132V58a22 22 0 0 1 44 0v74" />
    </g>
  ),
  wave: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M-16 ${14 + i * 20}q18,-13 36,0t36,0t36,0t36,0`} />
      ))}
    </g>
  ),
  rings: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      <circle cx="66" cy="66" r="12" />
      <circle cx="66" cy="66" r="28" />
      <circle cx="66" cy="66" r="44" />
      <circle cx="66" cy="66" r="60" />
    </g>
  ),
  star: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      <path d="M66 8 80 50h44l-36 26 14 44-36-27-36 27 14-44L8 50h44z" />
    </g>
  ),
  chevron: (
    <g stroke="currentColor" strokeWidth="3" fill="none">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M-16 ${16 + i * 22}l36,-20l36,20l36,-20l36,20`} />
      ))}
    </g>
  ),
  grid: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={`v${i}`} d={`M${8 + i * 20} -10v160`} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={`h${i}`} d={`M-10 ${8 + i * 20}h160`} />
      ))}
    </g>
  ),
  moon: (
    <g>
      <path d="M84 14a54 54 0 1 0 0 104 44 44 0 1 1 0-104z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.5" fill="none">
        <circle cx="66" cy="66" r="60" />
      </g>
    </g>
  ),
}

// ── Designed jacket (fallback + loading backdrop) ──────────────────

function Jacket({ book }: { book: Book }) {
  const { ground, ink, accent, motif } = book.cover.jacket
  const imprint = book.language === 'so' ? 'Maktabadda' : 'Somalibrary'

  return (
    <div className="jacket" style={{ background: ground, color: ink }} aria-hidden="true">
      <svg
        className="jacket-motif"
        viewBox="0 0 132 132"
        style={{ color: accent }}
        fill="none"
      >
        {motifs[motif]}
      </svg>
      <div className="jacket-sheen" />
      <div className="jacket-spine" />
      <div className="jacket-frame" style={{ color: accent }} />
      <div className="jacket-grain" />

      <div className="jacket-inner">
        <h3 className="jacket-title">{book.title}</h3>
        <div>
          <div className="jacket-rule" style={{ background: accent }} />
          <p className="jacket-author">{book.author}</p>
          {/* The imprint is type, so it takes the jacket ink rather than the
              decorative accent — on the lighter grounds the accent only
              reached ~3.5:1, below the 4.5:1 body-text minimum. It is set
              apart from the author by weight and tracking instead. */}
          <p className="jacket-imprint">{imprint}</p>
        </div>
      </div>
    </div>
  )
}

// ── Public component ───────────────────────────────────────────────

export function Cover({
  book,
  className = '',
  size = 'L',
  muted = false,
  priority = false,
}: {
  book: Book
  className?: string
  /** Open Library source resolution. `L` is fine for cards up to ~300px wide. */
  size?: CoverSize
  /** Greyscale + fade, for expired or locked access. */
  muted?: boolean
  /** Skip lazy loading for above-the-fold covers. */
  priority?: boolean
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const src = openLibraryCoverUrl(book.cover, size)
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`cover relative isolate overflow-hidden rounded-[3px] ${
        muted ? 'opacity-45 grayscale' : ''
      } ${className}`}
    >
      {/* Designed jacket always renders — it is the backdrop while the
          real artwork loads, and the permanent fallback if it never does. */}
      <Jacket book={book} />

      {showImage && (
        <img
          src={src as string}
          alt={`${book.title} — ${book.author}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Printed-edge shading that makes a flat image read as a book */}
      <div className="pointer-events-none absolute inset-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(28,20,10,0.14),inset_-14px_0_22px_-18px_rgba(0,0,0,0.5)]" />
    </div>
  )
}

// ── Admin preview ──────────────────────────────────────────────────
// Renders the designed jacket from raw form values, before the book
// record (and any real cover art) exists.

export function CoverPreview({
  title,
  author,
  language,
  preset,
  className = '',
}: {
  title: string
  author?: string
  language: 'so' | 'en'
  preset: JacketSpec
  className?: string
}) {
  const preview: Book = {
    id: 'preview',
    title: title.trim() || 'Untitled',
    author: author?.trim() || 'Unknown',
    categoryId: 'self-help',
    language,
    year: new Date().getFullYear(),
    description: '',
    cover: { jacket: preset },
    library: false,
    store: false,
    price: null,
    pages: 0,
    rating: 0,
    ratingCount: 0,
    popularity: 0,
    createdAt: '',
  }
  return <Cover book={preview} className={className} />
}
