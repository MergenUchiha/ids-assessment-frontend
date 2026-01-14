import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { testsAPI } from '../../services/api';

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

  useEffect(() => {
    // Fetch real test data
    const fetchTestEvents = async () => {
      try {
        const tests = await testsAPI.getAll();
        const recentTests = tests
          .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          .slice(0, 10);

        const events: FeedItem[] = [];

        for (const test of recentTests) {
          try {
            const results = await testsAPI.getResults(test.id);
            
            // Add test start event
            events.push({
              id: `start-${test.id}`,
              type: 'started',
              message: `Test started for scenario "${test.scenarioId}"`,
              timestamp: new Date(test.startedAt),
            });

            // Add detection events from results
            results.slice(0, 3).forEach((result, idx) => {
              events.push({
                id: `result-${test.id}-${idx}`,
                type: result.idsDetected ? 'detected' : 'missed',
                message: result.idsDetected 
                  ? `${result.exploitName} detected from ${result.sourceIP}`
                  : `${result.exploitName} missed from ${result.sourceIP}`,
                timestamp: new Date(result.timestamp),
                severity: result.severity,
              });
            });

            // Add completion event if finished
            if (test.finishedAt) {
              events.push({
                id: `complete-${test.id}`,
                type: 'completed',
                message: `Test completed: ${test.detectedAttacks}/${test.totalAttacks} detected`,
                timestamp: new Date(test.finishedAt),
              });
            }
          } catch (error) {
            console.error(`Error fetching results for test ${test.id}:`, error);
          }
        }

        // Sort by timestamp and take latest 10
        const sortedEvents = events
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setFeed(sortedEvents);
      } catch (error) {
        console.error('Error fetching test events:', error);
      }
    };

    fetchTestEvents();
    
    // Update every 5 seconds
    const interval = setInterval(fetchTestEvents, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'detected':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-cyber-green" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-cyber-red" />;
      case 'started':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-cyber-blue" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-purple-600 dark:text-cyber-purple" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-600 dark:border-l-cyber-red';
      case 'high':
        return 'border-l-yellow-600 dark:border-l-cyber-yellow';
      case 'medium':
        return 'border-l-blue-600 dark:border-l-cyber-blue';
      case 'low':
        return 'border-l-green-600 dark:border-l-cyber-green';
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
        <div className="w-2 h-2 bg-green-600 dark:bg-cyber-green rounded-full animate-pulse" />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
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
          <div className="text-center py-8 text-gray-600 dark:text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('dashboard.waitingEvents')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;