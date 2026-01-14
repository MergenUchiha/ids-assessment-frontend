import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Monitor, Shield, Target, Wifi } from 'lucide-react';
import { testsAPI } from '../../services/api';

interface AttackPacket {
  id: string;
  fromX: number;
  toX: number;
  detected: boolean;
}

const AttackVisualization = () => {
  const { t } = useTranslation();
  const [packets, setPackets] = useState<AttackPacket[]>([]);
  const [detectionCount, setDetectionCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);

  useEffect(() => {
    // Fetch real-time test results
    const fetchTestResults = async () => {
      try {
        const tests = await testsAPI.getAll();
        const runningTests = tests.filter(t => t.status === 'running');
        
        if (runningTests.length > 0) {
          // Calculate totals from running tests
          const totalDetected = runningTests.reduce((sum, test) => sum + test.detectedAttacks, 0);
          const totalMissed = runningTests.reduce((sum, test) => sum + test.missedAttacks, 0);
          
          setDetectionCount(totalDetected);
          setMissedCount(totalMissed);
        }
      } catch (error) {
        console.error('Error fetching test results:', error);
      }
    };

    fetchTestResults();
    const dataInterval = setInterval(fetchTestResults, 5000);

    // Animate packets
    const packetInterval = setInterval(() => {
      const detected = Math.random() > 0.2;
      const newPacket: AttackPacket = {
        id: `packet-${Date.now()}`,
        fromX: 0,
        toX: 100,
        detected,
      };

      setPackets(prev => [...prev.slice(-4), newPacket]);
      
      if (detected) {
        setDetectionCount(prev => prev + 1);
      } else {
        setMissedCount(prev => prev + 1);
      }
    }, 2000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(packetInterval);
    };
  }, []);

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.networkViz')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.networkVizSubtitle')}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.detected')}: {detectionCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-red rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.missed')}: {missedCount}</span>
          </div>
        </div>
      </div>

      {/* Network Topology */}
      <div className="relative h-64 bg-gray-100 dark:bg-cyber-dark/50 rounded-lg border border-gray-200 dark:border-white/5 p-8">
        {/* Attacker Node */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="p-4 bg-red-100 dark:bg-cyber-red/20 border-2 border-red-500 dark:border-cyber-red rounded-lg">
              <Monitor className="w-8 h-8 text-red-600 dark:text-cyber-red" />
            </div>
            <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-400 font-medium">{t('dashboard.attacker')}</p>
            <p className="text-xs text-center text-gray-600 dark:text-gray-500">192.168.1.50</p>
          </div>
        </div>

        {/* IDS Node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="p-4 bg-purple-100 dark:bg-cyber-purple/20 border-2 border-purple-500 dark:border-cyber-purple rounded-lg animate-pulse-slow">
              <Shield className="w-8 h-8 text-purple-600 dark:text-cyber-purple" />
            </div>
            <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-400 font-medium">{t('dashboard.idsSensor')}</p>
            <p className="text-xs text-center text-gray-600 dark:text-gray-500">192.168.1.10</p>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 dark:bg-cyber-green rounded-full border-2 border-white dark:border-cyber-dark" />
          </div>
        </div>

        {/* Target Node */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="p-4 bg-blue-100 dark:bg-cyber-blue/20 border-2 border-blue-500 dark:border-cyber-blue rounded-lg">
              <Target className="w-8 h-8 text-blue-600 dark:text-cyber-blue" />
            </div>
            <p className="text-xs text-center mt-2 text-gray-700 dark:text-gray-400 font-medium">{t('dashboard.target')}</p>
            <p className="text-xs text-center text-gray-600 dark:text-gray-500">192.168.1.100</p>
          </div>
        </div>

        {/* Animated Attack Packets */}
        <AnimatePresence>
          {packets.map((packet, index) => (
            <motion.div
              key={packet.id}
              initial={{ left: '8rem', opacity: 0 }}
              animate={{ 
                left: 'calc(100% - 8rem)',
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 3,
                times: [0, 0.1, 0.9, 1],
              }}
              className="absolute top-1/2"
              style={{ 
                top: `calc(50% + ${index * 8 - 12}px)`,
              }}
            >
              <div className="flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${packet.detected ? 'text-green-600 dark:text-cyber-green' : 'text-red-600 dark:text-cyber-red'}`} />
                <div className={`h-1 w-12 ${packet.detected ? 'bg-green-600 dark:bg-cyber-green' : 'bg-red-600 dark:bg-cyber-red'} rounded-full`} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="25%"
            y1="50%"
            x2="50%"
            y2="50%"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1="50%"
            y1="50%"
            x2="75%"
            y2="50%"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-green-600 dark:bg-cyber-green rounded" />
          <span>{t('dashboard.detected')} Attack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-red-600 dark:bg-cyber-red rounded" />
          <span>{t('dashboard.missed')} Attack</span>
        </div>
      </div>
    </div>
  );
};

export default AttackVisualization;