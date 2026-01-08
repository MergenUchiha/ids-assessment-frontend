import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const PerformanceMetrics = () => {
  const metrics = [
    {
      label: 'True Positive Rate',
      value: '93.2%',
      description: 'Attacks correctly detected',
      trend: '+3.5%',
      trendUp: true,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'False Positive Rate',
      value: '2.1%',
      description: 'Benign traffic flagged',
      trend: '-1.2%',
      trendUp: false,
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      label: 'False Negative Rate',
      value: '6.8%',
      description: 'Attacks missed',
      trend: '+0.8%',
      trendUp: true,
      icon: XCircle,
      color: 'red',
    },
    {
      label: 'Precision',
      value: '97.8%',
      description: 'Accuracy of detections',
      trend: '+2.3%',
      trendUp: true,
      icon: Target,
      color: 'purple',
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'text-cyber-green bg-cyber-green/20 border-cyber-green/30',
      yellow: 'text-cyber-yellow bg-cyber-yellow/20 border-cyber-yellow/30',
      red: 'text-cyber-red bg-cyber-red/20 border-cyber-red/30',
      purple: 'text-cyber-purple bg-cyber-purple/20 border-cyber-purple/30',
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Performance Metrics</h2>
        <p className="text-gray-400 text-sm">Key IDS effectiveness indicators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`p-4 rounded-lg border ${getColorClass(metric.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5" />
                <div className={`flex items-center gap-1 text-sm ${metric.trendUp ? 'text-cyber-green' : 'text-cyber-red'}`}>
                  {metric.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{metric.trend}</span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm font-medium mb-1">{metric.label}</div>
              <div className="text-xs opacity-70">{metric.description}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">2,847</div>
          <div className="text-sm text-gray-400">Total Attacks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyber-green mb-1">2,654</div>
          <div className="text-sm text-gray-400">Detected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyber-red mb-1">193</div>
          <div className="text-sm text-gray-400">Missed</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;