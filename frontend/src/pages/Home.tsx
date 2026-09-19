import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allBooks, allCategories, getBook } from '../data/db'
import { BookGridCard, ContinueReadingCard } from '../components/BookCard'
import { Cover } from '../components/Cover'
import { Icon, SectionHeader, SeeAll } from '../components/ui'

// Hero fan — a mix of real covers and designed jackets, so the first
// thing a visitor sees is actual product art.
// Fan geometry: 5 x 24% minus 4 x 7% overlap = 92% of the container, which
// leaves the ~3% of headroom each side that the rotation needs. Anything
// wider and the outer covers push past the viewport edge.
const HERO_IDS = ['b2', 'b6', 'b1', 'b3', 'b7']
const HERO_ROTATION = [-11, -6, 0, 6, 11]
const HERO_LIFT = [24, 8, 0, 8, 24]
const HERO_Z = [1, 2, 5, 2, 1]

export default function Home() {
  const { t, lang } = useT()
  const { addToCart, toast, continueReading } = useApp()
  const navigate = useNavigate()

  const books = allBooks().filter((b) => b.status === 'PUBLISHED')
  const categories = allCategories()

  const heroBooks = HERO_IDS.map(getBook).filter(Boolean) as NonNullable<ReturnType<typeof getBook>>[]
  const newBooks = [...books].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const popular = [...books].sort((a, b) => b.popularity - a.popularity).slice(0, 5)

  const so = lang === 'so'
  const copy = so
    ? {
        eyebrow: 'Maktabad dijitaal · Soomaaliya',
        headline: 'Buugaag kula sii jira, maalin kasta.',
        lede: 'Suugaan Soomaali, waxbarasho wax-ku-ool ah iyo buugaag caalami ah oo la jecel yahay — hal maktabad oo degan, laba luqadood, PDF isla markiiba.',
        primaryCta: 'Baadh maktabadda',
        secondaryCta: 'Dukaanka buugaagta',
        meta: '500+ cinwaan · Soomaali & Ingiriisi · EVC Plus, ZAAD iyo kaarka',
        stats: [
          ['500+', 'Cinwaano buuxa'],
          ['10k+', 'Akhristayaal firfircoon'],
          ['2', 'Luqado, hal maktabad'],
          ['$3', 'Bil kasta, tan ugu yar'],
        ],
        newEyebrow: 'Cusub shelfka',
        newTitle: 'Kuwii ugu dambeeyay',
        popularEyebrow: 'La doortay',
        popularTitle: 'Waxa dadku hadda akhrinayaan',
        waysEyebrow: 'Laba siyaabood oo aad wax u akhrido',
        waysTitle: 'Maktabad iyo Dukaan — laba nidaam oo gooni ah.',
        waysText: 'Rukunku wuxuu siinayaa gelitaan ku meel gaar ah oo maktabadda. Iibsashadu waxay siinaysaa buug joogto ah oo aad leedahay. Waxaad isticmaali kartaa labadaba.',
        libraryTitle: 'Maktabadda',
        libraryText: 'Rukun bille ah. Akhri sidaad rabto inta rukunku socdo.',
        libraryFeatures: ['Buugaag daahiran', 'Akhris aan xaddidnayn', 'Taariikhda akhriska'],
        libraryCta: 'Eeg qiimaha rukumka',
        storeTitle: 'Dukaanka',
        storeText: 'Bixi hal mar. PDF-kaagu wuxuu ku sii jiraa Buugaagtayda weligiis.',
        storeFeatures: ['Lacag keliya', 'PDF weligaa', 'Degdeg, gaadhi la\u2019aan'],
        storeCta: 'Tag dukaanka',
        catEyebrow: 'Baadh qaybaha',
        catTitle: 'Liiska maktabadda',
        closingTitle: 'Bilow hal buug maanta.',
        closingText: 'Ka bilow $3 bishiiba. Jooji wakhti kasta.',
        closingCta: 'Dooro rukun',
        titles: 'cinwaano',
      }
    : {
        eyebrow: 'Digital library · Somalia',
        headline: 'Books that stay with you, every day.',
        lede: 'Somali literature, practical learning and celebrated world titles — one calm library, two languages, instant PDFs.',
        primaryCta: 'Browse the library',
        secondaryCta: 'Visit the store',
        meta: '500+ titles · Somali & English · EVC Plus, ZAAD and card',
        stats: [
          ['500+', 'Titles in the catalogue'],
          ['10k+', 'Active readers'],
          ['2', 'Languages, one library'],
          ['$3', 'A month, from'],
        ],
        newEyebrow: 'Fresh on the shelf',
        newTitle: 'Latest arrivals',
        popularEyebrow: 'Selected',
        popularTitle: 'What readers are reading now',
        waysEyebrow: 'Two ways to read',
        waysTitle: 'Library and Store — two separate systems.',
        waysText: 'A subscription gives you temporary access to the library. A purchase gives you a book you keep. You can use both.',
        libraryTitle: 'The Library',
        libraryText: 'A monthly subscription. Read as much as you like while it runs.',
        libraryFeatures: ['Curated titles', 'Unlimited reading', 'Reading history'],
        libraryCta: 'See subscription prices',
        storeTitle: 'The Store',
        storeText: 'Pay once. Your PDF stays in My Books forever.',
        storeFeatures: ['Single payment', 'Yours permanently', 'Instant, no shipping'],
        storeCta: 'Go to the store',
        catEyebrow: 'Browse by subject',
        catTitle: 'The catalogue index',
        closingTitle: 'Start one book today.',
        closingText: 'From $3 a month. Cancel any time.',
        closingCta: 'Choose a plan',
        titles: 'titles',
      }

  const onAdd = (id: string) => {
    addToCart(id)
    toast(so ? 'Waxaa lagu daray gaadhiga' : 'Added to cart', 'success')
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="display-title mt-4 text-balance">{copy.headline}</h1>
            <p className="lede mt-5 max-w-xl text-pretty">{copy.lede}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/library" className="btn-primary !px-6">
                {copy.primaryCta}
                <Icon.ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/store" className="btn-outline !px-6">
                {copy.secondaryCta}
              </Link>
            </div>

            <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.13em] text-ink-faint">
              {copy.meta}
            </p>
          </div>

          {/* Fanned books — the actual product, not a stock photo */}
          <div className="relative">
            <div className="flex items-end justify-center pb-8">
              {heroBooks.map((b, i) => (
                <div
                  key={b!.id}
                  style={{
                    transform: `rotate(${HERO_ROTATION[i]}deg) translateY(${HERO_LIFT[i]}px)`,
                    zIndex: HERO_Z[i],
                  }}
                  className={`w-[24%] shrink-0 transition-transform duration-500 hover:!translate-y-0 ${
                    i > 0 ? '-ml-[7%]' : ''
                  } ${i === 0 || i === 4 ? 'hidden sm:block' : ''}`}
                >
                  <div className="shadow-lift">
                    <Cover book={b!} priority={i === 2} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[11px] uppercase tracking-[0.14em] text-ink-faint sm:mt-8">
              {so ? 'Buugaag laga heli karo maktabadda' : 'Available in the library today'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────────── */}
      <section className="border-y border-divider bg-inset/35">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-divider px-4 md:grid-cols-4 md:divide-x md:px-8">
          {copy.stats.map(([value, label]) => (
            <div key={label} className="px-1 py-7 md:px-8">
              <p className="font-display text-3xl font-semibold tracking-tight text-primary-dark md:text-4xl">
                {value}
              </p>
              <p className="mt-1.5 text-xs leading-snug text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* ── Continue reading ───────────────────────────────────── */}
        {continueReading && (
          <section className="pt-14">
            <SectionHeader
              eyebrow={so ? 'Halkii aad joogtay' : 'Pick up where you left off'}
              title={t('home.continueReading')}
              action={<SeeAll to="/my-books" label={t('common.seeAll')} />}
            />
            <div className="max-w-3xl">
              <ContinueReadingCard
                book={continueReading.book}
                progressPct={continueReading.progressPct}
                lastPage={continueReading.lastPage}
              />
            </div>
          </section>
        )}

        {/* ── New arrivals ───────────────────────────────────────── */}
        <section className="pt-14">
          <SectionHeader
            eyebrow={copy.newEyebrow}
            title={copy.newTitle}
            action={<SeeAll to="/library" label={t('common.seeAll')} />}
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {newBooks.map((b) => (
              <BookGridCard key={b.id} book={b} onAdd={onAdd} />
            ))}
          </div>
        </section>

        {/* ── Library vs Store ───────────────────────────────────── */}
        <section className="pt-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{copy.waysEyebrow}</p>
            <h2 className="section-title mt-4 text-balance">{copy.waysTitle}</h2>
            <p className="lede mt-3 text-pretty">{copy.waysText}</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {/* Library — dark panel */}
            <div className="flex flex-col rounded-card bg-ink p-7 text-canvas md:p-9">
              <div className="flex items-center gap-2.5">
                <Icon.Library className="h-5 w-5 text-canvas/70" />
                <p className="eyebrow-plain !text-canvas/60">{so ? 'Rukun' : 'Subscription'}</p>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                {copy.libraryTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-canvas/75">{copy.libraryText}</p>

              <ul className="mt-6 space-y-2.5">
                {copy.libraryFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-canvas/85">
                    <Icon.Check className="h-4 w-4 shrink-0 text-canvas/55" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/plans"
                className="btn mt-8 w-fit bg-canvas text-ink hover:bg-canvas/90"
              >
                {copy.libraryCta}
                <Icon.ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Store — paper panel */}
            <div className="flex flex-col rounded-card border border-divider bg-surface p-7 md:p-9">
              <div className="flex items-center gap-2.5">
                <Icon.Store className="h-5 w-5 text-accent-dark" />
                <p className="eyebrow-plain">{so ? 'Iibsasho' : 'Purchase'}</p>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
                {copy.storeTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy.storeText}</p>

              <ul className="mt-6 space-y-2.5">
                {copy.storeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Icon.Check className="h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/store" className="btn-outline mt-8 w-fit">
                {copy.storeCta}
                <Icon.ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Popular ────────────────────────────────────────────── */}
        <section className="pt-20">
          <SectionHeader
            eyebrow={copy.popularEyebrow}
            title={copy.popularTitle}
            action={<SeeAll to="/store" label={t('common.seeAll')} />}
          />
          <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => navigate(`/book/${b.id}`)}
                className="group flex items-center gap-4 border-b border-divider py-4 text-left"
              >
                <span className="tnum w-5 shrink-0 font-display text-sm font-semibold text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-10 shrink-0 overflow-hidden rounded-[3px] shadow-book transition-transform duration-300 group-hover:-translate-y-1">
                  <Cover book={b} size="M" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-primary">
                    {b.title}
                  </p>
                  <p className="truncate text-xs text-ink-soft">{b.author}</p>
                </div>
                <span className="tnum hidden shrink-0 text-xs font-semibold text-ink-soft sm:block">
                  {b.store && b.price != null ? `$${b.price.toFixed(2)}` : so ? 'Maktabad' : 'Library'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Category index ─────────────────────────────────────── */}
        <section className="pt-20">
          <SectionHeader eyebrow={copy.catEyebrow} title={copy.catTitle} />

          <div className="grid gap-x-12 sm:grid-cols-2">
            {categories.map((c) => {
              const name = so ? c.nameSo : c.nameEn
              const count = books.filter((b) => b.categoryId === c.id).length
              return (
                <Link
                  key={c.id}
                  to={`/search?q=${encodeURIComponent(name)}`}
                  className="group flex items-baseline justify-between gap-4 border-b border-divider py-4"
                >
                  <span className="font-display text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-primary">
                    {name}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tnum text-xs text-ink-faint">
                      {count} {copy.titles}
                    </span>
                    <Icon.ChevronRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Closing CTA ────────────────────────────────────────── */}
        <section className="py-20">
          <div className="relative overflow-hidden rounded-card border border-divider bg-inset/50 px-7 py-12 md:px-14 md:py-16">
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                  {copy.closingTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
                  {copy.closingText}
                </p>
              </div>
              <Link to="/plans" className="btn-primary shrink-0 !px-6">
                {copy.closingCta}
                <Icon.ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
