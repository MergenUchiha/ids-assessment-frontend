import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'detected' | 'missed' | 'started' | 'completed';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const LiveFeed = () => {
  const { t } = useTranslation();
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const messages = [
    { type: 'detected' as const, message: 'EternalBlue exploit detected', severity: 'critical' as const },
    { type: 'detected' as const, message: 'SQL injection attempt blocked', severity: 'high' as const },
    { type: 'missed' as const, message: 'Shellshock exploit missed', severity: 'high' as const },
    { type: 'detected' as const, message: 'Port scan detected from 192.168.1.50', severity: 'medium' as const },
    { type: 'started' as const, message: 'Test scenario "Log4Shell" started' },
    { type: 'completed' as const, message: 'Test scenario completed successfully' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newItem: FeedItem = {
        id: `feed-${Date.now()}`,
        ...randomMessage,
        timestamp: new Date(),
      };

      setFeed(prev => [newItem, ...prev.slice(0, 9)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'detected':
        return <CheckCircle className="w-5 h-5 text-cyber-green" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-cyber-red" />;
      case 'started':
        return <Clock className="w-5 h-5 text-cyber-blue" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-cyber-purple" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-cyber-red';
      case 'high':
        return 'border-l-cyber-yellow';
      case 'medium':
        return 'border-l-cyber-blue';
      case 'low':
        return 'border-l-cyber-green';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.liveActivity')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.liveActivitySubtitle')}</p>
        </div>
        <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`p-3 bg-gray-100 dark:bg-cyber-dark/50 rounded-lg border-l-4 ${getSeverityColor(item.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{item.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {feed.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('dashboard.waitingEvents')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;