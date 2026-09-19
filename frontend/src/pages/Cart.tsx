import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { Cover } from '../components/Cover'
import { PageHeader } from '../components/layouts'
import { Button, EmptyState, Icon } from '../components/ui'

export default function Cart() {
  const { t, lang } = useT()
  const { cartItems, removeFromCart, cartCount } = useApp()
  const navigate = useNavigate()

  const so = lang === 'so'
  const items = cartItems.map((i) => ({ item: i, book: getBook(i.bookId)! })).filter((x) => x.book)
  const subtotal = items.reduce((sum, { book }) => sum + (book.store ? (book.price ?? 0) : 0), 0)

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <PageHeader
          breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('cart.title') }]}
          title={t('cart.title')}
        />
        <div className="py-16">
          <EmptyState
            icon={<Icon.Cart className="h-6 w-6" />}
            title={t('cart.empty')}
            text={
              so
                ? 'Weli wax ma aad ku darin gaadhiga. Ka baadh dukaanka buugaagta.'
                : 'You have not added anything yet. Browse the store to find something worth keeping.'
            }
            action={
              <div className="mt-2 flex gap-2">
                <Button onClick={() => navigate('/store')}>{t('cart.findBook')}</Button>
                <Link to="/library" className="btn-outline">
                  {t('nav.library')}
                </Link>
              </div>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <PageHeader
          breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('cart.title') }]}
          title={t('cart.title')}
          description={
            so
              ? `${cartCount} buug oo gaadhigaaga ku jira.`
              : `${cartCount} ${cartCount === 1 ? 'book' : 'books'} in your basket.`
          }
        />

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_350px] lg:gap-14">
          {/* Line items */}
          <div>
            <div className="border-t border-divider">
              {items.map(({ book }) => (
                <div key={book.id} className="flex items-center gap-4 border-b border-divider py-5 sm:gap-5">
                  <Link
                    to={`/book/${book.id}`}
                    className="w-14 shrink-0 overflow-hidden rounded-[3px] shadow-book transition-transform hover:-translate-y-1 sm:w-16"
                  >
                    <Cover book={book} size="M" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/book/${book.id}`}
                      className="line-clamp-2 font-display text-base font-semibold tracking-tight text-ink transition-colors hover:text-primary"
                    >
                      {book.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">{book.author}</p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(book.id)}
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint transition-colors hover:text-status-danger"
                    >
                      <Icon.Trash className="h-3.5 w-3.5" />
                      {t('cart.remove')}
                    </button>
                  </div>

                  <span className="tnum shrink-0 text-base font-semibold text-ink">
                    ${(book.price ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Digital note */}
            <div className="mt-6 flex items-start gap-3 rounded-card border border-divider bg-inset/45 p-5">
              <Icon.Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
              <p className="text-xs leading-relaxed text-ink-soft">{t('cart.digitalNote')}</p>
            </div>

            <Link
              to="/store"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-dark transition-colors hover:text-primary"
            >
              <Icon.ArrowLeft className="h-3.5 w-3.5" />
              {so ? 'Sii wad baadhitaanka' : 'Continue browsing'}
            </Link>
          </div>

          {/* Summary */}
          <aside>
            <div className="rounded-card border border-divider bg-surface p-6 lg:sticky lg:top-32">
              <h2 className="eyebrow-plain !text-ink-soft">{t('checkout.orderSummary')}</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">{t('cart.subtotal')}</dt>
                  <dd className="tnum font-medium text-ink">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">{t('cart.deliveryLabel')}</dt>
                  <dd className="flex items-center gap-2">
                    <span className="rounded-[3px] bg-inset px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                      {t('common.digital')}
                    </span>
                    <span className="tnum font-medium text-ink">$0.00</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-divider pt-5">
                <span className="font-display text-base font-semibold tracking-tight text-ink">
                  {t('cart.total')}
                </span>
                <span className="tnum font-display text-2xl font-semibold text-primary-dark">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <Button full className="mt-6" onClick={() => navigate('/checkout')}>
                {t('cart.checkout')}
              </Button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint">
                <Icon.Lock className="h-3 w-3" />
                {t('cart.secure')}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 border-t border-divider pt-5">
                {['EVC Plus', 'ZAAD', 'Visa', 'Mastercard'].map((p) => (
                  <span
                    key={p}
                    className="rounded-[3px] border border-divider px-2 py-1 text-[10px] font-semibold text-ink-faint"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile checkout bar */}
      <div className="sticky bottom-0 z-30 border-t border-divider bg-canvas/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-faint">{t('cart.total')}</p>
            <p className="tnum font-display text-lg font-semibold text-ink">${subtotal.toFixed(2)}</p>
          </div>
          <Button className="!px-5" onClick={() => navigate('/checkout')}>
            {t('cart.checkout')}
          </Button>
        </div>
      </div>
    </>
  )
}
