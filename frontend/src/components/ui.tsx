// ── Shared UI primitives for SomaLibrary ────────────────────────────

import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { useId, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'

// ── Icons (inline SVG, outline style, 2px stroke) ──────────────────

type IconProps = { className?: string }

const base = 'w-5 h-5'
const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

export const Icon = {
  Book: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  ),
  Home: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
  ),
  Library: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1-5-1-5 1-5 1V6z" /><path d="M22 6s-1.5-2-5-2-5 2-5 2v14s1.5-1 5-1 5 1 5 1V6z" /></svg>
  ),
  Store: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M3 9 4.5 3h15L21 9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 12v9h14v-9" /></svg>
  ),
  Cart: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /><path d="M3 3h2l2.5 12h10L20 7H6" /></svg>
  ),
  Search: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  Filter: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></svg>
  ),
  ChevronRight: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="m9 18 6-6-6-6" /></svg>
  ),
  ChevronDown: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="m6 9 6 6 6-6" /></svg>
  ),
  ArrowLeft: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
  ),
  Check: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M20 6 9 17l-5-5" /></svg>
  ),
  X: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  ),
  Plus: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
  ),
  Trash: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></svg>
  ),
  Lock: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
  ),
  Shield: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  Bell: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
  ),
  Clock: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
  ),
  User: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>
  ),
  Settings: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="12" r="3" /><path d="M12 2v3" /><path d="M12 19v3" /><path d="M4.2 4.2l2.1 2.1" /><path d="M17.7 17.7l2.1 2.1" /><path d="M2 12h3" /><path d="M19 12h3" /><path d="M4.2 19.8l2.1-2.1" /><path d="M17.7 6.3l2.1-2.1" /></svg>
  ),
  Logout: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
  ),
  Eye: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
  Pencil: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
  ),
  Share: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4" /><path d="m15.4 6.5-6.8 4" /></svg>
  ),
  Bookmark: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
  ),
  Grid: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  List: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></svg>
  ),
  Download: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
  ),
  Card: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
  ),
  Phone: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
  ),
  Alert: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
  ),
  Info: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
  ),
  Star: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2z" /></svg>
  ),
  Globe: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></svg>
  ),
  More: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
  ),
  TrendUp: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
  ),
  Users: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18.5 15.4c1.7.7 3 2.2 3.5 4.6" /></svg>
  ),
  BarChart: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" /><rect x="12" y="6" width="3" height="12" /><rect x="17" y="13" width="3" height="5" /></svg>
  ),
  FileText: ({ className = base }: IconProps) => (
    <svg {...svgProps} className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /></svg>
  ),
}

// ── Language switch ────────────────────────────────────────────────

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useT()
  return (
    <div
      className="inline-flex items-center rounded-btn border border-divider bg-surface p-0.5"
      role="group"
      aria-label={t('common.language')}
    >
      {(['so', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-[4px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
            lang === l ? 'bg-ink text-canvas' : 'text-ink-faint hover:text-ink'
          }`}
        >
          {compact ? l : l === 'so' ? 'Soomaali' : 'English'}
        </button>
      ))}
    </div>
  )
}

// ── Buttons ────────────────────────────────────────────────────────

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ink' | 'ghost' | 'danger'
  full?: boolean
}

export function Button({ variant = 'primary', full, className = '', ...rest }: BtnProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ink: 'btn-ink',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant]
  return (
    <button
      className={`${variantClass} ${full ? 'w-full' : ''} disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...rest}
    />
  )
}

// ── Form bits ──────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  // Associate the label with the input properly. Without id/htmlFor the label
  // was purely visual, so screen readers announced every field as unlabelled.
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <input id={fieldId} aria-describedby={hintId} className="input" {...rest} />
      {hint && (
        <p id={hintId} className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
          {hint}
        </p>
      )}
    </div>
  )
}

// ── Status pill ────────────────────────────────────────────────────

