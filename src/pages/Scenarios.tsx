import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import ScenarioCard from '../components/Scenarios/ScenarioCard';
import CreateScenarioModal from '../components/Scenarios/CreateScenarioModal';
import { mockScenarios } from '../utils/mockData';
import { AttackScenario } from '../types';

const Scenarios = () => {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<AttackScenario[]>(mockScenarios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredScenarios = filterStatus === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.status === filterStatus);

  const handleCreateScenario = (scenario: Omit<AttackScenario, 'id' | 'createdAt'>) => {
    const newScenario: AttackScenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setScenarios([...scenarios, newScenario]);
    setIsModalOpen(false);
  };

  const handleRunScenario = (id: string) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, status: 'running' as const } : s
    ));
    
    // Simulate test completion
    setTimeout(() => {
      setScenarios(prev => prev.map(s => 
        s.id === id ? { ...s, status: 'completed' as const } : s
      ));
    }, 5000);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const statusCounts = {
    all: scenarios.length,
    draft: scenarios.filter(s => s.status === 'draft').length,
    ready: scenarios.filter(s => s.status === 'ready').length,
    running: scenarios.filter(s => s.status === 'running').length,
    completed: scenarios.filter(s => s.status === 'completed').length,
  };

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

      {filteredScenarios.length === 0 && (
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