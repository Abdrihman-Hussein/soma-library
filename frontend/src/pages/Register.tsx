import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useApp } from '../context/AppContext'
import { AuthShell } from '../components/layouts'
import { Button, Field, Icon } from '../components/ui'

export default function Register() {
  const { t, lang } = useT()
  const { register, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const so = lang === 'so'

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirm) {
      setError(so ? 'Password-yadu ma laha mid ka mid ah.' : 'Passwords do not match.')
      return
    }
    const result = register(form.name, form.email, form.phone, form.password)
    if (!result.ok) {
      setError(
        result.error === 'email-taken'
          ? so
            ? 'Emailkaan horey loo diiwaan geliyay.'
            : 'This email is already registered.'
          : so
            ? 'Diiwaangelintu way fashilantay.'
            : 'Registration failed.',
      )
      return
    }
    toast(so ? 'Akoonkaaga waa la sameeyay' : 'Account created', 'success')
    navigate('/')
  }

  return (
    <AuthShell
      eyebrow={so ? 'Bilaash · 30 ilsecond' : 'Free · 30 seconds'}
      title={t('auth.createAccount')}
      subtitle={t('auth.createSub')}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-btn border border-status-danger/30 bg-[#F7E2DC] px-4 py-3 text-xs font-medium text-[#8A3225]">
            <Icon.Alert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <Field
          label={t('auth.fullName')}
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Axmed Maxamed"
        />

        <Field
          label={t('auth.email')}
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
        />

        <div>
          <label htmlFor="register-phone" className="label">
            {t('auth.phone')}
          </label>
          <div className="flex gap-2">
            <span
              aria-hidden="true"
              className="input flex w-[5.5rem] shrink-0 items-center justify-center gap-1.5 bg-inset/50 text-sm font-semibold text-ink-soft"
            >
              +252
            </span>
            <input
              id="register-phone"
              className="input flex-1"
              required
              value={form.phone}
              onChange={set('phone')}
              placeholder="61 555 0123"
            />
          </div>
        </div>

        <Field
          label={t('auth.password')}
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={set('password')}
          hint={t('auth.passwordHint')}
        />

        <Field
          label={so ? 'Xaqiiji password-ka' : 'Confirm password'}
          type="password"
          required
          minLength={8}
          value={form.confirm}
          onChange={set('confirm')}
          placeholder="••••••••"
        />

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            required
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded-[3px] border-divider accent-[#0F766E]"
          />
          <span>{t('auth.agree')}</span>
        </label>

        <Button full type="submit" disabled={!agree}>
          {t('auth.createAccount')}
        </Button>
      </form>

      <p className="mt-8 text-sm text-ink-soft">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary-dark hover:text-primary">
          {t('common.login')}
        </Link>
      </p>
    </AuthShell>
  )
}
