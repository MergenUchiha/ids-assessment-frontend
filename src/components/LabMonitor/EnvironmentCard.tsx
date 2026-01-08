import { LabEnvironment } from '../../types';
import { Monitor, Target, Shield, Cpu, MemoryStick, Wifi } from 'lucide-react';

interface EnvironmentCardProps {
  environment: LabEnvironment;
}

const EnvironmentCard = ({ environment }: EnvironmentCardProps) => {
  const getTypeIcon = (type: LabEnvironment['type']) => {
    switch (type) {
      case 'attacker':
        return <Monitor className="w-6 h-6 text-cyber-red" />;
      case 'target':
        return <Target className="w-6 h-6 text-cyber-blue" />;
      case 'ids':
        return <Shield className="w-6 h-6 text-cyber-purple" />;
    }
  };

  const getTypeColor = (type: LabEnvironment['type']) => {
    switch (type) {
      case 'attacker':
        return 'border-cyber-red/30 bg-cyber-red/5';
      case 'target':
        return 'border-cyber-blue/30 bg-cyber-blue/5';
      case 'ids':
        return 'border-cyber-purple/30 bg-cyber-purple/5';
    }
  };

  const getStatusColor = (status: LabEnvironment['status']) => {
    switch (status) {
      case 'online':
        return 'bg-cyber-green text-cyber-green border-cyber-green/30';
      case 'offline':
        return 'bg-gray-500 text-gray-400 border-gray-500/30';
      case 'busy':
        return 'bg-cyber-yellow text-cyber-yellow border-cyber-yellow/30';
    }
  };

  const getResourceColor = (value: number) => {
    if (value >= 80) return 'bg-cyber-red';
    if (value >= 60) return 'bg-cyber-yellow';
    return 'bg-cyber-green';
  };

  return (
    <div className={`glass-card p-6 rounded-xl border ${getTypeColor(environment.type)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-dark rounded-lg">
            {getTypeIcon(environment.type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{environment.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{environment.type}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(environment.status)}`}>
          {environment.status === 'online' && <div className="w-2 h-2 rounded-full bg-current inline-block mr-1 animate-pulse" />}
          {environment.status}
        </div>
      </div>

      {/* System Info */}
      <div className="space-y-2 mb-4 p-3 bg-cyber-dark/30 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">IP Address</span>
          <span className="text-white font-mono">{environment.ip}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Operating System</span>
          <span className="text-white">{environment.os}</span>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="space-y-3">
        {/* CPU */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Cpu className="w-4 h-4" />
              <span>CPU</span>
            </div>
            <span className="text-sm text-white font-medium">{Math.round(environment.cpu)}%</span>
          </div>
          <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getResourceColor(environment.cpu)}`}
              style={{ width: `${environment.cpu}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MemoryStick className="w-4 h-4" />
              <span>Memory</span>
            </div>
            <span className="text-sm text-white font-medium">{Math.round(environment.memory)}%</span>
          </div>
          <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getResourceColor(environment.memory)}`}
              style={{ width: `${environment.memory}%` }}
            />
          </div>
        </div>

        {/* Network */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Wifi className="w-4 h-4" />
              <span>Network</span>
            </div>
            <span className="text-sm text-white font-medium">{Math.round(environment.network)}%</span>
          </div>
          <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getResourceColor(environment.network)}`}
              style={{ width: `${environment.network}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;