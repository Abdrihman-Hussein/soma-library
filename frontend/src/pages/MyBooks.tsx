import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { Cover } from '../components/Cover'
import { PageHeader } from '../components/layouts'
import { Button, EmptyState, Icon } from '../components/ui'

export default function MyBooks() {
  const { t, lang } = useT()
  const { user, myBooks, daysLeft, isSubscribed } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'purchased' | 'subscription'>('purchased')

  const so = lang === 'so'
  const purchased = myBooks.filter((ub) => ub.access === 'PURCHASED')
  const subBooks = myBooks.filter((ub) => ub.access === 'SUBSCRIPTION')
  const shown = tab === 'purchased' ? purchased : subBooks

  const tabs = [
    { id: 'purchased' as const, label: t('myBooks.purchased'), count: purchased.length },
    { id: 'subscription' as const, label: t('myBooks.subscriptionTab'), count: subBooks.length },
  ]

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <PageHeader
          breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('myBooks.title') }]}
          title={t('myBooks.title')}
        />
        <div className="py-16">
          <EmptyState
            icon={<Icon.Book className="h-6 w-6" />}
            title={so ? 'Wali ma galin' : 'Not signed in'}
            text={
              so
                ? 'Gal akoonkaaga si aad u aragto buugaagta aad hayso.'
                : 'Sign in to see the books you own and rent.'
            }
            action={
              <Button onClick={() => navigate('/login')}>{t('common.login')}</Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('myBooks.title') }]}
        title={t('myBooks.title')}
        description={
          so
            ? 'Buugaagta aad iibsatay weligaa, iyo kuwa aad ku akhrinayso rukunka.'
            : 'The books you bought outright, and the ones you are reading on subscription.'
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-7 border-b border-divider pt-6">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`tab-underline ${tab === tb.id ? 'tab-underline-active' : ''}`}
          >
            {tb.label}
            <span className="tnum ml-2 text-xs font-medium text-ink-faint">{tb.count}</span>
          </button>
        ))}
      </div>

      {/* Subscription context */}
      {tab === 'subscription' && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-divider py-4">
          <Icon.Clock className={`h-4 w-4 shrink-0 ${isSubscribed ? 'text-primary' : 'text-status-warning'}`} />
          <p className="min-w-0 flex-1 text-sm text-ink-soft">
            {isSubscribed
              ? so
                ? `${daysLeft} maalmood ka hadhay rukunkaaga.`
                : `${daysLeft} days remaining on your plan.`
              : so
                ? 'Rukun firfiran ma lihid — buugaagtan lama akhriyi karo.'
                : 'You have no active plan — these books cannot be opened.'}
          </p>
          <Link to="/plans" className="text-xs font-semibold text-primary-dark hover:text-primary">
            {t('common.renew')} →
          </Link>
        </div>
      )}

      {/* Shelf */}
      <div className="py-10">
        {shown.length === 0 ? (
          <EmptyState
            icon={<Icon.Book className="h-6 w-6" />}
            title={tab === 'purchased' ? t('myBooks.emptyPurchased') : t('myBooks.emptySub')}
            text={
              tab === 'purchased'
                ? so
                  ? 'Buugaagta aad iibsato waxay halkan ku sii jiraan weligood.'
                  : 'Anything you buy outright stays on this shelf permanently.'
                : so
                  ? 'Buugaagta rukunka waa ku meel gaar — waxay halkan ku soo baxaan markaad akhrido.'
                  : 'Subscription titles are temporary and appear here as you read them.'
            }
            action={
              <Button onClick={() => navigate(tab === 'purchased' ? '/store' : '/library')}>
                {tab === 'purchased' ? t('nav.store') : t('nav.library')}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shown.map((ub) => {
              const book = getBook(ub.bookId)
              if (!book) return null

              const expired = ub.access === 'SUBSCRIPTION' && daysLeft === 0

              return (
                <Link key={ub.bookId} to={expired ? '/plans' : `/read/${book.id}`} className="group flex flex-col">
                  <div className="relative">
                    <div className="overflow-hidden rounded-[3px] shadow-book transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                      <Cover book={book} muted={expired} />
                    </div>

                    {expired && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-ink/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-canvas backdrop-blur-sm">
                        {t('myBooks.expired')}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 font-display text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-primary">
                    {book.title}
                  </p>

                  {ub.access === 'PURCHASED' ? (
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      {t('myBooks.purchasedOn', {
                        date: new Date(ub.acquiredAt).toLocaleDateString(so ? 'so-SO' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }),
                      })}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-status-warning">
                      {t('myBooks.daysLeft', { days: daysLeft })}
                    </p>
                  )}

                  {ub.progressPct > 0 && !expired && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${ub.progressPct}%` }} />
                      </div>
                      <span className="tnum text-[10px] font-semibold text-ink-faint">{ub.progressPct}%</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
