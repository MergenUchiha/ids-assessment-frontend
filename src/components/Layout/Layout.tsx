import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  Server, 
  FileText,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/scenarios', icon: Target, label: t('nav.scenarios') },
    { path: '/analytics', icon: BarChart3, label: t('nav.analytics') },
    { path: '/lab', icon: Server, label: t('nav.lab') },
    { path: '/reports', icon: FileText, label: t('nav.reports') },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'tk', name: 'Türkmen', flag: '🇹🇲' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-cyber-darker overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 dark:from-cyber-purple/20 dark:via-cyber-blue/20 dark:to-cyber-green/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-64 glass-card border-r border-gray-200 dark:border-cyber-purple/30 z-10"
          >
            <div className="flex flex-col h-full p-6">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-cyber-purple/20 rounded-lg neon-glow">
                  <Shield className="w-6 h-6 text-cyber-purple" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">IDS Assessment</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Metasploit Lab</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-cyber-purple/20 text-cyber-purple neon-glow'
                          : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Status Indicator */}
              <div className="mt-auto p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-cyber-green">{t('system.systemOnline')}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('system.allServices')}</p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="glass-card border-b border-gray-200 dark:border-cyber-purple/30 p-4 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              {/* Active Tests Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/30 rounded-full">
                <div className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('system.activeTests', { count: 2 })}</span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                title={theme === 'dark' ? t('system.lightTheme') : t('system.darkTheme')}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  title={t('system.language')}
                >
                  <Languages className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg overflow-hidden"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3 ${
                            i18n.language === lang.code ? 'bg-cyber-purple/10 text-cyber-purple' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-purple to-cyber-blue rounded-lg flex items-center justify-center font-bold text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;