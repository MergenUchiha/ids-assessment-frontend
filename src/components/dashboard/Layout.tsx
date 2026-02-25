import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/',            icon: '▣', label: 'Dashboard'  },
  { to: '/experiments', icon: '⬡', label: 'Experiments'},
  { to: '/runs',        icon: '▶', label: 'Runs'       },
  { to: '/scenarios',   icon: '⚡', label: 'Scenarios'  },
  { to: '/alerts',      icon: '⚠', label: 'Alerts'     },
  { to: '/ids-profiles',icon: '◎', label: 'IDS Profiles'},
];

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#080c12] text-gray-100 overflow-hidden" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-white/5 bg-[#0a0e17] transition-all duration-300 ${sidebarOpen ? 'w-52' : 'w-14'}`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5">
          <div className="w-7 h-7 rounded-md border border-cyan-400/40 flex items-center justify-center bg-cyan-400/5 flex-shrink-0">
            <span className="text-cyan-400 text-sm">⬡</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <span className="text-white font-bold text-sm">IDS</span>
              <span className="text-cyan-400 font-bold text-sm">Lab</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2 rounded-lg text-xs transition-all group ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                    : 'text-gray-500 hover:text-gray-300 border border-transparent hover:bg-white/5'
                }`
              }
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{icon}</span>
              {sidebarOpen && <span className="tracking-wider">{label.toUpperCase()}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/5 space-y-1">
          <button onClick={() => setSidebarOpen(v => !v)}
            className="w-full flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-gray-400 text-xs rounded border border-transparent hover:border-white/10 transition-all">
            <span className="flex-shrink-0 w-5 text-center">{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>COLLAPSE</span>}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-red-400 text-xs rounded border border-transparent hover:border-red-900/40 transition-all">
            <span className="flex-shrink-0 w-5 text-center">⏏</span>
            {sidebarOpen && <span>LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 bg-[#080c12]/90 backdrop-blur flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-xs text-gray-600 font-mono">
            IDS Assessment Platform <span className="text-cyan-400">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
