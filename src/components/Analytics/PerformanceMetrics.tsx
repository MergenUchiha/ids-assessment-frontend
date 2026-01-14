import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { testsAPI } from '../../services/api';

interface Metrics {
  truePositiveRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  precision: number;
  totalAttacks: number;
  detectedAttacks: number;
  missedAttacks: number;
  falsePositives: number;
}

const PerformanceMetrics = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<Metrics>({
    truePositiveRate: 0,
    falsePositiveRate: 0,
    falseNegativeRate: 0,
    precision: 0,
    totalAttacks: 0,
    detectedAttacks: 0,
    missedAttacks: 0,
    falsePositives: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const tests = await testsAPI.getAll();

        const totalAttacks = tests.reduce((sum, test) => sum + test.totalAttacks, 0);
        const detectedAttacks = tests.reduce((sum, test) => sum + test.detectedAttacks, 0);
        const missedAttacks = tests.reduce((sum, test) => sum + test.missedAttacks, 0);
        const falsePositives = tests.reduce((sum, test) => sum + test.falsePositives, 0);

        const truePositiveRate = totalAttacks > 0 ? (detectedAttacks / totalAttacks) * 100 : 0;
        const falsePositiveRate = totalAttacks > 0 ? (falsePositives / totalAttacks) * 100 : 0;
        const falseNegativeRate = totalAttacks > 0 ? (missedAttacks / totalAttacks) * 100 : 0;
        const precision = (detectedAttacks + falsePositives) > 0 
          ? (detectedAttacks / (detectedAttacks + falsePositives)) * 100 
          : 0;

        setMetrics({
          truePositiveRate,
          falsePositiveRate,
          falseNegativeRate,
          precision,
          totalAttacks,
          detectedAttacks,
          missedAttacks,
          falsePositives,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const metricsList = [
    {
      label: t('analytics.truePositive'),
      value: `${metrics.truePositiveRate.toFixed(1)}%`,
      description: t('analytics.truePositiveDesc'),
      trend: '+3.5%',
      trendUp: true,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: t('analytics.falsePositive'),
      value: `${metrics.falsePositiveRate.toFixed(1)}%`,
      description: t('analytics.falsePositiveDesc'),
      trend: '-1.2%',
      trendUp: false,
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      label: t('analytics.falseNegative'),
      value: `${metrics.falseNegativeRate.toFixed(1)}%`,
      description: t('analytics.falseNegativeDesc'),
      trend: '+0.8%',
      trendUp: true,
      icon: XCircle,
      color: 'red',
    },
    {
      label: t('analytics.precision'),
      value: `${metrics.precision.toFixed(1)}%`,
      description: t('analytics.precisionDesc'),
      trend: '+2.3%',
      trendUp: true,
      icon: Target,
      color: 'purple',
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-green-600 dark:text-cyber-green bg-green-50 dark:bg-cyber-green/20 border-green-200 dark:border-cyber-green/30',
      yellow: 'text-yellow-600 dark:text-cyber-yellow bg-yellow-50 dark:bg-cyber-yellow/20 border-yellow-200 dark:border-cyber-yellow/30',
      red: 'text-red-600 dark:text-cyber-red bg-red-50 dark:bg-cyber-red/20 border-red-200 dark:border-cyber-red/30',
      purple: 'text-purple-600 dark:text-cyber-purple bg-purple-50 dark:bg-cyber-purple/20 border-purple-200 dark:border-cyber-purple/30',
    };
    return colors[color] || colors.purple;
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {t('analytics.performanceMetrics')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t('analytics.performanceSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsList.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`p-4 rounded-lg border ${getColorClass(metric.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5" />
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trendUp ? 'text-green-600 dark:text-cyber-green' : 'text-red-600 dark:text-cyber-red'
                }`}>
                  {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{metric.trend}</span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm font-medium mb-1">{metric.label}</div>
              <div className="text-xs opacity-70">{metric.description}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {metrics.totalAttacks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.totalAttacks')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-cyber-green mb-1">
            {metrics.detectedAttacks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.detected')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-cyber-red mb-1">
            {metrics.missedAttacks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.missed')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;