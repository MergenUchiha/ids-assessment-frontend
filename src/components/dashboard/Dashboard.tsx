import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { api } from '../../api/client';
import type { Experiment, Run, Alert, Metric } from '../../types';

// ─── Status helpers ────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  FINISHED: '#22d3a5',
  RUNNING:  '#38bdf8',
  QUEUED:   '#a78bfa',
  FAILED:   '#f87171',
};

const STATUS_DOT: Record<string, string> = {
  FINISHED: '●', RUNNING: '◎', QUEUED: '○', FAILED: '✕',
};

const STATUS_CLASS: Record<string, string> = {
  FINISHED: 'bg-emerald-900/60 text-emerald-400 border-emerald-700',
  RUNNING:  'bg-sky-900/60 text-sky-400 border-sky-700 animate-pulse',
  QUEUED:   'bg-violet-900/60 text-violet-400 border-violet-700',
  FAILED:   'bg-red-900/60 text-red-400 border-red-700',
};

// ─── Types ────────────────────────────────────────────────────────────────
interface DashboardData {
  totalRuns: number;
  totalExperiments: number;
  successRate: string;
  avgF1: string;
  totalAlerts: number;
  statusCounts: Record<string, number>;
  metricsTimeline: { name: string; Precision: number; Recall: number; F1: number }[];
  topSignatures: { sig: string; count: number }[];
  recentRuns: Run[];
}

// ─── Sub-components ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border ${STATUS_CLASS[status] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      <span className="text-[10px]">{STATUS_DOT[status]}</span>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent = '#22d3a5', icon }: {
  label: string; value: string | number; sub?: string; accent?: string; icon: string;
}) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden p-5 flex flex-col gap-2 group hover:border-white/20 transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="flex items-start justify-between">
        <span className="text-xs font-mono tracking-widest uppercase text-gray-500">{label}</span>
        <span className="text-xl opacity-30 group-hover:opacity-60 transition-opacity">{icon}</span>
      </div>
      <div className="text-4xl font-bold tracking-tight" style={{ color: accent, fontFamily: 'monospace' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-500 font-mono">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full bg-cyan-400" />
      <h2 className="text-sm font-mono tracking-widest uppercase text-gray-300">{children}</h2>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-3 text-xs font-mono">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-3 text-xs font-mono">
      <p className="text-gray-400 mb-1">{payload[0]?.payload?.sig}</p>
      <p className="text-cyan-400">Count: {payload[0]?.value}</p>
    </div>
  );
};

