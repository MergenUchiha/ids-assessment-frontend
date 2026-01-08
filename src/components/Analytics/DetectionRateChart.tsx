import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DetectionRateChart = () => {
  const data = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    detected: Math.floor(Math.random() * 30 + 70),
    missed: Math.floor(Math.random() * 15 + 5),
    falsePositive: Math.floor(Math.random() * 5 + 1),
  }));

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Detection Rate Over Time</h2>
        <p className="text-gray-400 text-sm">24-hour attack detection trends</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 14, 39, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: '#fff'
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
            name="Detected"
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="missed" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Missed"
            dot={{ fill: '#ef4444', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="falsePositive" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="False Positive"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DetectionRateChart;