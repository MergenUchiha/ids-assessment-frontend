import { motion } from 'framer-motion';
import DetectionRateChart from '../components/Analytics/DetectionRateChart';
import ExploitHeatmap from '../components/Analytics/ExploitHeatmap';
import PerformanceMetrics from '../components/Analytics/PerformanceMetrics';
import ROCCurve from '../components/Analytics/ROCCurve';

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Metrics</h1>
        <p className="text-gray-400">Comprehensive IDS performance analysis</p>
      </div>

      {/* Performance Summary */}
      <PerformanceMetrics />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Rate Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DetectionRateChart />
        </motion.div>

        {/* ROC Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ROCCurve />
        </motion.div>
      </div>

      {/* Exploit Heatmap - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ExploitHeatmap />
      </motion.div>
    </div>
  );
};

export default Analytics;