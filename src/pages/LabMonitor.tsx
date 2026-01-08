import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EnvironmentCard from '../components/LabMonitor/EnvironmentCard';
import IDSConfigPanel from '../components/LabMonitor/IDSConfigPanel';
import NetworkTopology from '../components/LabMonitor/NetworkTopology';
import { mockLabEnvironments, mockIDSConfigs } from '../utils/mockData';
import { LabEnvironment } from '../types';

const LabMonitor = () => {
  const [environments, setEnvironments] = useState<LabEnvironment[]>(mockLabEnvironments);

  // Simulate resource usage updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEnvironments(prev => prev.map(env => ({
        ...env,
        cpu: Math.min(100, Math.max(0, env.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(0, env.memory + (Math.random() - 0.5) * 8)),
        network: Math.min(100, Math.max(0, env.network + (Math.random() - 0.5) * 15)),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Lab Environment Monitor</h1>
        <p className="text-gray-400">Real-time monitoring of lab infrastructure and IDS configuration</p>
      </div>

      {/* Network Topology */}
      <NetworkTopology environments={environments} />

      {/* Environment Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Environment Status</h2>
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
      <IDSConfigPanel configs={mockIDSConfigs} />
    </div>
  );
};

export default LabMonitor;