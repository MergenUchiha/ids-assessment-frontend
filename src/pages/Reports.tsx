import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileJson } from 'lucide-react';
import ReportCard from '../components/Reports/ReportCard';
import GenerateReportModal from '../components/Reports/GenerateReportModal';

interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'comparative';
  dateGenerated: string;
  testsIncluded: number;
  size: string;
}

const Reports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'r1',
      name: 'December 2024 Summary Report',
      type: 'summary',
      dateGenerated: new Date(Date.now() - 86400000 * 5).toISOString(),
      testsIncluded: 47,
      size: '2.3 MB',
    },
    {
      id: 'r2',
      name: 'EternalBlue Detailed Analysis',
      type: 'detailed',
      dateGenerated: new Date(Date.now() - 86400000 * 10).toISOString(),
      testsIncluded: 12,
      size: '4.1 MB',
    },
    {
      id: 'r3',
      name: 'Snort vs Suricata Comparison',
      type: 'comparative',
      dateGenerated: new Date(Date.now() - 86400000 * 15).toISOString(),
      testsIncluded: 23,
      size: '3.7 MB',
    },
  ]);

  const handleGenerateReport = (reportData: any) => {
    const newReport: Report = {
      id: `r${Date.now()}`,
      name: reportData.name,
      type: reportData.type,
      dateGenerated: new Date().toISOString(),
      testsIncluded: reportData.testsIncluded || 0,
      size: '1.5 MB',
    };
    setReports([newReport, ...reports]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Export</h1>
          <p className="text-gray-400">Generate comprehensive analysis reports for your thesis</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-lg transition-colors neon-glow"
        >
          <FileText className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="glass-card p-6 rounded-xl border border-white/10 hover:border-cyber-purple/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyber-purple/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-cyber-purple" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Export Summary</h3>
              <p className="text-sm text-gray-400">Quick overview of all tests</p>
            </div>
          </div>
        </button>

        <button className="glass-card p-6 rounded-xl border border-white/10 hover:border-cyber-green/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyber-green/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6 text-cyber-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Export to CSV</h3>
              <p className="text-sm text-gray-400">Raw data for analysis</p>
            </div>
          </div>
        </button>

        <button className="glass-card p-6 rounded-xl border border-white/10 hover:border-cyber-blue/50 transition-all group text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyber-blue/20 rounded-lg group-hover:scale-110 transition-transform">
              <FileJson className="w-6 h-6 text-cyber-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Export to JSON</h3>
              <p className="text-sm text-gray-400">Machine-readable format</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by:</span>
          </div>
          
          <select className="px-3 py-1.5 bg-cyber-dark border border-white/10 rounded-lg text-sm text-white focus:border-cyber-purple focus:outline-none">
            <option>All Types</option>
            <option>Summary</option>
            <option>Detailed</option>
            <option>Comparative</option>
          </select>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyber-dark border border-white/10 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-white">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ReportCard report={report} />
          </motion.div>
        ))}
      </div>

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