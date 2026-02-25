import { useQuery } from '@tanstack/react-query'
import { alertsApi } from '../api/client'
import { Alert } from '../types'
import Panel from '../components/Panel'
import PageHeader from '../components/PageHeader'
import { useI18n } from '../i18n'
import { Shield, ArrowUp, ArrowDown } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

export default function Alerts() {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<keyof Alert>('timestamp')
  const [sortAsc, setSortAsc] = useState(false)

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts-all'],
    queryFn: () => alertsApi.list(),
    refetchInterval: 15_000,
  })

  const sevColor = (s: number) => s === 1 ? 'var(--danger)' : s === 2 ? 'var(--warn)' : 'var(--accent-2)'

  const filtered = alerts
    .filter(a => !search || a.signature.toLowerCase().includes(search.toLowerCase()) || a.srcIp.includes(search) || a.destIp.includes(search))
    .sort((a, b) => {
      const cmp = String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? ''))
      return sortAsc ? cmp : -cmp
    })

  const stats = {
    sev1: alerts.filter(a => a.severity === 1).length,
    sev2: alerts.filter(a => a.severity === 2).length,
    sev3: alerts.filter(a => a.severity === 3).length,
  }

  const SortBtn = ({ field, label }: { field: keyof Alert; label: string }) => (
    <button
      className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-text-dim hover:text-text transition-colors"
      onClick={() => { if (sortField === field) setSortAsc(p => !p); else { setSortField(field); setSortAsc(true) } }}
    >
      {label}
      {sortField === field ? (sortAsc ? <ArrowUp size={8} /> : <ArrowDown size={8} />) : null}
    </button>
  )

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('alerts')} sub={`// ${t('suricataAlerts')}`} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: t('critical'), value: stats.sev1, color: 'var(--danger)' },
          { label: t('high'),     value: stats.sev2, color: 'var(--warn)'   },
          { label: t('medium'),   value: stats.sev3, color: 'var(--accent-2)' },
        ].map(({ label, value, color }) => (
          <Panel key={label} className="p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
            <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim mb-2">{label}</p>
            <p className="font-mono font-bold text-3xl" style={{ color }}>{value}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Shield size={12} className="text-text-dim" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('filterAlerts')}
            className="flex-1 bg-transparent font-mono text-xs focus:outline-none text-text placeholder:text-text-dim"
          />
          <span className="font-mono text-[9px] text-text-dim">{filtered.length} {t('events')}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-xs text-text-dim text-center py-16">{t('noAlertsFound')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="px-5 py-3 text-left"><SortBtn field="timestamp" label={t('timestamp')} /></th>
                  <th className="px-5 py-3 text-left"><SortBtn field="signature" label={t('signature')} /></th>
                  <th className="px-5 py-3 text-left"><SortBtn field="severity" label={t('severity')} /></th>
                  <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-text-dim">{t('srcIp')}</th>
                  <th className="px-5 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-text-dim">{t('dstIp')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="transition-colors" style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">
                      {format(new Date(a.timestamp), 'MM/dd HH:mm:ss')}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text max-w-xs">
                      <span className="truncate block">{a.signature}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-mono"
                        style={{
                          color: sevColor(a.severity),
                          background: `color-mix(in srgb, ${sevColor(a.severity)} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${sevColor(a.severity)} 25%, transparent)`,
                        }}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">{a.srcIp}</td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">{a.destIp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
