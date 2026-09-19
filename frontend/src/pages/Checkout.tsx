import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { getBook } from '../data/db'
import { PageHeader } from '../components/layouts'
import { Button, Icon } from '../components/ui'
import type { PaymentMethod } from '../types'

export default function Checkout() {
  const { t, lang } = useT()
  const { cartItems, checkout, toast, user } = useApp()
  const navigate = useNavigate()
  const [method, setMethod] = useState<PaymentMethod>('EVC Plus')
  const [busy, setBusy] = useState(false)

  const so = lang === 'so'
  const items = cartItems.map((i) => getBook(i.bookId)!).filter(Boolean)
  const subtotal = items.reduce((sum, b) => sum + (b.price ?? 0), 0)

  const methods: { id: PaymentMethod; label: string; hint: string; icon: JSX.Element }[] = [
    {
      id: 'EVC Plus',
      label: t('checkout.evc'),
      hint: so ? 'Koodka *770# · Hormuud' : 'Dial *770# · Hormuud',
      icon: <Icon.Phone className="h-4.5 w-4.5" />,
    },
    {
      id: 'ZAAD Service',
      label: t('checkout.zaad'),
      hint: so ? 'Koodka *880# · Telesom' : 'Dial *880# · Telesom',
      icon: <Icon.Phone className="h-4.5 w-4.5" />,
    },
    {
      id: 'Card',
      label: t('checkout.card'),
      hint: so ? 'Visa ama Mastercard' : 'Visa or Mastercard',
      icon: <Icon.Card className="h-4.5 w-4.5" />,
    },
  ]

  const onPay = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    setBusy(true)
    const result = checkout(method)
    setBusy(false)
    if (!result) {
      toast(so ? 'Gaadhigu waa madhan yahay' : 'Your cart is empty', 'error')
      navigate('/cart')
      return
    }
    navigate('/payment-result', {
      state: { ok: true, amount: result.payment.amount, method, reference: result.payment.reference, type: 'BOOK_PURCHASE' },
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[
          { to: '/', label: t('nav.home') },
          { to: '/cart', label: t('cart.title') },
          { label: t('checkout.title') },
        ]}
        eyebrow={so ? 'Tallaabada ugu dambeysa' : 'Final step'}
        title={t('checkout.title')}
      />

      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        {/* Payment method */}
        <section>
          <h2 className="eyebrow-plain mb-5">{t('checkout.paymentMethod')}</h2>

          <div className="space-y-3">
            {methods.map((m) => {
              const active = method === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-4 rounded-card border p-5 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary-light/45 shadow-soft'
                      : 'border-divider bg-surface hover:border-ink/20'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] ${
                      active ? 'bg-primary text-white' : 'bg-inset text-ink-soft'
                    }`}
                  >
                    {m.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{m.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{m.hint}</span>
                  </span>

                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      active ? 'border-primary bg-primary' : 'border-divider'
                    }`}
                  >
                    {active && <Icon.Check className="h-3 w-3 text-white" />}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-card border border-divider bg-inset/45 p-5">
            <Icon.Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
            <p className="text-xs leading-relaxed text-ink-soft">{t('checkout.instantNote')}</p>
          </div>
        </section>

        {/* Summary */}
        <aside>
          <div className="rounded-card border border-divider bg-surface p-6 lg:sticky lg:top-32">
            <h2 className="eyebrow-plain mb-5">{t('checkout.orderSummary')}</h2>

            <ul className="space-y-3 border-b border-divider pb-5">
              {items.map((b) => (
                <li key={b.id} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="truncate text-ink-soft">{b.title}</span>
                  <span className="tnum shrink-0 font-medium text-ink">${(b.price ?? 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="font-display text-base font-semibold tracking-tight text-ink">
                {t('common.total')}
              </span>
              <span className="tnum font-display text-2xl font-semibold text-primary-dark">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <Button full className="mt-6" disabled={subtotal === 0 || busy} onClick={onPay}>
              {!user
                ? so ? 'Gal si aad u bixiso' : 'Sign in to pay'
                : t('checkout.payAmount', { amount: subtotal.toFixed(2) })}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint">
              <Icon.Lock className="h-3 w-3" />
              {so ? 'Xogtaada lama kaydiyo' : 'Your details are never stored'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
