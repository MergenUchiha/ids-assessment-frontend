import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AttackScenario } from '../../types';

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (scenario: Omit<AttackScenario, 'id' | 'createdAt'>) => void;
}

const exploitTypes = [
  { value: 'Remote Code Execution', label: 'Remote Code Execution (RCE)' },
  { value: 'SQL Injection', label: 'SQL Injection' },
  { value: 'Command Injection', label: 'Command Injection' },
  { value: 'Buffer Overflow', label: 'Buffer Overflow' },
  { value: 'Privilege Escalation', label: 'Privilege Escalation' },
];

const targetOSOptions = [
  'Windows Server 2008 R2',
  'Windows 10',
  'Ubuntu 20.04',
  'Debian 10',
  'CentOS 7',
];

const CreateScenarioModal = ({ isOpen, onClose, onCreate }: CreateScenarioModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exploitType: 'Remote Code Execution',
    targetIP: '192.168.1.',
    targetOS: targetOSOptions[0],
    targetPort: 445,
    status: 'draft' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({
      name: '',
      description: '',
      exploitType: 'Remote Code Execution',
      targetIP: '192.168.1.',
      targetOS: targetOSOptions[0],
      targetPort: 445,
      status: 'draft',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetPort' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card border border-cyber-purple/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Attack Scenario</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., EternalBlue (MS17-010)"
                    className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyber-purple focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Describe the attack scenario..."
                    className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyber-purple focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exploit Type *
                    </label>
                    <select
                      name="exploitType"
                      value={formData.exploitType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                    >
                      {exploitTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target OS *
                    </label>
                    <select
                      name="targetOS"
                      value={formData.targetOS}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                    >
                      {targetOSOptions.map(os => (
                        <option key={os} value={os}>
                          {os}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target IP *
                    </label>
                    <input
                      type="text"
                      name="targetIP"
                      value={formData.targetIP}
                      onChange={handleChange}
                      required
                      placeholder="192.168.1.100"
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyber-purple focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Port *
                    </label>
                    <input
                      type="number"
                      name="targetPort"
                      value={formData.targetPort}
                      onChange={handleChange}
                      required
                      min="1"
                      max="65535"
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-cyber-dark border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-lg transition-colors neon-glow"
                  >
                    Create Scenario
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateScenarioModal;