import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allPlans } from '../data/db'
import { PageHeader } from '../components/layouts'
import { Button, Icon } from '../components/ui'
import type { PaymentMethod, SubscriptionPlan } from '../types'

export default function Plans() {
  const { t, lang } = useT()
  const { subscribe, subscription, user, toast } = useApp()
  const navigate = useNavigate()
  const [method, setMethod] = useState<PaymentMethod>('EVC Plus')
  const [busy, setBusy] = useState<string | null>(null)

  const so = lang === 'so'

  const choose = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login', { state: { from: '/plans' } })
      return
    }
    setBusy(plan.id)
    try {
      const { payment, subscription: sub } = subscribe(plan.id, method)
      navigate('/payment-result', {
        state: {
          ok: true,
          amount: payment.amount,
          method,
          reference: payment.reference,
          planName: plan.name,
          expiresAt: sub.expiresAt,
          type: 'SUBSCRIPTION',
        },
      })
    } catch {
      toast(so ? 'Lacag-bixintu way fashilantay' : 'Payment failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  const methods: { id: PaymentMethod; label: string; hint: string }[] = [
    { id: 'EVC Plus', label: t('checkout.evc'), hint: so ? '*770# · Hormuud' : '*770# · Hormuud' },
    { id: 'ZAAD Service', label: t('checkout.zaad'), hint: so ? '*880# · Telesom' : '*880# · Telesom' },
    { id: 'Card', label: so ? 'Kaar' : 'Card', hint: 'Visa · Mastercard' },
  ]

  const faqs: [string, string][] = so
    ? [
        ['Ma joojin karaa wakhti kasta?', 'Haa. Rukunku wuxuu sii socdaa ilaa taariikhda dhacdo, kadibna ma cusboonaysiiyo.'],
        ['Maxaa dhacaa buugaagtii aan iibsaday?', 'Waxay sii ahaanayaan kuwaaga weligood, xitaa haddii rukunku dhamaado.'],
        ['Sidee lacagta loo bixiyaa?', 'EVC Plus, ZAAD Service, ama kaarka bangiga. Qiimuhu waa USD.'],
      ]
    : [
        ['Can I cancel at any time?', 'Yes. Your plan runs until its end date and then simply does not renew.'],
        ['What happens to books I bought?', 'They stay yours permanently, even after a subscription ends.'],
        ['How do I pay?', 'EVC Plus, ZAAD Service, or a bank card. All prices are in USD.'],
      ]

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        align="center"
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('plans.title') }]}
        eyebrow={so ? 'Rukunka maktabadda' : 'Library subscription'}
        title={t('plans.title')}
        description={t('plans.intro')}
      />

      {/* Plan cards */}
      <div className="grid items-start gap-5 py-12 md:grid-cols-3">
        {allPlans().map((plan) => {
          const isCurrent = subscription?.planId === plan.id && subscription?.status === 'ACTIVE'
          const featured = Boolean(plan.popular)

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-card p-7 ${
                featured
                  ? 'bg-ink text-canvas shadow-lift md:-mt-4 md:pb-9 md:pt-9'
                  : 'border border-divider bg-surface'
              }`}
            >
              {featured && (
                <span className="absolute -top-3 left-7 rounded-[3px] bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                  {t('plans.mostPopular')}
                </span>
              )}
              {isCurrent && (
                <span
                  className={`absolute -top-3 right-7 rounded-[3px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    featured ? 'bg-canvas text-ink' : 'bg-[#E4EFE5] text-[#2B5C3D]'
                  }`}
                >
                  {t('plans.activePlan')}
                </span>
              )}

              <h3
                className={`font-display text-xl font-semibold tracking-tight ${
                  featured ? 'text-canvas' : 'text-ink'
                }`}
              >
                {plan.name}
              </h3>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span
                  className={`tnum font-display text-4xl font-semibold tracking-tight ${
                    featured ? 'text-canvas' : 'text-primary-dark'
                  }`}
                >
                  ${plan.price}
                </span>
                <span className={`text-sm ${featured ? 'text-canvas/60' : 'text-ink-faint'}`}>
                  {t('plans.perMonth')}
                </span>
              </p>

              <p className={`mt-2 text-xs ${featured ? 'text-canvas/60' : 'text-ink-faint'}`}>
                {plan.bookLimit == null
                  ? so
                    ? 'Buugaag aan xaddidnayn'
                    : 'Unlimited books'
                  : so
                    ? `${plan.bookLimit} buug bishiiba`
                    : `${plan.bookLimit} books per month`}
              </p>

              <div className={`my-6 h-px ${featured ? 'bg-canvas/15' : 'bg-divider'}`} />

              <ul className="flex-1 space-y-3">
                {(so ? plan.featuresSo : plan.featuresEn).map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2.5 text-sm ${
                      featured ? 'text-canvas/85' : 'text-ink-soft'
                    }`}
                  >
                    <Icon.Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-canvas/55' : 'text-primary'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={featured ? 'primary' : isCurrent ? 'outline' : 'ink'}
                full
                className="mt-7"
                disabled={busy === plan.id}
                onClick={() => choose(plan)}
              >
                {!user
                  ? so ? 'Gal si aad u doorato' : 'Sign in to choose'
                  : isCurrent
                    ? so ? 'Cusboonaysii bilood' : 'Renew another month'
                    : t('plans.choose')}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Payment method */}
      <section className="grid gap-8 border-t border-divider py-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="section-title">{t('checkout.paymentMethod')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {so
              ? 'Lacag-bixinta waa la xaqiijiyaa ka hor inta gelitaan la siin. Xogtaada lama kaydiyo.'
              : 'Payment is verified before access is granted. We never store your payment details.'}
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
            <Icon.Lock className="h-3.5 w-3.5" />
            {so ? 'Lacag-bixi ammaan ah' : 'Secure checkout'}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {methods.map((m) => {
            const active = method === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-pressed={active}
                className={`rounded-card border p-4 text-left transition-all ${
                  active ? 'border-primary bg-primary-light/45 shadow-soft' : 'border-divider bg-surface hover:border-ink/20'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{m.label}</span>
                  {active && <Icon.Check className="h-4 w-4 text-primary" />}
                </span>
                <span className="mt-1 block text-xs text-ink-soft">{m.hint}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="grid gap-8 border-t border-divider py-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <h2 className="section-title">{so ? 'Su\u2019aalo' : 'Questions'}</h2>
        <dl>
          {faqs.map(([q, a]) => (
            <div key={q} className="border-b border-divider py-5 first:pt-0">
              <dt className="font-display text-base font-semibold tracking-tight text-ink">{q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="pb-12 text-center text-xs text-ink-faint">{t('plans.footnote')}</p>
    </div>
  )
}
