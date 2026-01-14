import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import EnvironmentCard from '../components/LabMonitor/EnvironmentCard';
import IDSConfigPanel from '../components/LabMonitor/IDSConfigPanel';
import NetworkTopology from '../components/LabMonitor/NetworkTopology';
import { labAPI } from '../services/api';
import { LabEnvironment, IDSConfiguration } from '../types';

const LabMonitor = () => {
  const { t } = useTranslation();
  const [environments, setEnvironments] = useState<LabEnvironment[]>([]);
  const [idsConfigs, setIdsConfigs] = useState<IDSConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [envsData, idsData] = await Promise.all([
        labAPI.getEnvironments(),
        labAPI.getIDSConfigs(),
      ]);
      
      setEnvironments(envsData);
      setIdsConfigs(idsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch lab data:', err);
      setError('Failed to load lab data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // УДАЛЕНО: автообновление каждые 5 секунд
    // Теперь обновление только по кнопке или после действий
  }, []);

  const handleManualRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 dark:border-cyber-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 dark:text-cyber-red mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-bold mb-2">{t('common.error')}</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Manual Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('lab.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('lab.subtitle')}</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-cyber-purple/20 hover:bg-purple-200 dark:hover:bg-cyber-purple/30 text-purple-600 dark:text-cyber-purple rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Network Topology */}
      <NetworkTopology environments={environments} />

      {/* Environment Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('lab.environmentStatus')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {environments.map((env, index) => (
            <motion.div
              key={env.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnvironmentCard environment={env} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* IDS Configuration */}
      <IDSConfigPanel 
        configs={idsConfigs} 
        onUpdate={() => fetchData(true)} 
      />
    </div>
  );
};

export default LabMonitor;