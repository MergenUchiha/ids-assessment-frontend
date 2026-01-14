import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { IDSConfiguration } from '../../types';
import { Shield, CheckCircle, XCircle, Settings, X, Save } from 'lucide-react';
import { labAPI } from '../../services/api';

interface IDSConfigPanelProps {
  configs: IDSConfiguration[];
  onUpdate: () => void;
}

interface ConfigSettings {
  globalSensitivity: 'low' | 'medium' | 'high';
  alertThreshold: number;
  networkInterface: string;
  loggingEnabled: boolean;
  logLevel: 'info' | 'warning' | 'error';
  ruleUpdateSchedule: 'manual' | 'daily' | 'weekly';
  maxAlertRate: number;
  enableEmailAlerts: boolean;
  emailRecipient: string;
}

const IDSConfigPanel = ({ configs, onUpdate }: IDSConfigPanelProps) => {
  const { t } = useTranslation();
  const [editingRules, setEditingRules] = useState<{ id: string; name: string; currentRules: number } | null>(null);
  const [newRulesCount, setNewRulesCount] = useState('');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<IDSConfiguration | null>(null);
  
  const [configSettings, setConfigSettings] = useState<ConfigSettings>({
    globalSensitivity: 'medium',
    alertThreshold: 75,
    networkInterface: 'eth0',
    loggingEnabled: true,
    logLevel: 'warning',
    ruleUpdateSchedule: 'daily',
    maxAlertRate: 1000,
    enableEmailAlerts: false,
    emailRecipient: '',
  });

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high':
        return 'text-red-600 dark:text-cyber-red bg-red-50 dark:bg-cyber-red/20 border-red-200 dark:border-cyber-red/30';
      case 'medium':
        return 'text-yellow-600 dark:text-cyber-yellow bg-yellow-50 dark:bg-cyber-yellow/20 border-yellow-200 dark:border-cyber-yellow/30';
      case 'low':
        return 'text-green-600 dark:text-cyber-green bg-green-50 dark:bg-cyber-green/20 border-green-200 dark:border-cyber-green/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-500/20 border-gray-200 dark:border-gray-500/30';
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setUpdating(id);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await labAPI.updateIDSStatus(id, newStatus);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle IDS status:', error);
      alert(t('common.error') + ': Failed to update IDS status');
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenEditRules = (id: string, name: string, rules: number) => {
    setEditingRules({ id, name, currentRules: rules });
    setNewRulesCount(rules.toString());
  };

  const handleSaveRules = async () => {
    if (!editingRules) return;

    try {
      const rules = parseInt(newRulesCount);
      if (isNaN(rules) || rules < 0) {
        alert('Please enter a valid number');
        return;
      }

      setUpdating(editingRules.id);
      await labAPI.updateIDSRules(editingRules.id, rules);
      setEditingRules(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to update rules:', error);
      alert(t('common.error') + ': Failed to update rules');
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenConfigure = (config: IDSConfiguration) => {
    setSelectedConfig(config);
    // Load current settings (in real app, fetch from API)
    setConfigSettings({
      globalSensitivity: config.sensitivity as 'low' | 'medium' | 'high',
      alertThreshold: 75,
      networkInterface: 'eth0',
      loggingEnabled: true,
      logLevel: 'warning',
      ruleUpdateSchedule: 'daily',
      maxAlertRate: 1000,
      enableEmailAlerts: false,
      emailRecipient: '',
    });
    setConfigModalOpen(true);
  };

  const handleSaveConfiguration = async () => {
    if (!selectedConfig) return;

    try {
      setUpdating(selectedConfig.id);
      
      // In real app, this would be a dedicated API endpoint
      // For now, we'll just update sensitivity through the rules endpoint
      await labAPI.updateIDSRules(selectedConfig.id, selectedConfig.rules);
      
      console.log('Configuration saved:', {
        configId: selectedConfig.id,
        settings: configSettings,
      });
      
      setConfigModalOpen(false);
      onUpdate();
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert(t('common.error') + ': Failed to save configuration');
    } finally {
      setUpdating(null);
    }
  };

  const handleConfigChange = (key: keyof ConfigSettings, value: any) => {
    setConfigSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('lab.idsConfig')}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('lab.idsConfigSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config) => (
            <div
              key={config.id}
              className="p-6 bg-gray-100 dark:bg-cyber-dark/30 rounded-lg border border-gray-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-cyber-purple/30 transition-all relative"
            >
              {updating === config.id && (
                <div className="absolute inset-0 bg-black/20 dark:bg-white/5 rounded-lg flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-4 border-purple-600 dark:border-cyber-purple border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.status === 'active' ? 'bg-green-100 dark:bg-cyber-green/20' : 'bg-gray-200 dark:bg-gray-500/20'}`}>
                    <Shield className={`w-6 h-6 ${config.status === 'active' ? 'text-green-600 dark:text-cyber-green' : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{config.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-500 capitalize">{config.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.status === 'active' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-cyber-green" />
                      <span className="text-sm text-green-600 dark:text-cyber-green font-medium">{t('common.active')}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('common.inactive')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('lab.version')}</span>
                  <span className="text-sm text-gray-900 dark:text-white font-mono">{config.version}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('lab.activeRules')}</span>
                  <span className="text-sm text-gray-900 dark:text-white font-bold">{config.rules.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('lab.sensitivity')}</span>
                  <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getSensitivityColor(config.sensitivity)}`}>
                    {config.sensitivity}
                  </span>
                </div>
              </div>

              {/* Rule Categories */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('lab.ruleCategories')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-cyber-purple/10 text-purple-600 dark:text-cyber-purple text-xs rounded">Exploit</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-cyber-blue/10 text-blue-600 dark:text-cyber-blue text-xs rounded">Malware</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-cyber-green/10 text-green-600 dark:text-cyber-green text-xs rounded">Policy</span>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-cyber-yellow/10 text-yellow-600 dark:text-cyber-yellow text-xs rounded">Scan</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {config.status === 'active' ? (
                  <button 
                    onClick={() => handleToggleStatus(config.id, config.status)}
                    disabled={updating === config.id}
                    className="flex-1 px-3 py-2 bg-red-100 dark:bg-cyber-red/20 hover:bg-red-200 dark:hover:bg-cyber-red/30 text-red-600 dark:text-cyber-red text-sm rounded-lg transition-colors border border-red-200 dark:border-cyber-red/30 disabled:opacity-50"
                  >
                    {t('lab.stop')}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleToggleStatus(config.id, config.status)}
                    disabled={updating === config.id}
                    className="flex-1 px-3 py-2 bg-green-100 dark:bg-cyber-green/20 hover:bg-green-200 dark:hover:bg-cyber-green/30 text-green-600 dark:text-cyber-green text-sm rounded-lg transition-colors border border-green-200 dark:border-cyber-green/30 disabled:opacity-50"
                  >
                    {t('lab.start')}
                  </button>
                )}
                <button 
                  onClick={() => handleOpenEditRules(config.id, config.name, config.rules)}
                  disabled={updating === config.id}
                  className="flex-1 px-3 py-2 bg-blue-100 dark:bg-cyber-blue/20 hover:bg-blue-200 dark:hover:bg-cyber-blue/30 text-blue-600 dark:text-cyber-blue text-sm rounded-lg transition-colors border border-blue-200 dark:border-cyber-blue/30 disabled:opacity-50"
                >
                  {t('lab.editRules')}
                </button>
                <button 
                  onClick={() => handleOpenConfigure(config)}
                  disabled={updating === config.id}
                  className="px-3 py-2 bg-purple-100 dark:bg-cyber-purple/20 hover:bg-purple-200 dark:hover:bg-cyber-purple/30 text-purple-600 dark:text-cyber-purple rounded-lg transition-colors border border-purple-200 dark:border-cyber-purple/30 disabled:opacity-50"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Rules Modal */}
      <AnimatePresence>
        {editingRules && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingRules(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card border border-purple-300 dark:border-cyber-purple/30 rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Rules: {editingRules.name}</h3>
                  <button onClick={() => setEditingRules(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of Rules
                    </label>
                    <input
                      type="number"
                      value={newRulesCount}
                      onChange={(e) => setNewRulesCount(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                      placeholder="Enter number of rules"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Current: {editingRules.currentRules.toLocaleString()} rules
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingRules(null)}
                      className="flex-1 px-4 py-2 bg-gray-200 dark:bg-cyber-dark text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-white/5"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSaveRules}
                      disabled={updating === editingRules.id}
                      className="flex-1 px-4 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg disabled:opacity-50"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Configure Modal */}
      <AnimatePresence>
        {configModalOpen && selectedConfig && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-card border border-purple-300 dark:border-cyber-purple/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-cyber-purple" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      IDS Configuration - {selectedConfig.name}
                    </h3>
                  </div>
                  <button onClick={() => setConfigModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Global Sensitivity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Global Sensitivity
                    </label>
                    <select
                      value={configSettings.globalSensitivity}
                      onChange={(e) => handleConfigChange('globalSensitivity', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Alert Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alert Threshold (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={configSettings.alertThreshold}
                      onChange={(e) => handleConfigChange('alertThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>0%</span>
                      <span className="font-bold text-purple-600 dark:text-cyber-purple">{configSettings.alertThreshold}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Network Interface */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Network Interface
                    </label>
                    <select
                      value={configSettings.networkInterface}
                      onChange={(e) => handleConfigChange('networkInterface', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="eth0">eth0</option>
                      <option value="eth1">eth1</option>
                      <option value="wlan0">wlan0</option>
                      <option value="all">All Interfaces</option>
                    </select>
                  </div>

                  {/* Logging */}
                  <div className="space-y-4 p-4 bg-gray-100 dark:bg-cyber-dark/30 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white">Logging Settings</h4>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configSettings.loggingEnabled}
                        onChange={(e) => handleConfigChange('loggingEnabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-cyber-dark text-purple-600 dark:text-cyber-purple"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable Logging</span>
                    </label>

                    {configSettings.loggingEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Log Level
                        </label>
                        <select
                          value={configSettings.logLevel}
                          onChange={(e) => handleConfigChange('logLevel', e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                        >
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Rule Updates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rule Update Schedule
                    </label>
                    <select
                      value={configSettings.ruleUpdateSchedule}
                      onChange={(e) => handleConfigChange('ruleUpdateSchedule', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="manual">Manual</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  {/* Max Alert Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Alert Rate (per hour)
                    </label>
                    <input
                      type="number"
                      value={configSettings.maxAlertRate}
                      onChange={(e) => handleConfigChange('maxAlertRate', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    />
                  </div>

                  {/* Email Alerts */}
                  <div className="space-y-4 p-4 bg-gray-100 dark:bg-cyber-dark/30 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Alerts</h4>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configSettings.enableEmailAlerts}
                        onChange={(e) => handleConfigChange('enableEmailAlerts', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-cyber-dark text-purple-600 dark:text-cyber-purple"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable Email Alerts</span>
                    </label>

                    {configSettings.enableEmailAlerts && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Recipient
                        </label>
                        <input
                          type="email"
                          value={configSettings.emailRecipient}
                          onChange={(e) => handleConfigChange('emailRecipient', e.target.value)}
                          placeholder="admin@example.com"
                          className="w-full px-4 py-2 bg-white dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => setConfigModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-cyber-dark text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-white/5"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={updating === selectedConfig.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {t('common.save')} Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default IDSConfigPanel;