import { ReactNode } from 'react'
import clsx from 'clsx'

export default function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx('rounded-xl border bg-bg-2 shadow-panel', className)}
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  )
}
