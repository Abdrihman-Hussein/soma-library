import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useT } from '../i18n'
import { allBooks, allCategories, categoryName } from '../data/db'
import { BookRowCard } from '../components/BookCard'
import { EmptyState, Icon } from '../components/ui'

export default function Search() {
  const { t, lang } = useT()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [sort, setSort] = useState<'popular' | 'new' | 'title'>('popular')
  const [category, setCategory] = useState<string>('all')

  const so = lang === 'so'

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = allBooks().filter((b) => b.status === 'PUBLISHED')

    if (category !== 'all') list = list.filter((b) => b.categoryId === category)

    if (query) {
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          categoryName(b.categoryId, lang).toLowerCase().includes(query) ||
          String(b.year).includes(query),
      )
    }

    if (sort === 'popular') list = [...list].sort((a, b) => b.popularity - a.popularity)
    if (sort === 'new') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [q, sort, category, lang])

  const sorts = [
    { id: 'popular' as const, label: t('common.popular') },
    { id: 'new' as const, label: t('common.new') },
    { id: 'title' as const, label: 'A–Z' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      {/* Every other page orients you with a breadcrumb; search should too. */}
      <nav aria-label={t('common.breadcrumb')} className="mb-6 flex items-center gap-2 text-[11px] text-ink-faint">
        <Link to="/" className="uppercase tracking-[0.12em] transition-colors hover:text-primary">
          {t('nav.home')}
        </Link>
        <span className="text-divider">/</span>
        <span className="uppercase tracking-[0.12em] text-ink-soft">{t('search.title')}</span>
      </nav>
      <h1 className="sr-only">{t('search.title')}</h1>

      {/* Query */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        role="search"
        className="relative"
      >
        <Icon.Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          aria-label={t('common.search')}
          className="input !min-h-14 !rounded-card pl-12 pr-12 !text-base"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label={t('common.close')}
            className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-inset hover:text-ink"
          >
            <Icon.X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Controls */}
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="eyebrow-plain">{t('search.sort')}</span>
          {sorts.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={`chip ${sort === s.id ? 'chip-active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="eyebrow-plain">{t('common.category')}</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={t('common.category')}
            className="input !min-h-9 !w-auto !rounded-full !py-1 text-xs"
          >
            <option value="all">{t('common.all')}</option>
            {allCategories().map((c) => (
              <option key={c.id} value={c.id}>
                {so ? c.nameSo : c.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result meta */}
      <div className="mt-6 flex items-baseline justify-between border-b border-divider pb-3">
        <p className="text-sm text-ink-soft">
          {q.trim()
            ? t('search.resultsFor', { count: results.length, q: q.trim() })
            : `${results.length} ${so ? 'cinwaano oo dhan' : 'titles in the catalogue'}`}
        </p>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="pt-14">
          <EmptyState
            icon={<Icon.Search className="h-6 w-6" />}
            title={t('search.noResults')}
            text={
              so
                ? 'Isku day kelmad kale, ama baadh qaybaha maktabadda.'
                : 'Try a different keyword, or browse the catalogue by subject.'
            }
          />
        </div>
      ) : (
        <div className="mt-1">
          {results.map((b) => (
            <BookRowCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  )
}
