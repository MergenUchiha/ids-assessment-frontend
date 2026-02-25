import { ReactNode } from 'react'

interface Props {
  title: string
  sub?: string
  actions?: ReactNode
}

export default function PageHeader({ title, sub, actions }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-mono font-bold text-xl uppercase tracking-widest text-text-bright">{title}</h1>
        {sub && <p className="font-mono text-[10px] text-text-dim mt-0.5 tracking-wider">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
