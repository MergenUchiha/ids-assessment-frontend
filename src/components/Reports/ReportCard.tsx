import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'comparative';
  dateGenerated: string;
  testsIncluded: number;
  size: string;
}

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'summary':
        return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30';
      case 'detailed':
        return 'bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30';
      case 'comparative':
        return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 hover:border-cyber-purple/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-cyber-purple/20 rounded-lg group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6 text-cyber-purple" />
        </div>
        <div className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getTypeColor(report.type)}`}>
          {report.type}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{report.name}</h3>
      
      {/* Meta Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Generated:</span>
          <span className="text-white">
            {formatDistanceToNow(new Date(report.dateGenerated), { addSuffix: true })}
          </span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Tests Included:</span>
          <span className="text-white font-medium">{report.testsIncluded}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>File Size:</span>
          <span className="text-white">{report.size}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-blue rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
          <span className="text-sm">View</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span className="text-sm">Download</span>
        </button>
        
        <button className="px-3 py-2 bg-cyber-red/20 hover:bg-cyber-red/30 text-cyber-red rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;