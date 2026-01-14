import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Test {
  id: string;
  scenarioId: string;
  scenario?: { name: string };
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'failed';
  totalAttacks: number;
  detectedAttacks: number;
  missedAttacks: number;
  falsePositives: number;
}

interface RecentTestsProps {
  tests: Test[];
}

const RecentTests = ({ tests }: RecentTestsProps) => {
  const { t } = useTranslation();

  const getStatusIcon = (status: Test['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="w-5 h-5 text-blue-600 dark:text-cyber-blue animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-cyber-green" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-cyber-red" />;
    }
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 dark:bg-cyber-blue/20 text-blue-600 dark:text-cyber-blue border-blue-200 dark:border-cyber-blue/30';
      case 'completed':
        return 'bg-green-50 dark:bg-cyber-green/20 text-green-600 dark:text-cyber-green border-green-200 dark:border-cyber-green/30';
      case 'failed':
        return 'bg-red-50 dark:bg-cyber-red/20 text-red-600 dark:text-cyber-red border-red-200 dark:border-cyber-red/30';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.recentTests')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.recentTestsSubtitle')}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.scenario')}</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.status')}</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.totalAttacks')}</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.detected')}</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.missed')}</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.falsePositive')}</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-400">{t('dashboard.started')}</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {test.scenario?.name || `Scenario ${test.scenarioId.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500">ID: {test.id.slice(0, 8)}...</p>
                </td>
                <td className="py-4 px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(test.status)}`}>
                    {getStatusIcon(test.status)}
                    <span className="text-sm font-medium capitalize">{t(`common.${test.status}`)}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-900 dark:text-white font-medium">{test.totalAttacks}</td>
                <td className="py-4 px-4 text-right">
                  <span className="text-green-600 dark:text-cyber-green font-medium">{test.detectedAttacks}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-red-600 dark:text-cyber-red font-medium">{test.missedAttacks}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-yellow-600 dark:text-cyber-yellow font-medium">{test.falsePositives}</span>
                </td>
                <td className="py-4 px-4 text-right text-gray-600 dark:text-gray-400 text-sm">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(test.startedAt), { addSuffix: true })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tests.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            {t('common.noData')}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTests;