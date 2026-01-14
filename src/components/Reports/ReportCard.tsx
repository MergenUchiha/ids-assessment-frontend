import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Trash2, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { reportsAPI } from '../../services/api';

interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'comparative';
  format: string;
  createdAt: string;
  testsIncluded: number;
  fileSize?: string;
  filePath?: string;
}

interface ReportCardProps {
  report: Report;
  onDelete?: (id: string) => void;
}

const ReportCard = ({ report, onDelete }: ReportCardProps) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'summary':
        return 'bg-blue-50 dark:bg-cyber-blue/20 text-blue-600 dark:text-cyber-blue border-blue-200 dark:border-cyber-blue/30';
      case 'detailed':
        return 'bg-purple-50 dark:bg-cyber-purple/20 text-purple-600 dark:text-cyber-purple border-purple-200 dark:border-cyber-purple/30';
      case 'comparative':
        return 'bg-green-50 dark:bg-cyber-green/20 text-green-600 dark:text-cyber-green border-green-200 dark:border-cyber-green/30';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Fetch the actual report data
      const reportData = await reportsAPI.getOne(report.id);
      
      // Create downloadable content based on format
      let content = '';
      let mimeType = '';
      let filename = '';

      if (report.format === 'json') {
        content = JSON.stringify(reportData, null, 2);
        mimeType = 'application/json';
        filename = `${report.name.replace(/\s+/g, '_')}.json`;
      } else if (report.format === 'csv') {
        // Generate CSV from report data
        const csvRows = [
          ['Report Name', 'Type', 'Created At', 'Tests Included'],
          [report.name, report.type, report.createdAt, report.testsIncluded.toString()]
        ];
        content = csvRows.map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
        filename = `${report.name.replace(/\s+/g, '_')}.csv`;
      } else {
        // For PDF, we would need a backend endpoint to generate it
        alert(`PDF download requires backend implementation. Report ID: ${report.id}`);
        return;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(t('common.error') + ': Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    try {
      setViewing(true);
      
      // Fetch full report data
      const reportData = await reportsAPI.getOne(report.id);
      
      // Open in new window/tab with formatted content
      const viewWindow = window.open('', '_blank');
      if (viewWindow) {
        viewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${report.name}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  max-width: 1200px;
                  margin: 0 auto;
                  padding: 2rem;
                  background: #f9fafb;
                }
                .header {
                  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
                  color: white;
                  padding: 2rem;
                  border-radius: 1rem;
                  margin-bottom: 2rem;
                }
                .header h1 {
                  margin: 0 0 0.5rem 0;
                  font-size: 2rem;
                }
                .header .meta {
                  opacity: 0.9;
                  font-size: 0.875rem;
                }
                .section {
                  background: white;
                  padding: 1.5rem;
                  border-radius: 0.5rem;
                  margin-bottom: 1rem;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .section h2 {
                  margin: 0 0 1rem 0;
                  color: #8b5cf6;
                  font-size: 1.25rem;
                }
                .grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 1rem;
                }
                .stat {
                  padding: 1rem;
                  background: #f3f4f6;
                  border-radius: 0.5rem;
                }
                .stat-label {
                  color: #6b7280;
                  font-size: 0.875rem;
                  margin-bottom: 0.25rem;
                }
                .stat-value {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #111827;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  padding: 0.75rem;
                  text-align: left;
                  border-bottom: 1px solid #e5e7eb;
                }
                th {
                  background: #f9fafb;
                  font-weight: 600;
                  color: #374151;
                }
                @media print {
                  body { background: white; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${report.name}</h1>
                <div class="meta">
                  Type: ${report.type} | Format: ${report.format} | 
                  Generated: ${new Date(report.createdAt).toLocaleString()} |
                  Tests: ${report.testsIncluded}
                </div>
              </div>
              
              <div class="section">
                <h2>Report Summary</h2>
                <div class="grid">
                  <div class="stat">
                    <div class="stat-label">Report Type</div>
                    <div class="stat-value">${report.type}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">Tests Included</div>
                    <div class="stat-value">${report.testsIncluded}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">File Size</div>
                    <div class="stat-value">${report.fileSize || 'N/A'}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-label">Created</div>
                    <div class="stat-value">${formatDate(report.createdAt)}</div>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h2>Report Data</h2>
                <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;">
${JSON.stringify(reportData, null, 2)}
                </pre>
              </div>
              
              <div class="section no-print">
                <button onclick="window.print()" style="
                  background: #8b5cf6;
                  color: white;
                  padding: 0.75rem 1.5rem;
                  border: none;
                  border-radius: 0.5rem;
                  cursor: pointer;
                  font-size: 1rem;
                  margin-right: 0.5rem;
                ">Print Report</button>
                <button onclick="window.close()" style="
                  background: #6b7280;
                  color: white;
                  padding: 0.75rem 1.5rem;
                  border: none;
                  border-radius: 0.5rem;
                  cursor: pointer;
                  font-size: 1rem;
                ">Close</button>
              </div>
            </body>
          </html>
        `);
        viewWindow.document.close();
      }
      
    } catch (error) {
      console.error('View error:', error);
      alert(t('common.error') + ': Failed to view report');
    } finally {
      setViewing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(report.id);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-cyber-purple/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-purple-100 dark:bg-cyber-purple/20 rounded-lg group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6 text-purple-600 dark:text-cyber-purple" />
        </div>
        <div className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getTypeColor(report.type)}`}>
          {t(`reports.types.${report.type}`)}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{report.name}</h3>
      
      {/* Meta Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{t('reports.generated')}:</span>
          <span className="text-gray-900 dark:text-white">
            {formatDate(report.createdAt)}
          </span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>{t('reports.testsIncluded')}:</span>
          <span className="text-gray-900 dark:text-white font-medium">{report.testsIncluded}</span>
        </div>
        {report.fileSize && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>{t('reports.fileSize')}:</span>
            <span className="text-gray-900 dark:text-white">{report.fileSize}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
        <button 
          onClick={handleView}
          disabled={viewing}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-cyber-blue/20 hover:bg-blue-200 dark:hover:bg-cyber-blue/30 text-blue-600 dark:text-cyber-blue rounded-lg transition-colors disabled:opacity-50"
        >
          {viewing ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm">{t('common.view')}</span>
        </button>
        
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-cyber-green/20 hover:bg-green-200 dark:hover:bg-cyber-green/30 text-green-600 dark:text-cyber-green rounded-lg transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="text-sm">{t('common.download')}</span>
        </button>
        
        {onDelete && (
          <button 
            onClick={handleDelete}
            className="px-3 py-2 bg-red-100 dark:bg-cyber-red/20 hover:bg-red-200 dark:hover:bg-cyber-red/30 text-red-600 dark:text-cyber-red rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;