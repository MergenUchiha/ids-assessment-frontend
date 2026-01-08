import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Clock,
  Zap
} from 'lucide-react';
import StatsCard, { StatsCardProps } from '../components/Dashboard/StatsCard';
import AttackVisualization from '../components/Dashboard/AttackVisualization';
import RecentTests from '../components/Dashboard/RecentTests';
import LiveFeed from '../components/Dashboard/LiveFeed';
import { mockDashboardStats, mockTests } from '../utils/mockData';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(mockDashboardStats);
  const [activeAttacks, setActiveAttacks] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalAttacks: prev.totalAttacks + Math.floor(Math.random() * 3),
        detectedAttacks: prev.detectedAttacks + Math.floor(Math.random() * 2),
      }));
      
      setActiveAttacks(Math.floor(Math.random() * 5));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statsCards: StatsCardProps[] = [
    {
      title: t('dashboard.totalTests'),
      value: stats.totalTests,
      icon: Activity,
      color: 'purple',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: t('dashboard.detectionRate'),
      value: `${stats.detectionRate.toFixed(1)}%`,
      icon: Shield,
      color: 'green',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      title: t('dashboard.falsePositives'),
      value: `${stats.falsePositiveRate.toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'yellow',
      trend: '-2.1%',
      trendUp: false,
    },
    {
      title: t('dashboard.avgDetectionTime'),
      value: `${stats.avgDetectionTime}ms`,
      icon: Clock,
      color: 'blue',
      trend: '-15%',
      trendUp: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Active Attacks Banner */}
      {activeAttacks > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-cyber-red/30 p-4 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-red/20 rounded-lg">
              <Zap className="w-6 h-6 text-cyber-red animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{t('dashboard.activeAttacks')}</h3>
              <p className="text-gray-400 text-sm">
                {t('dashboard.activeAttacksMsg', { count: activeAttacks })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Visualization - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AttackVisualization />
        </div>

        {/* Live Feed - Takes 1 column */}
        <div>
          <LiveFeed />
        </div>
      </div>

      {/* Recent Tests */}
      <RecentTests tests={mockTests} />
    </div>
  );
};

export default Dashboard;