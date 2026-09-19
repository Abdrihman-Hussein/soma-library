import { Link, useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allBooks, categoryName, getBook } from '../data/db'
import { Cover } from '../components/Cover'
import { BookGridCard } from '../components/BookCard'
import { Button, Icon, SectionHeader, Stars } from '../components/ui'

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useT()
  const { addToCart, toast, canRead } = useApp()

  const so = lang === 'so'
  const book = getBook(id ?? '')

  if (!book) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="eyebrow-plain">404</p>
        <h1 className="display-title mt-4">{so ? 'Buug lama helin' : 'Book not found'}</h1>
        <p className="lede mt-3">
          {so
            ? 'Waxaa laga yaabaa in buuggan la saaray maktabadda.'
            : 'This title may have been removed from the catalogue.'}
        </p>
        <Link to="/library" className="btn-primary mt-7">
          {t('nav.library')}
        </Link>
      </div>
    )
  }

  const readable = canRead(book.id)
  const related = allBooks()
    .filter((b) => b.categoryId === book.categoryId && b.id !== book.id && b.status === 'PUBLISHED')
    .slice(0, 5)

  const onAdd = () => {
    addToCart(book.id)
    toast(so ? 'Waxaa lagu daray gaadhiga' : 'Added to cart', 'success')
    navigate('/cart')
  }

  const meta: [string, string][] = [
    [so ? 'Luqad' : 'Language', book.language === 'so' ? 'Soomaali' : 'English'],
    [so ? 'Bogag' : 'Pages', String(book.pages)],
    [so ? 'Sanad' : 'Published', String(book.year)],
    [so ? 'Qayb' : 'Subject', categoryName(book.categoryId, lang)],
    ['Format', 'PDF'],
  ]

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 pt-6 text-[11px] text-ink-faint">
          <Link to="/" className="uppercase tracking-[0.12em] transition-colors hover:text-primary">
            {t('nav.home')}
          </Link>
          <span className="text-divider">/</span>
          <Link
            to={book.library ? '/library' : '/store'}
            className="uppercase tracking-[0.12em] transition-colors hover:text-primary"
          >
            {book.library ? t('nav.library') : t('nav.store')}
          </Link>
          <span className="text-divider">/</span>
          <span className="truncate uppercase tracking-[0.12em] text-ink-soft">{book.title}</span>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[340px_1fr] lg:gap-16 lg:py-14">
          {/* Cover */}
          <div className="mx-auto w-52 sm:w-64 lg:sticky lg:top-32 lg:mx-0 lg:w-full">
            <div className="shadow-lift">
              <Cover book={book} priority />
            </div>
            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.13em] text-ink-faint">
              {so ? 'Akhris dijitaal ah oo buuxa' : 'Full digital edition'}
            </p>
          </div>

          {/* Details */}
          <div className="min-w-0">
            <p className="eyebrow">{categoryName(book.categoryId, lang)}</p>

            <h1 className="display-title mt-4 text-balance">{book.title}</h1>
            <p className="mt-2.5 text-base text-ink-soft">
              {so ? 'waxaa qoray' : 'by'} <span className="font-medium text-ink">{book.author}</span>
              <span className="mx-2 text-divider">·</span>
              {book.year}
            </p>

            <div className="mt-4">
              <Stars rating={book.rating} count={book.ratingCount} />
            </div>

            <p className="lede mt-7 max-w-2xl text-pretty">{book.description}</p>

            {/* Meta */}
            <dl className="mt-8 max-w-md border-t border-divider">
              {meta.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-divider py-3 text-sm">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Purchase doors */}
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {/* Library */}
              <div
                className={`flex flex-col rounded-card border p-6 ${
                  book.library ? 'border-divider bg-surface' : 'border-divider bg-inset/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-ink-soft">
                    <Icon.Library className="h-4 w-4" />
                    {t('common.library')}
                  </span>
                  {book.library && (
                    <span
                      className={`rounded-[3px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                        readable ? 'bg-[#E4EFE5] text-[#2B5C3D]' : 'bg-inset text-ink-soft'
                      }`}
                    >
                      {readable ? t('book.available') : so ? 'Rukun' : 'Subscription'}
                    </span>
                  )}
                </div>

                {book.library ? (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {t('book.readWithSub')}
                    </p>
                    <Button
                      variant={readable ? 'primary' : 'outline'}
                      full
                      className="mt-5"
                      onClick={() => navigate(readable ? `/read/${book.id}` : '/plans')}
                    >
                      {readable
                        ? so
                          ? 'Sii wad akhriska'
                          : 'Start reading'
                        : so
                          ? 'Eeg rukumka'
                          : 'See the plans'}
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">
                    {so ? 'Buuggan maktabadda kama mid ah.' : 'Not part of the library.'}
                  </p>
                )}
              </div>

              {/* Store */}
              <div
                className={`flex flex-col rounded-card border p-6 ${
                  book.store ? 'border-primary/30 bg-primary-light/40' : 'border-divider bg-inset/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-ink-soft">
                    <Icon.Store className="h-4 w-4" />
                    {t('common.store')}
                  </span>
                  {book.store && book.price != null && (
                    <span className="tnum text-lg font-semibold text-ink">${book.price.toFixed(2)}</span>
                  )}
                </div>

                {book.store && book.price != null ? (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t('book.yoursForever')}</p>
                    <Button full className="mt-5" onClick={onAdd}>
                      {so ? 'Ku dar gaadhiga' : 'Add to cart'}
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-ink-faint">
                    {so ? 'Lama iibin karo si gooni ah.' : 'Not for individual sale.'}
                  </p>
                )}
              </div>
            </div>

            {/* Reassurance */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
              <span className="flex items-center gap-1.5">
                <Icon.Lock className="h-3.5 w-3.5" />
                {so ? 'Gelitaan ammaan ah' : 'Secure access'}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Download className="h-3.5 w-3.5" />
                {so ? 'PDF isla markiiba' : 'Instant PDF'}
              </span>
              <button
                type="button"
                onClick={() => toast(so ? 'Wax la wadaag' : 'Sharing coming soon', 'info')}
                className="flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                <Icon.Share className="h-3.5 w-3.5" />
                {so ? 'Wadaag' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="pb-8 pt-10">
            <SectionHeader
              eyebrow={so ? 'Wax la mid ah' : 'More like this'}
              title={so ? `Mawduuca ${categoryName(book.categoryId, lang)}` : `More in ${categoryName(book.categoryId, lang)}`}
              action={
                <Link
                  to={`/search?q=${encodeURIComponent(categoryName(book.categoryId, lang))}`}
                  className="text-xs font-semibold text-primary-dark hover:text-primary"
                >
                  {t('common.seeAll')} →
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {related.map((b) => (
                <BookGridCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky buy bar — the one place an app-style action bar helps */}
      <div className="sticky bottom-0 z-30 border-t border-divider bg-canvas/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="w-10 shrink-0">
            <Cover book={book} size="M" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">{book.title}</p>
            <p className="tnum text-xs text-ink-soft">
              {book.store && book.price != null ? `$${book.price.toFixed(2)}` : t('common.library')}
            </p>
          </div>
          {book.store && book.price != null ? (
            <Button className="!px-4" onClick={onAdd}>
              {so ? 'Iibso' : 'Buy'}
            </Button>
          ) : (
            <Button
              className="!px-4"
              onClick={() => navigate(readable ? `/read/${book.id}` : '/plans')}
            >
              {readable ? (so ? 'Akhri' : 'Read') : t('plans.title')}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