export function StatusPill({ status }: { status: string }) {
  const { t } = useT()
  // Warm, low-saturation pills — they should whisper, not shout
  const map: Record<string, string> = {
    ACTIVE: 'bg-[#E4EFE5] text-[#2B5C3D]',
    PENDING: 'bg-[#F6EAD3] text-[#85561A]',
    EXPIRED: 'bg-[#F7E2DC] text-[#8A3225]',
    CANCELLED: 'bg-inset text-ink-soft',
    SUCCESS: 'bg-[#E4EFE5] text-[#2B5C3D]',
    FAILED: 'bg-[#F7E2DC] text-[#8A3225]',
    SUSPENDED: 'bg-[#F7E2DC] text-[#8A3225]',
    PUBLISHED: 'bg-[#E4EFE5] text-[#2B5C3D]',
    DRAFT: 'bg-[#F6EAD3] text-[#85561A]',
    ARCHIVED: 'bg-inset text-ink-soft',
  }
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
        map[status] ?? 'bg-inset text-ink-soft'
      }`}
    >
      {t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : status}
    </span>
  )
}

// ── Toast host ─────────────────────────────────────────────────────

export function ToastHost({ toasts }: { toasts: { id: number; message: string; tone: 'success' | 'error' | 'info' }[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-btn border px-4 py-2.5 text-sm font-medium shadow-card ${
            t.tone === 'success'
              ? 'border-[#2B5C3D]/25 bg-[#E4EFE5] text-[#2B5C3D]'
              : t.tone === 'error'
                ? 'border-status-danger/25 bg-[#F7E2DC] text-[#8A3225]'
                : 'border-ink bg-ink text-canvas'
          }`}
        >
          {t.tone === 'success' && <Icon.Check className="h-4 w-4" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-accent">
      <Icon.Star className="h-3.5 w-3.5 fill-current" />
      <span className="tnum text-xs font-semibold text-ink">{rating.toFixed(1)}</span>
      {count != null && (
        <span className="tnum text-[11px] text-ink-faint">({count.toLocaleString()})</span>
      )}
    </span>
  )
}

/** Price is always set in tabular figures so shopping rows align. */
export function Price({ value, className = '' }: { value: number | null; className?: string }) {
  if (value == null) return null
  return <span className={`tnum font-semibold text-ink ${className}`}>${value.toFixed(2)}</span>
}

// ── Switch ─────────────────────────────────────────────────────────

export function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean
  onToggle: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-divider'}`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-surface shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ── Editorial section header ───────────────────────────────────────

export function SectionHeader({
  title,
  eyebrow,
  action,
  className = '',
}: {
  title: string
  eyebrow?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/** Quiet "see all" affordance used beside section headers. */
export function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-xs font-semibold text-primary-dark transition-colors hover:text-primary"
    >
      {label}
      <Icon.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title?: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-divider px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-inset text-ink-soft">
        {icon}
      </div>
      {title && <p className="font-display text-title-sm font-semibold tracking-tight text-ink">{title}</p>}
      <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{text}</p>
      {action}
    </div>
  )
}

// ── Breadcrumbs ────────────────────────────────────────────────────

export function Breadcrumbs({ items }: { items: { to?: string; label: string }[] }) {
  const { t } = useT()
  return (
    <nav aria-label={t('common.breadcrumb')} className="flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span className="text-divider">/</span>}
          {item.to ? (
            <Link to={item.to} className="uppercase tracking-[0.12em] transition-colors hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="uppercase tracking-[0.12em] text-ink-soft">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

// ── Confirm modal ──────────────────────────────────────────────────

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onCancel])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        tabIndex={-1}
        className="w-full max-w-md rounded-card border border-divider bg-canvas p-6 shadow-lift outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-inset text-ink">
            <Icon.Alert className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2
              id="confirm-modal-title"
              className="font-display text-lg font-semibold tracking-tight text-ink"
            >
              {title}
            </h2>

            <p
              id="confirm-modal-message"
              className="mt-1.5 text-sm leading-relaxed text-ink-soft"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
