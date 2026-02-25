import clsx from 'clsx'
import { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  sub?: string
  accent?: boolean
  warn?: boolean
  icon?: ReactNode
}

export default function MetricCard({ label, value, sub, accent, warn, icon }: Props) {
  return (
    <div className={clsx(
      'rounded-lg border p-4 bg-bg-2 transition-all duration-200',
      accent ? 'border-accent/30 shadow-accent-sm' : warn ? 'border-warn/30' : 'border-border'
    )}>
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim">{label}</p>
        {icon && <span className={accent ? 'text-accent' : warn ? 'text-warn' : 'text-text-dim'}>{icon}</span>}
      </div>
      <p className={clsx(
        'mt-2 font-display font-600 text-3xl tracking-tight',
        accent ? 'text-accent' : warn ? 'text-warn' : 'text-text-bright'
      )}>{value}</p>
      {sub && <p className="mt-1 font-mono text-[10px] text-text-dim">{sub}</p>}
    </div>
  )
}
