import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { experimentsApi, runsApi, scenariosApi } from '../api/client'
import { Experiment, Scenario } from '../types'
import StatusBadge from '../components/StatusBadge'
import Panel from '../components/Panel'
import PageHeader from '../components/PageHeader'
import Btn from '../components/Btn'
import { useI18n } from '../i18n'
import { Plus, Trash2, Play, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Experiments() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<Record<string, string>>({})

  // Unique key — no conflict with dashboard
  const { data: experiments = [], isLoading } = useQuery<Experiment[]>({
    queryKey: ['experiments'],
    queryFn: () => experimentsApi.list(),
  })
  const { data: scenarios = [] } = useQuery<Scenario[]>({
    queryKey: ['scenarios'],
    queryFn: () => scenariosApi.list(),
  })

  const createMut = useMutation({
    mutationFn: () => experimentsApi.create(newName, newDesc || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiments'] })
      qc.invalidateQueries({ queryKey: ['experiments-dashboard'] })
      setShowCreate(false); setNewName(''); setNewDesc('')
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => experimentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiments'] })
      qc.invalidateQueries({ queryKey: ['experiments-dashboard'] })
    },
  })

  const runMut = useMutation({
    mutationFn: ({ expId, scId }: { expId: string; scId: string }) => runsApi.create(expId, scId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experiments'] })
      qc.invalidateQueries({ queryKey: ['experiments-dashboard'] })
    },
  })

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text-bright)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('experiments')}
        sub={`// ${t('manageExperiments')}`}
        actions={
          <Btn size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={12} /> {t('newExperiment')}
          </Btn>
        }
      />

      {showCreate && (
        <Panel className="mb-4 p-5" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>// {t('createExperiment')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider block mb-1 text-text-dim">{t('name')} *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} placeholder="Baseline Experiment" />
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider block mb-1 text-text-dim">{t('description')}</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} style={inputStyle} placeholder="Optional description" />
            </div>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => createMut.mutate()} disabled={!newName || createMut.isPending}>
              {createMut.isPending ? t('creating') : t('create')}
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowCreate(false)}>{t('cancel')}</Btn>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-t-accent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="font-mono text-xs text-text-dim">{t('loading')}</p>
          </div>
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-xs text-text-dim mb-3">{t('noExperiments')}</p>
          <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={12} /> {t('createFirst')}</Btn>
        </div>
      ) : (
        <div className="space-y-3">
          {experiments.map((exp) => {
            const isOpen = expanded === exp.id
            const runs = exp.runs ?? []
            return (
              <Panel key={exp.id}>
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors rounded-t-xl"
                  style={{ ':hover': { background: 'var(--surface)' } } as any}
                  onClick={() => setExpanded(isOpen ? null : exp.id)}
                >
                  {isOpen
                    ? <ChevronDown size={14} style={{ color: 'var(--accent)' }} />
                    : <ChevronRight size={14} className="text-text-dim" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-text-bright">{exp.name}</p>
                    {exp.description && <p className="font-mono text-[10px] text-text-dim mt-0.5">{exp.description}</p>}
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-mono text-[9px] text-text-dim">{runs.length} {t('runs')}</span>
                    <span className="font-mono text-[9px] text-text-dim">
                      {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm(t('deleteExperiment'))) deleteMut.mutate(exp.id) }}
                      className="p-1.5 rounded transition-all text-text-dim hover:text-danger"
                      style={{ ':hover': { background: 'color-mix(in srgb, var(--danger) 10%, transparent)' } } as any}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {/* Run launcher */}
                    <div
                      className="px-5 py-4 flex items-end gap-3"
                      style={{ background: 'color-mix(in srgb, var(--bg) 50%, transparent)', borderBottom: '1px solid var(--border)' }}
                    >
                      <div className="flex-1">
                        <label className="font-mono text-[9px] uppercase tracking-wider block mb-1 text-text-dim">{t('selectScenario')}</label>
                        <select
                          value={selectedScenario[exp.id] ?? ''}
                          onChange={e => setSelectedScenario(p => ({ ...p, [exp.id]: e.target.value }))}
                          style={{ ...inputStyle, width: '100%' }}
                        >
                          <option value="">— {t('selectScenario')} —</option>
                          {scenarios.map(s => (
                            <option key={s.id} value={s.id}>{s.name} · {s.msfModule}</option>
                          ))}
                        </select>
                      </div>
                      <Btn
                        size="sm"
                        disabled={!selectedScenario[exp.id] || runMut.isPending}
                        onClick={() => runMut.mutate({ expId: exp.id, scId: selectedScenario[exp.id] })}
                      >
                        <Play size={11} /> {t('launchRun')}
                      </Btn>
                    </div>

                    {runs.length === 0 ? (
                      <p className="font-mono text-[10px] text-text-dim text-center py-6">{t('noRunsYet')}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              {[t('runId'), t('status'), t('attack'), t('started'), t('duration'), ''].map(h => (
                                <th key={h} className="px-5 py-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-text-dim">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...runs]
                              .sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime())
                              .map(run => {
                                const dur = run.startedAt && run.finishedAt
                                  ? Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
                                  : null
                                return (
                                  <tr key={run.id} style={{ borderBottom: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                                    <td className="px-5 py-2.5 font-mono text-xs text-text-dim">{run.id.slice(0, 8)}…</td>
                                    <td className="px-5 py-2.5"><StatusBadge status={run.status} /></td>
                                    <td className="px-5 py-2.5 font-mono text-xs">
                                      {run.attackSuccess === true ? <span style={{ color: 'var(--danger)' }}>✓</span>
                                        : run.attackSuccess === false ? <span style={{ color: 'var(--accent-2)' }}>✗</span>
                                        : <span className="text-text-dim">—</span>}
                                    </td>
                                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">
                                      {run.startedAt ? formatDistanceToNow(new Date(run.startedAt), { addSuffix: true }) : '—'}
                                    </td>
                                    <td className="px-5 py-2.5 font-mono text-[10px] text-text-dim">
                                      {dur !== null ? `${dur}s` : '—'}
                                    </td>
                                    <td className="px-5 py-2.5">
                                      <Link to={`/runs/${run.id}`}
                                        className="inline-flex items-center gap-1 font-mono text-[10px] transition-colors hover:underline"
                                        style={{ color: 'var(--accent)' }}
                                      >
                                        <ExternalLink size={10} /> {t('report')}
                                      </Link>
                                    </td>
                                  </tr>
                                )
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            )
          })}
        </div>
      )}
    </div>
  )
}
