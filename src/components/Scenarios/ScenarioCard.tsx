import { AttackScenario } from '../../types';
import { useTranslation } from 'react-i18next';
import { Play, Trash2, Target, Monitor, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScenarioCardProps {
  scenario: AttackScenario;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

const ScenarioCard = ({ scenario, onRun, onDelete }: ScenarioCardProps) => {
  const { t } = useTranslation();

  const getStatusColor = (status: AttackScenario['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
      case 'ready':
        return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30';
      case 'running':
        return 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30';
      case 'completed':
        return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-cyber-purple/50 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-cyber-purple/20 rounded-lg group-hover:scale-110 transition-transform">
          <Target className="w-6 h-6 text-cyber-purple" />
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(scenario.status)}`}>
          {t(`common.${scenario.status}`)}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{scenario.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{scenario.description}</p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="px-2 py-1 bg-cyber-red/10 text-cyber-red rounded text-xs font-medium">
            {scenario.exploitType}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Monitor className="w-4 h-4" />
          <span>{scenario.targetOS}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Wifi className="w-4 h-4" />
          <span>{scenario.targetIP}:{scenario.targetPort}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
        <button
          onClick={() => onRun(scenario.id)}
          disabled={scenario.status === 'running'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {scenario.status === 'running' ? t('common.running') : t('scenarios.runTest')}
        </button>
        
        <button
          onClick={() => onDelete(scenario.id)}
          className="px-4 py-2 bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ScenarioCard;