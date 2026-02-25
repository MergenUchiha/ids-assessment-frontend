import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { runsApi } from '../api/client'
import { RunReport, PaginatedAlerts } from '../types'
import StatusBadge from '../components/StatusBadge'
import Panel from '../components/Panel'
import PageHeader from '../components/PageHeader'
import { useI18n } from '../i18n'
import { ArrowLeft, Shield, Target, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>()
  const { t } = useI18n()

  const { data: report, isLoading } = useQuery<RunReport>({
    queryKey: ['run-report', runId],
    queryFn: () => runsApi.report(runId!),   // uses the correct alias
    refetchInterval: (q) => {
      const s = q.state.data?.status
      return (s === 'RUNNING' || s === 'QUEUED') ? 3000 : false
    },
  })

  const { data: alertsData } = useQuery<PaginatedAlerts>({
    queryKey: ['run-alerts', runId],
    queryFn: () => runsApi.alerts(runId!, 1, 50),
    enabled: !!report && report.status === 'FINISHED',
  })

  if (isLoading) return <div className="p-6 font-mono text-xs text-text-dim animate-fade-in">{t('loadingRun')}</div>
  if (!report)   return <div className="p-6 font-mono text-xs" style={{ color: 'var(--danger)' }}>{t('runNotFound')}</div>

  const m = report.metrics
  const radarData = m ? [
    { metric: 'Precision', value: Math.round((m.precision ?? 0) * 100) },
    { metric: 'Recall',    value: Math.round((m.recall    ?? 0) * 100) },
    { metric: 'F1',        value: Math.round((m.f1        ?? 0) * 100) },
  ] : []

  const evColor = (type: string) => {
    if (type === 'attack_success') return 'var(--danger)'
    if (type === 'attack_fail')    return 'var(--accent-2)'
    if (type === 'attack_start')   return 'var(--accent)'
    if (type === 'error')          return 'var(--danger)'
    return 'var(--muted)'
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <Link to="/experiments"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] text-text-dim hover:text-accent transition-colors mb-3">
          <ArrowLeft size={10} /> {t('backToExp')}
        </Link>
        <PageHeader
          title={`Run #${report.runId.slice(-6)}`}
          sub={`// experiment: ${report.experiment}`}
          actions={<StatusBadge status={report.status} />}
        />
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: t('scenario'),   value: report.scenario  ?? '—', icon: <Target size={12} /> },
          { label: t('idsProfile'), value: report.idsProfile ?? 'default', icon: <Shield size={12} /> },
          { label: t('started'),    value: report.startedAt ? format(new Date(report.startedAt), 'HH:mm:ss') : '—', icon: <Clock size={12} /> },
          { label: t('alerts'),     value: report.alertsCount, icon: <Shield size={12} /> },
        ].map(({ label, value, icon }) => (
          <Panel key={label} className="p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-text-dim">{icon}</span>
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">{label}</p>
            </div>
            <p className="font-mono text-sm text-text-bright">{value}</p>
          </Panel>
        ))}
      </div>

      {/* Attack banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
        style={{
          background: `color-mix(in srgb, ${report.attackSuccess ? 'var(--danger)' : 'var(--accent-2)'} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${report.attackSuccess ? 'var(--danger)' : 'var(--accent-2)'} 25%, transparent)`,
        }}
      >
        {report.attackSuccess
          ? <><XCircle size={16} style={{ color: 'var(--danger)' }} /><p className="font-mono text-xs" style={{ color: 'var(--danger)' }}>{t('attackSucceeded')}</p></>
          : <><CheckCircle2 size={16} style={{ color: 'var(--accent-2)' }} /><p className="font-mono text-xs" style={{ color: 'var(--accent-2)' }}>{t('attackBlocked')}</p></>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        {/* Metrics */}
        {m && (
          <Panel className="p-5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim mb-4">// {t('detectionMetricsFull')}</p>
            <div className="space-y-2.5">
              {[
                { label: t('truePositives'),    value: m.tp, color: 'var(--accent-2)' },
                { label: t('falsePositives'),   value: m.fp, color: 'var(--warn)' },
                { label: t('falseNegatives'),   value: m.fn, color: 'var(--danger)' },
                { label: t('precision'),        value: m.precision != null ? `${(m.precision * 100).toFixed(1)}%` : '—', color: 'var(--accent)' },
                { label: t('recall'),           value: m.recall    != null ? `${(m.recall    * 100).toFixed(1)}%` : '—', color: 'var(--accent)' },
                { label: t('f1Score'),          value: m.f1        != null ? `${(m.f1        * 100).toFixed(1)}%` : '—', color: 'var(--accent)' },
                { label: t('detectionLatency'), value: m.latencyMs != null ? `${m.latencyMs}ms` : '—', color: 'var(--warn)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-dim">{label}</span>
                  <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* Radar */}
        {radarData.length > 0 && (
          <Panel className="p-5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim mb-2">// {t('performanceRadar')}</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={1.5} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Panel>
        )}

        {/* Timeline */}
        <Panel className="p-5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim mb-4">// {t('attackTimeline')}</p>
          <div className="space-y-2">
            {report.attackEvents.map((ev, i) => (
              <div key={ev.id} className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-0.5" style={{ background: evColor(ev.type) }} />
                  {i < report.attackEvents.length - 1 && (
                    <div className="w-px flex-1 min-h-4 mt-1" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-mono text-[10px] text-text">{ev.type.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="font-mono text-[9px] text-text-dim">{format(new Date(ev.timestamp), 'HH:mm:ss.SSS')}</p>
                  {ev.data && 'snippet' in ev.data && (
                    <p className="font-mono text-[9px] text-text-dim mt-0.5 truncate max-w-[200px]">{String(ev.data.snippet)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Alerts table */}
      {alertsData && (
        <Panel>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="font-mono text-[9px] uppercase tracking-widest text-text-dim">
              // {t('capturedAlerts')} · {alertsData.total} {t('total')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[t('timestamp'), t('signature'), t('severity'), t('srcIp'), t('dstIp')].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-text-dim">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alertsData.data.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">{format(new Date(a.timestamp), 'HH:mm:ss.SSS')}</td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-text max-w-xs truncate">{a.signature}</td>
                    <td className="px-5 py-2.5">
                      <span className="font-mono text-xs"
                        style={{ color: a.severity === 1 ? 'var(--danger)' : a.severity === 2 ? 'var(--warn)' : 'var(--accent-2)' }}>
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
        </Panel>
      )}
    </div>
  )
}
