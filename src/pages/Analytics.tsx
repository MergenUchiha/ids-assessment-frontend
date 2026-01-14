import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import DetectionRateChart from '../components/Analytics/DetectionRateChart';
import ExploitHeatmap from '../components/Analytics/ExploitHeatmap';
import PerformanceMetrics from '../components/Analytics/PerformanceMetrics';
import ROCCurve from '../components/Analytics/ROCCurve';
import { testsAPI } from '../services/api';

const Analytics = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const testsData = await testsAPI.getAll();
        setTests(testsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyber-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-cyber-red mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-bold mb-2">{t('common.error')}</p>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('analytics.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('analytics.subtitle')}</p>
      </div>

      {/* Performance Summary */}
      <PerformanceMetrics tests={tests} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Rate Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DetectionRateChart tests={tests} />
        </motion.div>

        {/* ROC Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ROCCurve />
        </motion.div>
      </div>

      {/* Exploit Heatmap - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ExploitHeatmap tests={tests} />
      </motion.div>
    </div>
  );
};

export default Analytics;