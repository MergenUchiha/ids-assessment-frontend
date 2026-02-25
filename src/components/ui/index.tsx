import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import type { RunStatus } from '../../types'

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-border bg-base-800 p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusStyles: Record<RunStatus, string> = {
  QUEUED: 'bg-base-600 text-gray-300 border-base-500',
  RUNNING:
    'bg-accent-blue/10 text-accent-blue border-accent-blue/30 animate-pulse-slow',
  FINISHED: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  FAILED: 'bg-accent-red/10 text-accent-red border-accent-red/30',
}

const statusDot: Record<RunStatus, string> = {
  QUEUED: 'bg-gray-500',
  RUNNING: 'bg-accent-blue',
  FINISHED: 'bg-accent-green',
  FAILED: 'bg-accent-red',
}

export function StatusBadge({ status }: { status: RunStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs',
        statusStyles[status],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', statusDot[status])} />
      {status}
    </span>
  )
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: number }) {
  const cfg =
    severity <= 1
      ? 'bg-accent-red/10 text-accent-red border-accent-red/30'
      : severity <= 2
        ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
        : 'bg-base-600 text-gray-400 border-base-500'

  const label = severity <= 1 ? 'HIGH' : severity <= 2 ? 'MEDIUM' : 'LOW'

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs',
        cfg,
      )}
    >
      {label}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  children: ReactNode
}

const btnVariants = {
  primary:
    'bg-accent-green text-base-900 hover:bg-accent-green/90 font-semibold',
  ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-base-700',
  danger:
    'bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20',
  outline:
    'bg-transparent border border-border text-gray-300 hover:border-gray-500 hover:text-white',
}

const btnSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded border border-border bg-base-700 px-3 py-2 font-mono text-sm text-white placeholder-gray-600',
        'focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30',
        'transition-colors',
        props.className,
      )}
      {...props}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={clsx(
        'w-full rounded border border-border bg-base-700 px-3 py-2 font-mono text-sm text-white placeholder-gray-600',
        'focus:border-accent-green/50 focus:outline-none focus:ring-1 focus:ring-accent-green/30',
        'transition-colors resize-none',
        props.className,
      )}
      {...props}
    />
  )
}

// ─── Label ────────────────────────────────────────────────────────────────────
export function Label({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <label
      className={clsx(
        'block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5',
        className,
      )}
    >
      {children}
    </label>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'red' | 'amber' | 'blue'
}) {
  const accentCls = {
    green: 'text-accent-green',
    red: 'text-accent-red',
    amber: 'text-accent-amber',
    blue: 'text-accent-blue',
  }

  return (
    <Card className="flex flex-col gap-1">
      <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p
        className={clsx(
          'font-display text-3xl font-bold',
          accent ? accentCls[accent] : 'text-white',
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </Card>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-gray-600">{icon}</div>
      <p className="font-display text-base font-semibold text-gray-400">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'h-5 w-5 animate-spin rounded-full border-2 border-base-600 border-t-accent-green',
        className,
      )}
    />
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-fade-in rounded-xl border border-border bg-base-800 p-6 shadow-2xl">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

// ─── Metric Bar ───────────────────────────────────────────────────────────────
export function MetricBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-xs text-gray-400">
        <span>{label}</span>
        <span className="text-white">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-base-600">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
