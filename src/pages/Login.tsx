import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n, type Lang } from '../i18n'
import { useTheme } from '../contexts/ThemeContext'
import { Shield, Lock, Mail, Sun, Moon } from 'lucide-react'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'tk', label: 'TK' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t, lang, setLang } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setErr(t('invalidCreds'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.025] scanline-bg pointer-events-none" />

      {/* Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 12%, transparent), transparent 70%)' }}
      />

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Lang switcher */}
        <div className="flex gap-1">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className="px-2 py-1 rounded text-[10px] font-mono transition-all"
              style={{
                background: lang === code ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-2)',
                color: lang === code ? 'var(--accent)' : 'var(--text-dim)',
                border: `1px solid ${lang === code ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded transition-all"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-fade-in px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              boxShadow: '0 0 32px color-mix(in srgb, var(--accent) 20%, transparent)',
            }}
          >
            <Shield className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="font-mono font-bold text-2xl tracking-widest uppercase text-text-bright">IDS Lab</h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim mt-1">{t('secureAccess')}</p>
        </div>

        <div
          className="rounded-2xl p-6 shadow-panel"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest mb-5" style={{ color: 'var(--accent)' }}>
            // authenticate
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest block mb-1.5 text-text-dim">{t('email')}</label>
              <div className="relative">
                <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full rounded-lg px-3 py-2.5 pl-9 text-sm font-mono focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-bright)',
                  }}
                  placeholder="admin@test.com"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest block mb-1.5 text-text-dim">{t('password')}</label>
              <div className="relative">
                <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full rounded-lg px-3 py-2.5 pl-9 text-sm font-mono focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-bright)',
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {err && (
              <p
                className="font-mono text-xs px-3 py-2 rounded-lg"
                style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)' }}
              >{err}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-mono text-sm uppercase tracking-widest transition-all disabled:opacity-50 shadow-accent-sm"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              {loading ? t('authenticating') : t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