// ─── Data processing ─────────────────────────────────────────────────────
function processData(experiments: Experiment[], alerts: Alert[]): DashboardData {
  const allRuns = experiments.flatMap(e => e.runs);
  const finishedRuns = allRuns.filter(r => r.status === 'FINISHED');
  const successRuns  = finishedRuns.filter(r => r.attackSuccess);
  const withMetrics  = finishedRuns.filter(r => r.metrics);
  const avgF1 = withMetrics.length
    ? withMetrics.reduce((s, r) => s + (r.metrics!.f1 ?? 0), 0) / withMetrics.length : 0;

  const statusCounts: Record<string, number> = {};
  for (const r of allRuns) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;

  const metricsTimeline = withMetrics.map((r, i) => ({
    name: `R${i + 1}`,
    Precision: +((r.metrics!.precision ?? 0) * 100).toFixed(1),
    Recall:    +((r.metrics!.recall    ?? 0) * 100).toFixed(1),
    F1:        +((r.metrics!.f1        ?? 0) * 100).toFixed(1),
  }));

  const sigCount: Record<string, number> = {};
  for (const a of alerts) sigCount[a.signature] = (sigCount[a.signature] ?? 0) + 1;
  const topSignatures = Object.entries(sigCount)
    .map(([sig, count]) => ({ sig: sig.replace(/^ET /, ''), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRuns: allRuns.length,
    totalExperiments: experiments.length,
    successRate: finishedRuns.length
      ? ((successRuns.length / finishedRuns.length) * 100).toFixed(1) : '0',
    avgF1: (avgF1 * 100).toFixed(1),
    totalAlerts: alerts.length,
    statusCounts,
    metricsTimeline,
    topSignatures,
    recentRuns: allRuns.slice(-6).reverse(),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [experiments, alerts] = await Promise.all([
        api.getExperiments(),
        api.getAllAlerts(),
      ]);
      setData(processData(experiments, alerts));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Auto-refresh every 10s if any run is active
  useEffect(() => {
    const id = setInterval(() => {
      if (data?.statusCounts['RUNNING'] || data?.statusCounts['QUEUED']) void load();
    }, 10_000);
    return () => clearInterval(id);
  }, [data, load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-gray-500 tracking-widest">LOADING TELEMETRY...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-red-400 font-mono text-sm">
        <p className="text-2xl mb-2">⚠</p>
        <p>{error}</p>
        <button onClick={() => { setLoading(true); setError(null); void load(); }}
          className="mt-3 text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1 rounded">
          RETRY
        </button>
      </div>
    </div>
  );

  if (!data) return null;

  const pieData = Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Runs"     value={data.totalRuns}    sub={`across ${data.totalExperiments} experiments`} accent="#22d3a5" icon="▶" />
        <StatCard label="Attack Success" value={`${data.successRate}%`} sub="of finished runs"        accent="#38bdf8" icon="⚡" />
        <StatCard label="Avg F1 Score"   value={`${data.avgF1}%`}  sub="IDS detection quality"        accent="#a78bfa" icon="◎" />
        <StatCard label="Total Alerts"   value={data.totalAlerts}  sub="Suricata events captured"     accent="#fb923c" icon="⚠" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metrics Timeline */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <SectionTitle>Detection Metrics Timeline</SectionTitle>
          {data.metricsTimeline.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.metricsTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="Precision" stroke="#22d3a5" strokeWidth={2} dot={{ r: 4, fill: '#22d3a5' }} />
                  <Line type="monotone" dataKey="Recall"    stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} />
                  <Line type="monotone" dataKey="F1"        stroke="#a78bfa" strokeWidth={2} dot={{ r: 4, fill: '#a78bfa' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                {[['Precision','#22d3a5'],['Recall','#38bdf8'],['F1','#a78bfa']].map(([k,c])=>(
                  <span key={k} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-3 h-0.5 inline-block rounded" style={{ background: c }} />{k}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm font-mono">
              NO FINISHED RUNS YET
            </div>
          )}
        </div>

        {/* Status Pie */}
        <div className="rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <SectionTitle>Run Status</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLOR[entry.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="bg-[#0d1117] border border-white/10 rounded p-2 text-xs font-mono">
                    <p style={{ color: STATUS_COLOR[payload[0].name as string] }}>
                      {payload[0].name}: {payload[0].value}
                    </p>
                  </div>
                ) : null
              } />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm" style={{ background: STATUS_COLOR[entry.name] }} />
                  <span className="text-gray-400 font-mono">{entry.name}</span>
                </div>
                <span className="font-bold font-mono" style={{ color: STATUS_COLOR[entry.name] }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Signatures */}
        <div className="rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <SectionTitle>Top Alert Signatures</SectionTitle>
          {data.topSignatures.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topSignatures} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis dataKey="sig" type="category" width={80} tick={{ fill: '#9ca3af', fontSize: 9, fontFamily: 'monospace' }} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="count" fill="#22d3a5" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-xs font-mono">NO ALERTS YET</div>
          )}
        </div>

        {/* Recent Runs */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <SectionTitle>Recent Runs</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-600 text-left">
                  {['ID','SCENARIO','STATUS','ATTACK','F1','LATENCY'].map(h => (
                    <th key={h} className="pb-2 pr-4 font-normal tracking-wider font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentRuns.map(run => (
                  <tr key={run.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-2.5 pr-4 text-gray-500 group-hover:text-gray-400 font-mono">
                      #{run.id.slice(-4)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-300">{run.scenario?.name ?? '—'}</td>
                    <td className="py-2.5 pr-4"><StatusBadge status={run.status} /></td>
                    <td className="py-2.5 pr-4 font-mono">
                      {run.attackSuccess == null ? <span className="text-gray-600">—</span>
                        : run.attackSuccess ? <span className="text-emerald-400">✓</span>
                        : <span className="text-red-400">✗</span>}
                    </td>
                    <td className="py-2.5 pr-4 font-mono">
                      {run.metrics?.f1 != null
                        ? <span className="text-violet-400">{((run.metrics.f1) * 100).toFixed(0)}%</span>
                        : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-2.5 font-mono">
                      {run.metrics?.latencyMs != null
                        ? <span className="text-cyan-400">{run.metrics.latencyMs}ms</span>
                        : <span className="text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
                {data.recentRuns.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-600 text-xs font-mono">NO RUNS YET</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
