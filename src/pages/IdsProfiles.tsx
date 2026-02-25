import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { idsProfilesApi } from '../api/client'
import { IdsProfile } from '../types'
import Panel from '../components/Panel'
import PageHeader from '../components/PageHeader'
import Btn from '../components/Btn'
import { useI18n } from '../i18n'
import { Plus, Trash2, Shield, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function IdsProfiles() {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [ruleset, setRuleset] = useState('')

  const { data: profiles = [], isLoading } = useQuery<IdsProfile[]>({
    queryKey: ['ids-profiles'],
    queryFn: () => idsProfilesApi.list(),
  })

  const createMut = useMutation({
    mutationFn: () => idsProfilesApi.create(name, ruleset),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ids-profiles'] }); setShowCreate(false); setName(''); setRuleset('') },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => idsProfilesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ids-profiles'] }),
  })

  const inp = (val: string, setter: (v: string) => void, placeholder?: string) => (
    <input value={val} onChange={e => setter(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-bright)' }}
    />
  )

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('idsProfiles')} sub="// suricata ruleset configurations"
        actions={<Btn size="sm" onClick={() => setShowCreate(!showCreate)}><Plus size={12} /> {t('newProfile')}</Btn>}
      />

      {showCreate && (
        <Panel className="mb-5 p-5" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>// configure ids profile</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div><label className="font-mono text-[9px] uppercase tracking-wider block mb-1 text-text-dim">{t('profileName')} *</label>{inp(name, setName, 'default')}</div>
            <div><label className="font-mono text-[9px] uppercase tracking-wider block mb-1 text-text-dim">{t('ruleset')} *</label>{inp(ruleset, setRuleset, 'default-suricata')}</div>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => createMut.mutate()} disabled={!name || !ruleset || createMut.isPending}>
              {createMut.isPending ? t('creating') : t('createProfile')}
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowCreate(false)}>{t('cancel')}</Btn>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-xs text-text-dim mb-3">{t('noProfiles')}</p>
          <Btn size="sm" onClick={() => setShowCreate(true)}><Plus size={12} /> {t('createProfile')}</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map(p => (
            <Panel key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}>
                    <Shield size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-text-bright">{p.name}</p>
                    <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">IDS PROFILE</p>
                  </div>
                </div>
                <button onClick={() => { if (confirm(t('deleteProfile'))) deleteMut.mutate(p.id) }}
                  className="p-1.5 rounded text-text-dim transition-all hover:text-danger">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="space-y-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Database size={10} className="text-text-dim" />
                  <span className="font-mono text-[9px] text-text-dim">{t('ruleset')}:</span>
                  <code className="font-mono text-[10px]" style={{ color: 'var(--accent-2)' }}>{p.ruleset}</code>
                </div>
                <p className="font-mono text-[9px] text-text-dim">
                  {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                </p>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
