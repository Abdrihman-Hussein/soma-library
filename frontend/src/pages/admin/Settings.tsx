import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import * as db from '../../data/db'
import { Button, Field, Icon, Toggle } from '../../components/ui'

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
  const [settings, setSettings] = useState<PlatformSettings>(loadSettings)
  const [saved, setSaved] = useState(false)
  const actor = user?.name ?? 'Admin'

  const save = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch {
      toast('Could not save settings (storage blocked)', 'error')
      return
    }
    db.logAudit('UPDATE', 'Platform settings', 'Settings saved', actor)
    setSaved(true)
    toast('Settings saved', 'success')
    window.setTimeout(() => setSaved(false), 2000)
  }

  const setProvider = (i: number, patch: Partial<PlatformSettings['providers'][number]>) =>
    setSettings((s) => ({ ...s, providers: s.providers.map((p, j) => (j === i ? { ...p, ...patch } : p)) }))

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-xl font-bold text-ink">Settings</h1>

      {/* General */}
      <div className="card space-y-3 p-4">
        <h2 className="section-title">General</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Platform name"
            value={settings.platformName}
            onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
          />
          <div>
            <label className="label" htmlFor="default-lang">Default language</label>
            <select
              id="default-lang"
              className="input"
              value={settings.defaultLang}
              onChange={(e) => setSettings((s) => ({ ...s, defaultLang: e.target.value as 'so' | 'en' }))}
            >
              <option value="so">Soomaali</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="grace">Grace period after expiry</label>
            <select
              id="grace"
              className="input"
              value={settings.gracePeriod}
              onChange={(e) => setSettings((s) => ({ ...s, gracePeriod: e.target.value }))}
            >
              <option value="0">0 days</option>
              <option value="3">3 days</option>
            </select>
          </div>
          <Field
            label="Max PDF downloads / month"
            type="number"
            value={settings.maxDownloads}
            onChange={(e) => setSettings((s) => ({ ...s, maxDownloads: e.target.value }))}
          />
        </div>
      </div>

      {/* Payment providers */}
      <div className="card p-4">
        <h2 className="section-title mb-1">Payment Providers</h2>
        <p className="mb-3 text-xs text-ink-faint">Toggles are saved locally; live provider keys arrive with the payment API</p>
        <div className="divide-y divide-divider">
          {settings.providers.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon.Card className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {p.name}
                  {p.sandbox && <span className="rounded-[3px] bg-[#F6EAD3] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#85561A]">Sandbox</span>}
                </p>
                <p className="text-[11px] text-ink-faint">{p.on ? 'Enabled' : 'Disabled'} · keys arrive with the payment API</p>
              </div>
              <Toggle
                on={p.on}
                label={`Enable ${p.name}`}
                onToggle={() => setProvider(i, { on: !p.on })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Admin users */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Admin Users</h2>
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
          Invite new admins from the Users page — change a user's role to Admin there.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card border-status-danger/40 p-4">
        <h2 className="section-title text-status-danger">Danger Zone</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-btn border border-divider p-3">
            <div>
              <p className="text-sm font-semibold">Reset audit retention</p>
              <p className="text-[11px] text-ink-faint">Deletes audit events older than 12 months</p>
            </div>
            <button
              onClick={() => {
                db.clearOldAudit(actor)
                toast('Audit retention applied', 'success')
              }}
              className="btn-outline !min-h-9 border-status-danger/40 text-xs text-status-danger"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between rounded-btn border border-divider p-3">
            <div>
              <p className="text-sm font-semibold">Reset demo data</p>
              <p className="text-[11px] text-ink-faint">Wipes all accounts, purchases and history; reseeds the catalogue</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset ALL data? Every account, purchase and subscription will be erased.')) {
                  db.resetAndReseed()
                  window.location.href = '/'
                }
              }}
              className="btn-outline !min-h-9 border-status-danger/40 text-xs text-status-danger"
            >
              Reset data
            </button>
          </div>
        </div>
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save}>{saved ? 'Saved ✓' : 'Save Changes'}</Button>
      </div>
    </div>
  )
}
