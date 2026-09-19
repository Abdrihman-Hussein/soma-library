import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { Button, Icon } from '../components/ui'

interface ResultState {
  ok: boolean
  amount?: number
  method?: string
  reference?: string
  planName?: string
  expiresAt?: string
  type?: 'BOOK_PURCHASE' | 'SUBSCRIPTION'
}

export default function PaymentResult() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, lang } = useT()
  const s = (location.state ?? {}) as Partial<ResultState>

  const so = lang === 'so'
  const ok = s.ok !== false
  const date = new Date().toLocaleDateString(so ? 'so-SO' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rows: [string, string][] = ok
    ? [
        [t('paymentResult.plan'), s.planName ?? (so ? 'Iibsasho' : 'Purchase')],
        [t('paymentResult.amount'), s.amount != null ? `$${s.amount.toFixed(2)}` : '—'],
        [t('paymentResult.method'), s.method ?? 'EVC Plus'],
        [t('paymentResult.date'), date],
        [t('paymentResult.status'), t('status.SUCCESS')],
        [t('paymentResult.ref'), s.reference ?? 'SML-2026-00000'],
      ]
    : [
        [t('paymentResult.amount'), `$${(s.amount ?? 0).toFixed(2)}`],
        [t('paymentResult.method'), s.method ?? 'EVC Plus'],
        [t('paymentResult.date'), date],
        [t('paymentResult.status'), t('status.FAILED')],
        [t('paymentResult.ref'), s.reference ?? 'SML-2026-00000'],
      ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8 md:py-20">
      <div className="text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 ${
            ok ? 'border-primary bg-primary-light text-primary' : 'border-status-danger bg-[#F7E2DC] text-[#8A3225]'
          }`}
        >
          {ok ? <Icon.Check className="h-6 w-6" /> : <Icon.Alert className="h-6 w-6" />}
        </span>

        <h1 className="display-title mt-7 text-balance">
          {ok ? t('paymentResult.successTitle') : t('paymentResult.failedTitle')}
        </h1>

        <p className="lede mx-auto mt-3 max-w-md text-pretty">
          {ok
            ? t('paymentResult.successSub', {
                plan: s.planName ?? (so ? 'Iibsasho' : 'Purchase'),
                date: s.expiresAt ?? date,
              })
            : t('paymentResult.failedSub')}
        </p>
      </div>

      {/* Receipt */}
      <div className="mt-10 overflow-hidden rounded-card border border-divider bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-divider px-6 py-4">
          <p className="eyebrow-plain">{so ? 'Rasiidh' : 'Receipt'}</p>
          <p className="text-[11px] uppercase tracking-[0.13em] text-ink-faint">SomaLibrary</p>
        </div>

        <dl>
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-6 border-b border-divider px-6 py-3.5 text-sm last:border-b-0"
            >
              <dt className="text-ink-soft">{k}</dt>
              <dd className={`tnum text-right font-medium text-ink ${k === t('paymentResult.ref') ? 'font-mono text-xs' : ''}`}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        {ok ? (
          <>
            <Button onClick={() => navigate(s.type === 'SUBSCRIPTION' ? '/library' : '/my-books')}>
              {s.type === 'SUBSCRIPTION' ? t('paymentResult.startReading') : t('paymentResult.goMyBooks')}
            </Button>
            <Link to="/" className="btn-outline">
              {t('nav.home')}
            </Link>
          </>
        ) : (
          <>
            <Button onClick={() => navigate(-1)}>{t('paymentResult.tryAgain')}</Button>
            <Link to="/" className="btn-outline">
              {t('paymentResult.cancelLink')}
            </Link>
          </>
        )}
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-ink-faint">
        {so
          ? 'Rasiidhka waxaa sidoo kale loo diray emailkaaga. Haddii ay tahay dhibaato, nala soo xiriir.'
          : 'A copy of this receipt has been sent to your email. Contact us if anything looks wrong.'}
      </p>
    </div>
  )
}
