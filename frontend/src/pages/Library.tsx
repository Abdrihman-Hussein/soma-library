import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allBooks, allCategories } from '../data/db'
import { BookGridCard } from '../components/BookCard'
import { PageHeader } from '../components/layouts'
import { Icon } from '../components/ui'
import type { Book } from '../types'

export default function Library() {
  const { t, lang } = useT()
  const { isSubscribed, daysLeft, subscription, addToCart, toast } = useApp()
  const [filter, setFilter] = useState<string>('all')

  const so = lang === 'so'
  const libBooks = allBooks().filter((b) => b.library && b.status === 'PUBLISHED')
  const categories = allCategories()

  const filtered: Book[] =
    filter === 'all'
      ? libBooks
      : filter === 'new'
        ? [...libBooks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : filter === 'popular'
          ? [...libBooks].sort((a, b) => b.popularity - a.popularity)
          : libBooks.filter((b) => b.categoryId === filter)

  const expires = subscription ? new Date(subscription.expiresAt) : null
  const expiresLabel = expires
    ? expires.toLocaleDateString(so ? 'so-SO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'new', label: t('common.new') },
    { id: 'popular', label: t('common.popular') },
    ...categories.slice(0, 4).map((c) => ({ id: c.id, label: so ? c.nameSo : c.nameEn })),
  ]

  const onAdd = (id: string) => {
    addToCart(id)
    toast(so ? 'Waxaa lagu daray gaadhiga' : 'Added to cart', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('library.title') }]}
        eyebrow={so ? 'Rukun bille ah' : 'Monthly subscription'}
        title={t('library.title')}
        description={
          so
            ? 'Dhammaan buugaagta lagu daray rukumka. Ku akhri sidaad rabto inta rukunkaagu firfiran yahay.'
            : 'Every title included with a subscription. Read as much as you like while your plan is active.'
        }
        actions={
          subscription ? (
            <Link to="/plans" className="btn-outline">
              {t('library.manage')}
            </Link>
          ) : (
            <Link to="/plans" className="btn-primary">
              {so ? 'Bilow $3/bil' : 'Join for $3/month'}
            </Link>
          )
        }
      />

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-divider py-4">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isSubscribed ? 'bg-primary-light text-primary' : 'bg-inset text-ink-faint'
          }`}
        >
          {isSubscribed ? <Icon.Shield className="h-4 w-4" /> : <Icon.Lock className="h-4 w-4" />}
        </span>

        <p className="min-w-0 flex-1 text-sm text-ink-soft">
          {isSubscribed
            ? t('library.activeUntil', { date: expiresLabel })
            : so
              ? `Kudar ${libBooks.length} oo cinwaan — rukun bille ah ayaa loo baahan yahay.`
              : `All ${libBooks.length} titles — a subscription is required to read.`}
        </p>

        {isSubscribed ? (
          <span className="flex shrink-0 items-center gap-3">
            {daysLeft <= 7 && (
              <span className="text-xs font-semibold text-status-warning">
                {so ? `${daysLeft} maalmood ka hadhay` : `${daysLeft} days left`}
              </span>
            )}
            <span className="rounded-[3px] bg-[#E4EFE5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2B5C3D]">
              {t('status.ACTIVE')}
            </span>
          </span>
        ) : (
          <span className="rounded-[3px] bg-inset px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
            {so ? 'Firfiran ma aha' : 'Not active'}
          </span>
        )}
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
          {filtered.length} {so ? 'cinwaano' : 'titles'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((b) => (
          <BookGridCard key={b.id} book={b} onAdd={onAdd} />
        ))}
      </div>
    </div>
  )
}
