import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, FileText } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const GenerateReportModal = ({ isOpen, onClose, onGenerate }: GenerateReportModalProps) => {
  const { t } = useTranslation();
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
            <div className="glass-card border border-purple-300 dark:border-cyber-purple/30 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-cyber-purple/20 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600 dark:text-cyber-purple" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reports.generateTitle')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('reports.reportName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t('reports.reportNamePlaceholder')}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reports.reportType')} *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="summary">{t('reports.types.summary')}</option>
                      <option value="detailed">{t('reports.types.detailed')}</option>
                      <option value="comparative">{t('reports.types.comparative')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('reports.format')} *
                    </label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                    >
                      <option value="pdf">{t('reports.formats.pdf')}</option>
                      <option value="csv">{t('reports.formats.csv')}</option>
                      <option value="json">{t('reports.formats.json')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('reports.dateRange')} *
                  </label>
                  <select
                    name="dateRange"
                    value={formData.dateRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
                  >
                    <option value="7">{t('reports.last7days')}</option>
                    <option value="30">{t('reports.last30days')}</option>
                    <option value="90">{t('reports.last90days')}</option>
                    <option value="all">{t('reports.allTime')}</option>
                  </select>
                </div>

                {/* Options */}
                <div className="space-y-3 p-4 bg-gray-100 dark:bg-cyber-dark/30 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includeCharts"
                      checked={formData.includeCharts}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-cyber-dark text-purple-600 dark:text-cyber-purple focus:ring-purple-500 dark:focus:ring-cyber-purple focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.includeCharts')}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includeRawData"
                      checked={formData.includeRawData}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-cyber-dark text-purple-600 dark:text-cyber-purple focus:ring-purple-500 dark:focus:ring-cyber-purple focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.includeRawData')}</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-cyber-dark border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/5 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/30"
                  >
                    {t('common.generate')}
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