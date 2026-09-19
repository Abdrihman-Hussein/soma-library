import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import type { LoginError } from '../context/AppContext'
import { AuthShell } from '../components/layouts'
import { Button, Field, Icon } from '../components/ui'

const errorKey: Record<LoginError, { so: string; en: string }> = {
  'no-user': {
    so: 'Ma jiro akoon leh emailkaan. Isdiiwaangeli hore.',
    en: 'No account with this email. Register first.',
  },
  'bad-password': {
    so: 'Password-kaagu waa qaldan yahay.',
    en: 'Incorrect password.',
  },
  suspended: {
    so: 'Akoonkaaga waa la joojiyay. Nala soo xiriir.',
    en: 'This account is suspended. Contact support.',
  },
}

export default function Login() {
  const { t, lang } = useT()
  const { login, toast } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const so = lang === 'so'

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const err = login(email, password)
    setBusy(false)
    if (err) {
      setError(errorKey[err][so ? 'so' : 'en'])
      return
    }
    toast(so ? 'Si guul leh ayaad u gashay' : 'Signed in', 'success')
    navigate('/')
  }

  return (
    <AuthShell
      eyebrow={so ? 'Ku soo dhawoow mar kale' : 'Welcome back'}
      title={t('auth.welcome')}
      subtitle={t('auth.loginSub')}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-btn border border-status-danger/30 bg-[#F7E2DC] px-4 py-3 text-xs font-medium text-[#8A3225]">
            <Icon.Alert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <Field
          label={t('auth.email')}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="login-password" className="label !mb-0">
              {t('auth.password')}
            </label>
            <Link to="/register" className="text-[11px] font-semibold text-primary-dark hover:text-primary">
              {t('auth.forgot')}
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              className="input pr-11"
              type={show ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-ink"
            >
              <Icon.Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-xs text-ink-soft">
          <input type="checkbox" className="h-4 w-4 rounded-[3px] border-divider accent-[#0F766E]" defaultChecked />
          {t('auth.remember')}
        </label>

        <Button full type="submit" disabled={busy}>
          {t('auth.loginBtn')}
        </Button>
      </form>

      {/* Demo credentials — remove when a real backend exists */}
      <div className="mt-6 rounded-card border border-divider bg-inset/45 p-4">
        <p className="eyebrow-plain !text-[9px]">{so ? 'Akoonnada tijaabada' : 'Demo accounts'}</p>
        <div className="mt-2 space-y-1.5 text-xs">
          {[
            { role: so ? 'Maamule' : 'Admin', email: 'admin@somalibrary.so', pw: 'admin123' },
            { role: so ? 'Akhriste' : 'Reader', email: 'reader@somalibrary.so', pw: 'reader123' },
          ].map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => {
                setEmail(a.email)
                setPassword(a.pw)
                setError(null)
              }}
              className="flex w-full items-center justify-between gap-3 rounded-btn bg-surface px-3 py-2 text-left transition-colors hover:border hover:border-primary/40"
            >
              <span className="font-semibold text-ink">{a.role}</span>
              <span className="tnum truncate font-mono text-[11px] text-ink-soft">
                {a.email} · {a.pw}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-primary-dark hover:text-primary">
          {t('common.register')}
        </Link>
      </p>
    </AuthShell>
  )
}
