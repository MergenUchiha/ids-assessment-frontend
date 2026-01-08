import { LabEnvironment } from '../../types';
import { Monitor, Target, Shield, Network } from 'lucide-react';

interface NetworkTopologyProps {
  environments: LabEnvironment[];
}

const NetworkTopology = ({ environments }: NetworkTopologyProps) => {
  const attacker = environments.find(e => e.type === 'attacker');
  const target = environments.find(e => e.type === 'target');
  const ids = environments.find(e => e.type === 'ids');

  const getStatusDot = (status?: string) => {
    const color = status === 'online' ? 'bg-cyber-green' : status === 'busy' ? 'bg-cyber-yellow' : 'bg-gray-500';
    return <div className={`w-3 h-3 rounded-full ${color} animate-pulse`} />;
  };

  return (
    <div className="glass-card p-8 rounded-xl border border-white/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Network Topology</h2>
        <p className="text-gray-400 text-sm">Lab infrastructure overview</p>
      </div>

      <div className="relative h-80 bg-cyber-dark/30 rounded-lg border border-white/5 p-8">
        {/* Internet/Router Node */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-700/20 border-2 border-gray-500 rounded-lg">
              <Network className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-center mt-2 text-gray-400">Network</p>
            <p className="text-xs text-center text-gray-500">192.168.1.0/24</p>
          </div>
        </div>

        {/* Attacker Node */}
        {attacker && (
          <div className="absolute bottom-8 left-16">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-cyber-red/20 border-2 border-cyber-red rounded-lg neon-glow relative">
                <Monitor className="w-8 h-8 text-cyber-red" />
                <div className="absolute -top-2 -right-2">
                  {getStatusDot(attacker.status)}
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-400">{attacker.name}</p>
              <p className="text-xs text-center text-gray-500">{attacker.ip}</p>
              <div className="mt-1 px-2 py-0.5 bg-cyber-red/20 text-cyber-red text-xs rounded">
                Attacker
              </div>
            </div>
          </div>
        )}

        {/* IDS Node */}
        {ids && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-cyber-purple/20 border-2 border-cyber-purple rounded-lg neon-glow animate-pulse-slow relative">
                <Shield className="w-8 h-8 text-cyber-purple" />
                <div className="absolute -top-2 -right-2">
                  {getStatusDot(ids.status)}
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-400">{ids.name}</p>
              <p className="text-xs text-center text-gray-500">{ids.ip}</p>
              <div className="mt-1 px-2 py-0.5 bg-cyber-purple/20 text-cyber-purple text-xs rounded">
                IDS Sensor
              </div>
            </div>
          </div>
        )}

        {/* Target Node */}
        {target && (
          <div className="absolute bottom-8 right-16">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-cyber-blue/20 border-2 border-cyber-blue rounded-lg neon-glow relative">
                <Target className="w-8 h-8 text-cyber-blue" />
                <div className="absolute -top-2 -right-2">
                  {getStatusDot(target.status)}
                </div>
              </div>
              <p className="text-xs text-center mt-2 text-gray-400">{target.name}</p>
              <p className="text-xs text-center text-gray-500">{target.ip}</p>
              <div className="mt-1 px-2 py-0.5 bg-cyber-blue/20 text-cyber-blue text-xs rounded">
                Target
              </div>
            </div>
          </div>
        )}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Router to Attacker */}
          <line
            x1="50%"
            y1="20%"
            x2="20%"
            y2="75%"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* Router to IDS */}
          <line
            x1="50%"
            y1="20%"
            x2="50%"
            y2="75%"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* Router to Target */}
          <line
            x1="50%"
            y1="20%"
            x2="80%"
            y2="75%"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse" />
          <span className="text-gray-400">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyber-yellow rounded-full animate-pulse" />
          <span className="text-gray-400">Busy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full" />
          <span className="text-gray-400">Offline</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          Live topology updates every 2s
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;