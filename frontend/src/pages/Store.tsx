import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allBooks, allCategories } from '../data/db'
import { BookGridCard } from '../components/BookCard'
import { PageHeader } from '../components/layouts'
import { Icon, SectionHeader } from '../components/ui'
import type { Book } from '../types'

export default function Store() {
  const { t, lang } = useT()
  const { addToCart, toast, cartCount } = useApp()
  const [filter, setFilter] = useState('all')

  const so = lang === 'so'
  const storeBooks = allBooks().filter((b) => b.store && b.price != null && b.status === 'PUBLISHED')
  const categories = allCategories()

  const filtered: Book[] =
    filter === 'all'
      ? storeBooks
      : filter === 'new'
        ? [...storeBooks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : filter === 'popular'
          ? [...storeBooks].sort((a, b) => b.popularity - a.popularity)
          : filter === 'low'
            ? [...storeBooks].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
            : storeBooks.filter((b) => b.categoryId === filter)

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'new', label: t('common.new') },
    { id: 'popular', label: t('common.popular') },
    { id: 'low', label: so ? 'Qiimo hoose' : 'Lowest price' },
    ...categories.slice(0, 3).map((c) => ({ id: c.id, label: so ? c.nameSo : c.nameEn })),
  ]

  const onAdd = (id: string) => {
    addToCart(id)
    toast(so ? 'Waxaa lagu daray gaadhiga' : 'Added to cart', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('store.title') }]}
        eyebrow={so ? 'Iibsasho keliya' : 'One-time purchase'}
        title={t('store.title')}
        description={
          so
            ? 'Bixi hal mar oo buuggaagu wuxuu ku sii jiraa Buugaagtayda weligiis — PDF, gaadhi la\u2019aan.'
            : 'Pay once and the book stays in My Books forever — PDF, with no shipping and no returns.'
        }
        actions={
          <span className="flex items-center gap-2 text-sm text-ink-soft">
            <Icon.Cart className="h-4 w-4" />
            <span className="tnum font-semibold text-ink">{cartCount}</span>
            {so ? 'gaadhiga' : 'in cart'}
          </span>
        }
      />

      {/* Purchase terms — the three facts that matter, stated plainly */}
      <div className="grid gap-px overflow-hidden border-b border-divider bg-divider sm:grid-cols-3">
        {[
          {
            icon: Icon.Download,
            title: so ? 'Degdeg' : 'Instant',
            text: so ? 'PDF-ka ayaa isla markiiba la heli karaa.' : 'Your PDF is available immediately.',
          },
          {
            icon: Icon.Shield,
            title: so ? 'Weligaa' : 'Permanent',
            text: so ? 'Gelitaan shaqsi ah oo aan dhicin.' : 'Personal access that never expires.',
          },
          {
            icon: Icon.Info,
            title: so ? 'Gaadhi la\u2019aan' : 'No shipping',
            text: so ? 'Wax badeecad jireed ah ma jiro.' : 'There is no physical item.',
          },
        ].map(({ icon: I, title, text }) => (
          <div key={title} className="flex items-start gap-3 bg-canvas px-1 py-5 sm:px-5">
            <I className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 py-6">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`chip ${filter === f.id ? 'chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto hidden text-xs text-ink-faint md:block">
          {filtered.length} {so ? 'buugaag' : 'books'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((b) => (
          <BookGridCard key={b.id} book={b} onAdd={onAdd} />
        ))}
      </div>

      {/* Cross-sell to the subscription */}
      <section className="pb-6 pt-14">
        <SectionHeader
          eyebrow={so ? 'Bedelka kale' : 'The alternative'}
          title={so ? 'Akhri dhammaan $3 bishiiba' : 'Read everything for $3 a month'}
        />
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-divider bg-surface p-6 md:p-8">
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">
            {so
              ? 'Haddii aad wax ka badan saddex buug bishiiba akhrido, rukunka ayaa ka jaban. Buugaagtii hore oo aad iibsatay waxay sii ahaanayaan kuwaaga.'
              : 'If you read more than two or three books a month, a subscription works out cheaper. Anything you already bought stays yours.'}
          </p>
          <Link to="/plans" className="btn-ink shrink-0">
            {so ? 'Eeg rukumka' : 'See the plans'}
            <Icon.ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
