import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { allPlans } from '../data/db'
import { PageHeader } from '../components/layouts'
import { Button, Field, Icon, LanguageSwitch, StatusPill } from '../components/ui'

export default function Profile() {
  const { t, lang } = useT()
  const { user, subscription, daysLeft, logout, payments, updateProfile, changePassword, toast } = useApp()

  const so = lang === 'so'
  const plan = allPlans().find((p) => p.id === subscription?.planId)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <PageHeader
          breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('profile.title') }]}
          title={t('profile.title')}
        />
        <div className="py-16 text-center">
          <p className="lede">{so ? 'Gal akoonkaaga si aad u aragto profile-ka.' : 'Sign in to see your profile.'}</p>
          <Link to="/login" className="btn-primary mt-6 inline-flex">{t('common.login')}</Link>
        </div>
      </div>
    )
  }

  const onSaveProfile = () => {
    setSavingProfile(true)
    const r = updateProfile({ name, phone })
    setSavingProfile(false)
    toast(r.ok ? (so ? 'Profile-ka waa la kaydiyay' : 'Profile saved') : (so ? 'Waa fashilmay' : 'Save failed'), r.ok ? 'success' : 'error')
  }

  const onChangePassword = () => {
    if (newPw !== confirmPw) {
      toast(so ? 'Password-yadu ma laha mid ka mid ah.' : 'Passwords do not match.', 'error')
      return
    }
    if (newPw.length < 8) {
      toast(so ? 'Ugu yaraan 8 xaraf' : 'At least 8 characters', 'error')
      return
    }
    const r = changePassword(currentPw, newPw)
    if (r.ok) {
      toast(so ? 'Password-ka waa la beddelay' : 'Password changed', 'success')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      toast(so ? 'Password-ka hadda waa qaldan' : 'Current password is incorrect', 'error')
    }
  }

  const settings = [
    { to: '/my-books', icon: <Icon.Book className="h-4 w-4" />, label: t('profile.myBooks') },
    { to: '/notifications', icon: <Icon.Bell className="h-4 w-4" />, label: t('profile.notifications') },
    { to: '/plans', icon: <Icon.Shield className="h-4 w-4" />, label: t('plans.title') },
    { to: '/', icon: <Icon.Info className="h-4 w-4" />, label: t('profile.help') },
  ]

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(so ? 'so-SO' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('profile.title') }]}
        title={t('profile.title')}
        description={
          so
            ? 'Akoonkaaga, rukunkaaga iyo taariikhda lacag-bixinta.'
            : 'Your account, your plan and your payment history.'
        }
        actions={
          user?.role === 'admin' ? (
            <Link to="/admin" className="btn-outline">
              <Icon.Grid className="h-4 w-4" />
              {t('profile.adminPanel')}
            </Link>
          ) : undefined
        }
      />

      {/* min-w-0 matters here: a 1fr grid track sizes to its items' min-content,
          and the payment rows below contain nowrap reference text. Without it
          the track grows past the viewport on narrow screens. */}
      <div className="grid gap-10 py-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Left column */}
        <div className="min-w-0 space-y-5">
          {/* Identity */}
          <div className="rounded-card border border-divider bg-surface p-6">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-semibold text-canvas">
                {user?.avatarInitials ?? '??'}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-semibold tracking-tight text-ink">
                  {user?.name ?? '—'}
                </p>
                <p className="truncate text-sm text-ink-soft">{user?.email ?? '—'}</p>
              </div>
            </div>

            <dl className="mt-6 border-t border-divider">
              <div className="flex items-baseline justify-between border-b border-divider py-3 text-sm">
                <dt className="text-ink-soft">{so ? 'Telefoon' : 'Phone'}</dt>
                <dd className="tnum font-medium text-ink">{user?.phone ?? '—'}</dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-divider py-3 text-sm">
                <dt className="text-ink-soft">{so ? 'Xubin tan iyo' : 'Member since'}</dt>
                <dd className="font-medium text-ink">
                  {user ? formatDate(user.joinedAt) : '—'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between py-3 text-sm">
                <dt className="text-ink-soft">{so ? 'Doorka' : 'Role'}</dt>
                <dd className="font-medium capitalize text-ink">{user?.role ?? '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Subscription */}
          <div className="rounded-card border border-primary/25 bg-primary-light/40 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-ink-soft">
                <Icon.Shield className="h-4 w-4" />
                {t('plans.title')}
              </span>
              {subscription && <StatusPill status={subscription.status} />}
            </div>

            <p className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
              {plan ? `${plan.name} · $${plan.price}${t('plans.perMonth')}` : so ? 'Ma jiro rukun firfiran' : 'No active plan'}
            </p>

            {subscription && (
              <>
                <p className="mt-1 text-sm text-ink-soft">
                  {t('profile.expires', { date: formatDate(subscription.expiresAt) })}
                </p>

                <div className="mt-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.round(((30 - daysLeft) / 30) * 100))}%` }}
                    />
                  </div>
                  <p className="tnum mt-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                    {so ? `${daysLeft} maalmood ka hadhay` : `${daysLeft} days remaining`}
                  </p>
                </div>
              </>
            )}

            <Link to="/plans" className="btn-outline mt-5">
              {subscription ? t('common.renew') : so ? 'Dooro qorshe' : 'Choose a plan'}
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0">
          {/* Settings */}
          <h2 className="eyebrow-plain mb-3">{so ? 'Dejinta' : 'Settings'}</h2>
          <div className="divide-y divide-divider overflow-hidden rounded-card border border-divider bg-surface">
            {settings.map((r) => (
              <Link
                key={r.label}
                to={r.to}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-inset/40"
              >
                <span className="text-ink-faint transition-colors group-hover:text-primary">{r.icon}</span>
                <span className="flex-1 text-sm font-medium text-ink">{r.label}</span>
                <Icon.ChevronRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}

            {/* Language — an inline control, not a dead link */}
            <div className="flex items-center gap-4 px-5 py-4">
              <span className="text-ink-faint">
                <Icon.Globe className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-ink">{t('common.language')}</span>
              <LanguageSwitch />
            </div>
          </div>

          {/* Payment history — inline, so the link is never a dead end */}
          <h2 className="eyebrow-plain mb-3 mt-10">{t('profile.paymentHistory')}</h2>

          {payments.length === 0 ? (
            <p className="rounded-card border border-dashed border-divider px-5 py-8 text-center text-sm text-ink-soft">
              {so ? 'Weli lacag-bixin ma jirto.' : 'No payments yet.'}
            </p>
          ) : (
            <div className="divide-y divide-divider overflow-hidden rounded-card border border-divider bg-surface">
              {payments.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] ${
                      p.status === 'SUCCESS'
                        ? 'bg-[#E4EFE5] text-[#2B5C3D]'
                        : 'bg-[#F7E2DC] text-[#8A3225]'
                    }`}
                  >
                    <Icon.Card className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.type === 'SUBSCRIPTION'
                        ? so
                          ? 'Rukun'
                          : 'Subscription'
                        : so
                          ? 'Iibsasho buug'
                          : 'Book purchase'}
                    </p>
                    <p className="tnum truncate text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      {p.method} · {p.reference}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="tnum text-sm font-semibold text-ink">${p.amount.toFixed(2)}</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Account settings */}
          <h2 className="eyebrow-plain mb-3 mt-10">{so ? 'Akoonka' : 'Account settings'}</h2>
          <div className="space-y-4 rounded-card border border-divider bg-surface p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('auth.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
              <Field label={so ? 'Telefoon' : 'Phone'} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button variant="outline" onClick={onSaveProfile} disabled={savingProfile}>
              {so ? 'Kaydi profile-ka' : 'Save profile'}
            </Button>

            <div className="border-t border-divider pt-4">
              <p className="label mb-2">{so ? 'Beddel password-ka' : 'Change password'}</p>
              <div className="grid gap-3">
                <input
                  type="password"
                  className="input"
                  placeholder={so ? 'Password-ka hadda' : 'Current password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="password"
                    className="input"
                    placeholder={so ? 'Password cusub' : 'New password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                  />
                  <input
                    type="password"
                    className="input"
                    placeholder={so ? 'Xaqiiji cusub' : 'Confirm new'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <Button variant="outline" onClick={onChangePassword} disabled={!currentPw || !newPw}>
                  {so ? 'Beddel password-ka' : 'Change password'}
                </Button>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-btn border border-divider bg-surface py-3 text-sm font-semibold text-ink-soft transition-colors hover:border-status-danger/40 hover:text-status-danger"
          >
            <Icon.Logout className="h-4 w-4" />
            {t('profile.logoutRow')}
          </button>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            SomaLibrary v0.1.0
          </p>
        </div>
      </div>
    </div>
  )
}
