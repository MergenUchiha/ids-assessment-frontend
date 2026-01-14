import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, AlertTriangle } from 'lucide-react';
import ScenarioCard from '../components/Scenarios/ScenarioCard';
import CreateScenarioModal from '../components/Scenarios/CreateScenarioModal';
import { scenariosAPI } from '../services/api';
import { AttackScenario } from '../types';

const Scenarios = () => {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<AttackScenario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scenarios
  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await scenariosAPI.getAll(filterStatus === 'all' ? undefined : filterStatus);
      setScenarios(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [filterStatus]);

  const filteredScenarios = scenarios;

  const handleCreateScenario = async (scenario: Omit<AttackScenario, 'id' | 'createdAt'>) => {
    try {
      await scenariosAPI.create(scenario);
      setIsModalOpen(false);
      fetchScenarios();
    } catch (err) {
      console.error('Failed to create scenario:', err);
      alert('Failed to create scenario');
    }
  };

  const handleRunScenario = async (id: string) => {
    try {
      await scenariosAPI.run(id);
      fetchScenarios();
    } catch (err) {
      console.error('Failed to run scenario:', err);
      alert('Failed to run scenario');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    
    try {
      await scenariosAPI.delete(id);
      fetchScenarios();
    } catch (err) {
      console.error('Failed to delete scenario:', err);
      alert('Failed to delete scenario');
    }
  };

  const statusCounts = {
    all: scenarios.length,
    draft: scenarios.filter(s => s.status === 'draft').length,
    ready: scenarios.filter(s => s.status === 'ready').length,
    running: scenarios.filter(s => s.status === 'running').length,
    completed: scenarios.filter(s => s.status === 'completed').length,
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('scenarios.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('scenarios.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-lg transition-colors neon-glow"
        >
          <Plus className="w-5 h-5" />
          {t('scenarios.createScenario')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 rounded-xl border border-cyber-red/30 bg-cyber-red/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-cyber-red" />
            <p className="text-gray-900 dark:text-white">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === status
                  ? 'bg-cyber-purple text-white'
                  : 'bg-gray-100 dark:bg-cyber-dark/50 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-cyber-dark'
              }`}
            >
              <span className="capitalize">{t(`common.${status}`)}</span>
              <span className="ml-2 text-sm opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ScenarioCard
              scenario={scenario}
              onRun={handleRunScenario}
              onDelete={handleDeleteScenario}
            />
          </motion.div>
        ))}
      </div>

      {filteredScenarios.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="glass-card p-12 rounded-xl border border-gray-200 dark:border-white/10 inline-block">
            <div className="w-16 h-16 bg-cyber-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-cyber-purple" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('scenarios.noScenarios')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('scenarios.createFirst')}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-lg transition-colors"
            >
              {t('scenarios.createScenario')}
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateScenario}
      />
    </div>
  );
};

export default Scenarios;