import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'yellow' | 'blue' | 'red';
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  purple: 'cyber-purple',
  green: 'cyber-green',
  yellow: 'cyber-yellow',
  blue: 'cyber-blue',
  red: 'cyber-red',
};

const StatsCard = ({ title, value, icon: Icon, color, trend, trendUp }: StatsCardProps) => {
  const colorClass = colorMap[color];

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-${colorClass}/20 rounded-lg group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 text-${colorClass}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">{trend}</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;