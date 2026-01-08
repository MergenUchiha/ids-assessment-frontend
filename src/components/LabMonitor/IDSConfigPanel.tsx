import { IDSConfiguration } from '../../types';
import { Shield, CheckCircle, XCircle, Settings } from 'lucide-react';

interface IDSConfigPanelProps {
  configs: IDSConfiguration[];
}

const IDSConfigPanel = ({ configs }: IDSConfigPanelProps) => {
  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high':
        return 'text-cyber-red bg-cyber-red/20 border-cyber-red/30';
      case 'medium':
        return 'text-cyber-yellow bg-cyber-yellow/20 border-cyber-yellow/30';
      case 'low':
        return 'text-cyber-green bg-cyber-green/20 border-cyber-green/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">IDS Configuration</h2>
          <p className="text-gray-400 text-sm">Intrusion Detection System settings and status</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple rounded-lg transition-colors border border-cyber-purple/30">
          <Settings className="w-4 h-4" />
          Configure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => (
          <div
            key={config.id}
            className="p-6 bg-cyber-dark/30 rounded-lg border border-white/5 hover:border-cyber-purple/30 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.status === 'active' ? 'bg-cyber-green/20' : 'bg-gray-500/20'}`}>
                  <Shield className={`w-6 h-6 ${config.status === 'active' ? 'text-cyber-green' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{config.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{config.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {config.status === 'active' ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-cyber-green" />
                    <span className="text-sm text-cyber-green font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-400 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Version</span>
                <span className="text-sm text-white font-mono">{config.version}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Active Rules</span>
                <span className="text-sm text-white font-bold">{config.rules.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Sensitivity</span>
                <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getSensitivityColor(config.sensitivity)}`}>
                  {config.sensitivity}
                </span>
              </div>
            </div>

            {/* Rule Categories */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">Rule Categories</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-cyber-purple/10 text-cyber-purple text-xs rounded">Exploit</span>
                <span className="px-2 py-1 bg-cyber-blue/10 text-cyber-blue text-xs rounded">Malware</span>
                <span className="px-2 py-1 bg-cyber-green/10 text-cyber-green text-xs rounded">Policy</span>
                <span className="px-2 py-1 bg-cyber-yellow/10 text-cyber-yellow text-xs rounded">Scan</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {config.status === 'active' ? (
                <button className="flex-1 px-3 py-2 bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red text-sm rounded-lg transition-colors border border-cyber-red/30">
                  Stop
                </button>
              ) : (
                <button className="flex-1 px-3 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green text-sm rounded-lg transition-colors border border-cyber-green/30">
                  Start
                </button>
              )}
              <button className="flex-1 px-3 py-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-blue text-sm rounded-lg transition-colors border border-cyber-blue/30">
                Edit Rules
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IDSConfigPanel;