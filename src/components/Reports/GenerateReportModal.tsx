import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const GenerateReportModal = ({ isOpen, onClose, onGenerate }: GenerateReportModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'summary' as 'summary' | 'detailed' | 'comparative',
    format: 'pdf',
    dateRange: '30',
    includeCharts: true,
    includeRawData: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
    setFormData({
      name: '',
      type: 'summary',
      format: 'pdf',
      dateRange: '30',
      includeCharts: true,
      includeRawData: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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
            <div className="glass-card border border-cyber-purple/30 rounded-xl p-6 max-w-2xl w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyber-purple/20 rounded-lg">
                    <FileText className="w-6 h-6 text-cyber-purple" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Generate Report</h2>
                </div>
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
                    Report Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., January 2025 IDS Performance Report"
                    className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-cyber-purple focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Report Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="summary">Summary Report</option>
                      <option value="detailed">Detailed Analysis</option>
                      <option value="comparative">Comparative Study</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Format *
                    </label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="csv">CSV Spreadsheet</option>
                      <option value="json">JSON Data</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Range *
                  </label>
                  <select
                    name="dateRange"
                    value={formData.dateRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-cyber-dark border border-white/10 rounded-lg text-white focus:border-cyber-purple focus:outline-none"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>

                {/* Options */}
                <div className="space-y-3 p-4 bg-cyber-dark/30 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includeCharts"
                      checked={formData.includeCharts}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-white/10 bg-cyber-dark text-cyber-purple focus:ring-cyber-purple focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">Include charts and visualizations</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includeRawData"
                      checked={formData.includeRawData}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-white/10 bg-cyber-dark text-cyber-purple focus:ring-cyber-purple focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">Include raw test data</span>
                  </label>
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
                    Generate Report
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

export default GenerateReportModal;