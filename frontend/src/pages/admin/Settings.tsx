import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Button, Field, Icon, Toggle } from '../../components/ui'
import { useT } from '../../i18n'

interface PlatformSettings {
  platformName: string
  defaultLang: 'so' | 'en'
  gracePeriod: string
  maxDownloads: string
  providers: { name: string; on: boolean; sandbox: boolean }[]
}

const SETTINGS_KEY = 'somalibrary.settings.v1'

function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw) as PlatformSettings
  } catch {
    // fall through to defaults
  }
  return {
    platformName: 'SomaLibrary',
    defaultLang: 'so',
    gracePeriod: '0',
    maxDownloads: '20',
    providers: [
      { name: 'EVC Plus', on: true, sandbox: true },
      { name: 'ZAAD Service', on: true, sandbox: false },
      { name: 'Card Payments (Stripe)', on: false, sandbox: false },
    ],
  }
}

export default function Settings() {
  const { user, toast } = useApp()
  const { t } = useT()
  const [settings, setSettings] = useState<PlatformSettings>(loadSettings)
  const [saved, setSaved] = useState(false)
  const actor = user?.name ?? 'Admin'

  const save = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      toast(t('admin.settings.saveFail'), 'error')
      return
    }
    db.logAudit('UPDATE', 'Platform settings', 'Settings saved', actor)
    setSaved(true)
    toast(t('admin.settings.saved'), 'success')
    window.setTimeout(() => setSaved(false), 2000)
  }

  const setProvider = (i: number, patch: Partial<PlatformSettings['providers'][number]>) =>
    setSettings((s) => ({ ...s, providers: s.providers.map((p, j) => (j === i ? { ...p, ...patch } : p)) }))

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-xl font-bold text-ink">{t('admin.settings.title')}</h1>

      {/* General */}
      <div className="card space-y-3 p-4">
        <h2 className="section-title">{t('admin.settings.general')}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label={t('admin.settings.platformName')}
            value={settings.platformName}
            onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
          />
          <div>
            <label className="label" htmlFor="default-lang">{t('admin.settings.defaultLang')}</label>
            <select
              id="default-lang"
              className="input"
              value={settings.defaultLang}
              onChange={(e) => setSettings((s) => ({ ...s, defaultLang: e.target.value as 'so' | 'en' }))}
            >
              <option value="so">{t('admin.settings.somali')}</option>
              <option value="en">{t('admin.settings.english')}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="grace">{t('admin.settings.grace')}</label>
            <select
              id="grace"
              className="input"
              value={settings.gracePeriod}
              onChange={(e) => setSettings((s) => ({ ...s, gracePeriod: e.target.value }))}
            >
              <option value="0">{t('admin.settings.days0')}</option>
              <option value="3">{t('admin.settings.days3')}</option>
            </select>
          </div>
          <Field
            label={t('admin.settings.maxDownloads')}
            type="number"
            value={settings.maxDownloads}
            onChange={(e) => setSettings((s) => ({ ...s, maxDownloads: e.target.value }))}
          />
        </div>
      </div>

      {/* Payment providers */}
      <div className="card p-4">
        <h2 className="section-title mb-1">{t('admin.settings.providers')}</h2>
        <p className="mb-3 text-xs text-ink-faint">{t('admin.settings.providersNote')}</p>
        <div className="divide-y divide-divider">
          {settings.providers.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon.Card className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {p.name}
                  {p.sandbox && <span className="rounded-[3px] bg-[#F6EAD3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#85561A]">{t('admin.settings.sandbox')}</span>}
                </p>
                <p className="text-[11px] text-ink-faint">{p.on ? t('admin.settings.enabled') : t('admin.settings.disabled')} · {t('admin.settings.keysNote')}</p>
              </div>
              <Toggle
                on={p.on}
                label={t('admin.settings.enableProvider', { name: p.name })}
                onToggle={() => setProvider(i, { on: !p.on })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Admin users */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">{t('admin.settings.adminUsers')}</h2>
        </div>
        <div className="divide-y divide-divider text-sm">
          {db.allUsers().filter((u) => u.role === 'admin').map((a) => (
            <div key={a.email} className="flex items-center gap-3 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary-dark">
                {a.avatarInitials}
              </span>
              <div className="flex-1">
                <p className="font-semibold">{a.name}</p>
                <p className="text-[11px] text-ink-faint">{a.email}</p>
              </div>
              <span className="rounded-[3px] bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-canvas">
                {a.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">
          {t('admin.settings.inviteNote')}
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-status-danger/40 p-4">
        <h2 className="section-title text-status-danger">{t('admin.settings.danger')}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-btn border border-divider p-3">
            <div>
              <p className="text-sm font-semibold">{t('admin.settings.resetRetention')}</p>
              <p className="text-[11px] text-ink-faint">{t('admin.settings.retentionNote')}</p>
            </div>
            <button
              onClick={() => {
                db.clearOldAudit(actor)
                toast(t('admin.settings.retentionDone'), 'success')
              }}
              className="btn-outline !min-h-9 border-status-danger/40 text-xs text-status-danger"
            >
              {t('admin.settings.reset')}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-btn border border-divider p-3">
            <div>
              <p className="text-sm font-semibold">{t('admin.settings.resetDemo')}</p>
              <p className="text-[11px] text-ink-faint">{t('admin.settings.demoNote')}</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm(t('admin.settings.confirmResetAll'))) {
                  db.resetAndReseed()
                  window.location.href = '/'
                }
              }}
              className="btn-outline !min-h-9 border-status-danger/40 text-xs text-status-danger"
            >
              {t('admin.settings.resetData')}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save}>{saved ? t('admin.settings.savedShort') : t('admin.settings.saveChanges')}</Button>
      </div>
    </div>
  )
}
