import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileJson, AlertTriangle } from 'lucide-react';
import ReportCard from '../components/Reports/ReportCard';
import GenerateReportModal from '../components/Reports/GenerateReportModal';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getAll();
      
      // Filter and validate reports
      const validReports = data.filter(report => {
        try {
          const date = new Date(report.createdAt);
          return !isNaN(date.getTime()) && report.id && report.name;
        } catch {
          return false;
        }
      });
      
      setReports(validReports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (reportData: any) => {
    try {
      // Map dateRange number to string format
      const dateRangeMap: Record<string, string> = {
        '7': 'Last 7 days',
        '30': 'Last 30 days',
        '90': 'Last 90 days',
        'all': 'All time',
      };

      const formattedData = {
        ...reportData,
        dateRange: dateRangeMap[reportData.dateRange] || reportData.dateRange,
      };

      await reportsAPI.generate(formattedData);
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert(t('common.error') + ': Failed to generate report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportsAPI.delete(id);
      fetchReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert(t('common.error') + ': Failed to delete report');
    }
  };

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 dark:border-cyber-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('reports.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('reports.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg transition-colors shadow-lg shadow-purple-500/30"
        >
          <FileText className="w-5 h-5" />
          {t('reports.generateReport')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 rounded-xl border border-red-300 dark:border-cyber-red/30 bg-red-50 dark:bg-cyber-red/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-cyber-red" />
            <p className="text-gray-900 dark:text-white">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-cyber-purple/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-cyber-purple/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-purple-600 dark:text-cyber-purple" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('reports.exportSummary')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.exportSummaryDesc')}</p>
            </div>
          </div>
        </button>

        <button className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-green-300 dark:hover:border-cyber-green/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-cyber-green/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-cyber-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('reports.exportCSV')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.exportCSVDesc')}</p>
            </div>
          </div>
        </button>

        <button className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-cyber-blue/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-cyber-blue/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileJson className="w-6 h-6 text-blue-600 dark:text-cyber-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('reports.exportJSON')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.exportJSONDesc')}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-gray-200 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reports.filterBy')}</span>
          </div>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-cyber-purple focus:outline-none"
          >
            <option value="all">{t('reports.allTypes')}</option>
            <option value="summary">{t('reports.summary')}</option>
            <option value="detailed">{t('reports.detailed')}</option>
            <option value="comparative">{t('reports.comparative')}</option>
          </select>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-cyber-dark border border-gray-200 dark:border-white/10 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">{t('reports.last30days')}</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReportCard report={report} onDelete={handleDeleteReport} />
          </motion.div>
        ))}
      </div>

      {filteredReports.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="glass-card p-12 rounded-xl border border-gray-200 dark:border-white/10 inline-block">
            <FileText className="w-16 h-16 text-purple-600 dark:text-cyber-purple mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('common.noData')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Generate your first report</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-purple-600 dark:bg-cyber-purple hover:bg-purple-700 dark:hover:bg-cyber-purple/80 text-white rounded-lg transition-colors"
            >
              {t('reports.generateReport')}
            </button>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default Reports;