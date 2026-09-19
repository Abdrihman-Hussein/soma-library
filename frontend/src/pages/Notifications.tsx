import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/layouts'
import { EmptyState, Icon } from '../components/ui'
import type { Notification } from '../types'

const toneFor = (type: Notification['type']) => {
  switch (type) {
    case 'payment_success':
      return { cls: 'bg-[#E4EFE5] text-[#2B5C3D]', el: <Icon.Check className="h-4 w-4" /> }
    case 'payment_failed':
      return { cls: 'bg-[#F7E2DC] text-[#8A3225]', el: <Icon.Alert className="h-4 w-4" /> }
    case 'subscription_expiring':
    case 'subscription_expired':
      return { cls: 'bg-[#F6EAD3] text-[#85561A]', el: <Icon.Clock className="h-4 w-4" /> }
    default:
      return { cls: 'bg-primary-light text-primary-dark', el: <Icon.Book className="h-4 w-4" /> }
  }
}

function Row({ n, lang }: { n: Notification; lang: 'so' | 'en' }) {
  const { cls, el } = toneFor(n.type)
  const navigate = useNavigate()
  const body = lang === 'so' ? n.bodySo : n.bodyEn

  return (
    <div className={`flex items-start gap-4 px-5 py-5 transition-colors ${!n.read ? 'bg-primary-light/25' : ''}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${cls}`}>
        {el}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">
          {lang === 'so' ? n.titleSo : n.titleEn}
          {!n.read && (
            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
          )}
        </p>
        {body && <p className="mt-1 text-xs leading-relaxed text-ink-soft">{body}</p>}
        {n.actionLabelSo && (
          <button
            type="button"
            onClick={() => navigate('/plans')}
            className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-dark transition-colors hover:text-primary"
          >
            {lang === 'so' ? n.actionLabelSo : n.actionLabelEn} →
          </button>
        )}
      </div>

      <span className="hidden shrink-0 text-[11px] uppercase tracking-[0.1em] text-ink-faint sm:block">
        {new Date(n.createdAt).toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-US', {
          day: 'numeric',
          month: 'short',
        })}
      </span>
    </div>
  )
}

export default function Notifications() {
  const { t, lang } = useT()
  // Shared with the header bell, so marking these read clears the badge too.
  const { user, notifications: items, unreadCount: unread, markAllRead } = useApp()

  const so = lang === 'so'

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <PageHeader
          breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('notifications.title') }]}
          title={t('notifications.title')}
        />
        <div className="py-16">
          <EmptyState
            icon={<Icon.Bell className="h-6 w-6" />}
            title={so ? 'Wali ma galin' : 'Not signed in'}
            text={so ? 'Gal si aad u aragto ogeysiisyada.' : 'Sign in to see your notifications.'}
            action={<Link to="/login" className="btn-primary">{t('common.login')}</Link>}
          />
        </div>
      </div>
    )
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const today = items.filter((n) => new Date(n.createdAt) >= startOfToday)
  const earlier = items.filter((n) => new Date(n.createdAt) < startOfToday)

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8">
      <PageHeader
        breadcrumbs={[{ to: '/', label: t('nav.home') }, { label: t('notifications.title') }]}
        title={t('notifications.title')}
        description={
          unread > 0
            ? so
              ? `${unread} ogeysiis oo aan la akhrin.`
              : `${unread} unread ${unread === 1 ? 'notification' : 'notifications'}.`
            : so
              ? 'Wax cusub ma jiraan.'
              : 'You are all caught up.'
        }
        actions={
          items.length > 0 ? (
            <button type="button" onClick={markAllRead} className="btn-outline !min-h-10 text-[13px]">
              {t('notifications.markAll')}
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <div className="py-14">
          <EmptyState
            icon={<Icon.Bell className="h-6 w-6" />}
            title={t('notifications.empty')}
            text={so ? 'Wax ogeysiis ah weli ma jiro.' : 'Nothing has happened yet.'}
          />
        </div>
      ) : (
        <div className="py-10">
          {today.length > 0 && (
            <section>
              <p className="eyebrow-plain mb-3">{t('notifications.today')}</p>
              <div className="divide-y divide-divider overflow-hidden rounded-card border border-divider bg-surface">
                {today.map((n) => (
                  <Row key={n.id} n={n} lang={lang} />
                ))}
              </div>
            </section>
          )}

          {earlier.length > 0 && (
            <section className="mt-10">
              <p className="eyebrow-plain mb-3">{t('notifications.earlier')}</p>
              <div className="divide-y divide-divider overflow-hidden rounded-card border border-divider bg-surface">
                {earlier.map((n) => (
                  <Row key={n.id} n={n} lang={lang} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
