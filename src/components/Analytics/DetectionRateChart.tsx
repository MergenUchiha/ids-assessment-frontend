import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { testsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

interface ChartData {
  time: string;
  detected: number;
  missed: number;
  falsePositive: number;
}

const DetectionRateChart = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tests = await testsAPI.getAll();
        
        // Group tests by hour (last 24 hours)
        const hourlyData: Record<string, { detected: number; missed: number; falsePositive: number; count: number }> = {};
        
        tests.forEach(test => {
          const hour = new Date(test.startedAt).getHours();
          const key = `${hour}:00`;
          
          if (!hourlyData[key]) {
            hourlyData[key] = { detected: 0, missed: 0, falsePositive: 0, count: 0 };
          }
          
          hourlyData[key].detected += test.detectedAttacks;
          hourlyData[key].missed += test.missedAttacks;
          hourlyData[key].falsePositive += test.falsePositives;
          hourlyData[key].count++;
        });

        // Convert to array and fill missing hours
        const chartData: ChartData[] = Array.from({ length: 24 }, (_, i) => {
          const key = `${i}:00`;
          const hourData = hourlyData[key];
          
          return {
            time: key,
            detected: hourData ? Math.round(hourData.detected / hourData.count) : 0,
            missed: hourData ? Math.round(hourData.missed / hourData.count) : 0,
            falsePositive: hourData ? Math.round(hourData.falsePositive / hourData.count) : 0,
          };
        });

        setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Fallback to empty data
        setData(Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          detected: 0,
          missed: 0,
          falsePositive: 0,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 h-full flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-gray-200 dark:border-white/10 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {t('analytics.detectionRate')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t('analytics.detectionRateSubtitle')}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" className="dark:stroke-white/10" />
          <XAxis 
            dataKey="time" 
            className="text-gray-600 dark:text-gray-400"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            className="text-gray-600 dark:text-gray-400"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: 'var(--tooltip-text)'
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="detected" 
            stroke="#10b981" 
            strokeWidth={2}
            name={t('dashboard.detected')}
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="missed" 
            stroke="#ef4444" 
            strokeWidth={2}
            name={t('dashboard.missed')}
            dot={{ fill: '#ef4444', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="falsePositive" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name={t('dashboard.falsePositive')}
            dot={{ fill: '#f59e0b', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DetectionRateChart;