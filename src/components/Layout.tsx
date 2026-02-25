import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, Shield, Terminal, Bell,
  LogOut, Activity, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/experiments', label: 'Experiments', icon: FlaskConical },
  { to: '/scenarios', label: 'Scenarios', icon: Terminal },
  { to: '/ids-profiles', label: 'IDS Profiles', icon: Shield },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-bg-2 border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center animate-pulse-accent">
              <Activity size={14} className="text-bg" />
            </div>
            <div>
              <p className="font-display font-700 text-sm text-text-bright tracking-widest uppercase">IDS Lab</p>
              <p className="font-mono text-[9px] text-text-dim tracking-wider">ASSESSMENT v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body transition-all duration-150 group',
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-dim hover:text-text hover:bg-surface'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} className={isActive ? 'text-accent' : ''} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={10} className="text-accent" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-text-dim hover:text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-bg scanline">
        {children}
      </main>
    </div>
  )
}
