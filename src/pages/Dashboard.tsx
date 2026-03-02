import { useQuery } from "@tanstack/react-query";
import { experimentsApi, alertsApi } from "../api/client";
import { Experiment, Run, Alert } from "../types";
import Panel from "../components/Panel";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLOR: Record<string, string> = {
    FINISHED: "#22d3a5",
    RUNNING: "#f97316",
    QUEUED: "#7c3aed",
    FAILED: "#ef4444",
};

function StatCard({
    label,
    value,
    sub,
    color,
}: {
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    return (
        <Panel className="p-5 relative overflow-hidden">
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                }}
            />
            <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                {label}
            </p>
            <p className="font-mono font-bold text-4xl" style={{ color }}>
                {value}
            </p>
            {sub && (
                <p className="font-mono text-sm text-text-dim mt-1">{sub}</p>
            )}
        </Panel>
    );
}

const ChartTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-lg px-3 py-2 text-sm font-mono shadow-panel"
            style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
            }}
        >
            <p className="text-text-dim mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: {p.value}%
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const { t } = useI18n();

    const { data: experiments = [] } = useQuery<Experiment[]>({
        queryKey: ["experiments-dashboard"],
        queryFn: () => experimentsApi.list(),
        refetchInterval: 15_000,
    });
    const { data: alerts = [] } = useQuery<Alert[]>({
        queryKey: ["alerts-all"],
        queryFn: () => alertsApi.list(),
        refetchInterval: 15_000,
    });

    const allRuns: Run[] = experiments.flatMap((e) => e.runs ?? []);
    const finished = allRuns.filter((r) => r.status === "FINISHED");
    const successes = finished.filter((r) => r.attackSuccess);
    const withMetrics = finished.filter((r) => r.metrics);

    const avgF1 = withMetrics.length
        ? withMetrics.reduce((s, r) => s + (r.metrics!.f1 ?? 0), 0) /
          withMetrics.length
        : 0;

    const statusCounts: Record<string, number> = {};
    for (const r of allRuns)
        statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
    }));

    const metricsTimeline = withMetrics
        .map((r, i) => ({
            name: `R${i + 1}`,
            Precision: +((r.metrics!.precision ?? 0) * 100).toFixed(1),
            Recall: +((r.metrics!.recall ?? 0) * 100).toFixed(1),
            F1: +((r.metrics!.f1 ?? 0) * 100).toFixed(1),
        }))
        .filter((d) => d.F1 > 0 || d.Precision > 0);

    const sigCount: Record<string, number> = {};
    for (const a of alerts)
        sigCount[a.signature] = (sigCount[a.signature] ?? 0) + 1;
    const topSigs = Object.entries(sigCount)
        .map(([sig, count]) => ({
            sig: sig.replace(/^ET /, "").slice(0, 18),
            count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const recentRuns = [...allRuns]
        .sort(
            (a, b) =>
                new Date(b.startedAt ?? 0).getTime() -
                new Date(a.startedAt ?? 0).getTime(),
        )
        .slice(0, 7);

    const successRate = finished.length
        ? ((successes.length / finished.length) * 100).toFixed(1)
        : "—";

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={t("dashboard")}
                sub="// IDS effectiveness assessment overview"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label={t("totalRuns")}
                    value={allRuns.length}
                    sub={t("acrossExperiments", { n: experiments.length })}
                    color="var(--accent-2)"
                />
                <StatCard
                    label={t("attackSuccess")}
                    value={successRate === "—" ? "—" : `${successRate}%`}
                    sub={t("ofFinishedRuns")}
                    color="var(--warn)"
                />
                <StatCard
                    label={t("avgF1")}
                    value={
                        withMetrics.length
                            ? `${(avgF1 * 100).toFixed(1)}%`
                            : "—"
                    }
                    sub={t("idsDetectionQuality")}
                    color="var(--accent)"
                />
                <StatCard
                    label={t("totalAlerts")}
                    value={alerts.length}
                    sub={t("suricataEvents")}
                    color="var(--danger)"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <Panel className="lg:col-span-2 p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("detectionMetrics")}
                    </p>
                    {metricsTimeline.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={210}>
                                <LineChart data={metricsTimeline}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="var(--border)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill: "var(--text-dim)",
                                            fontSize: 12,
                                            fontFamily: "monospace",
                                        }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        unit="%"
                                        tick={{
                                            fill: "var(--text-dim)",
                                            fontSize: 12,
                                            fontFamily: "monospace",
                                        }}
                                    />
                                    <Tooltip content={<ChartTip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="Precision"
                                        stroke="var(--accent-2)"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "var(--accent-2)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Recall"
                                        stroke="var(--warn)"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "var(--warn)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="F1"
                                        stroke="var(--accent)"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "var(--accent)" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex gap-5 mt-3">
                                {[
                                    ["Precision", "var(--accent-2)"],
                                    ["Recall", "var(--warn)"],
                                    ["F1", "var(--accent)"],
                                ].map(([k, c]) => (
                                    <span
                                        key={k}
                                        className="flex items-center gap-2 text-sm font-mono text-text-dim"
                                    >
                                        <span
                                            className="w-5 h-0.5 inline-block rounded"
                                            style={{ background: c }}
                                        />
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[210px] flex items-center justify-center font-mono text-sm text-text-dim">
                            {t("noFinishedRuns")}
                        </div>
                    )}
                </Panel>

                <Panel className="p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("runStatus")}
                    </p>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={155}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={44}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieData.map((e, i) => (
                                            <Cell
                                                key={i}
                                                fill={
                                                    STATUS_COLOR[e.name] ??
                                                    "#6b7280"
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) =>
                                            active && payload?.length ? (
                                                <div
                                                    className="rounded px-3 py-1.5 text-sm font-mono shadow-panel"
                                                    style={{
                                                        background:
                                                            "var(--bg-2)",
                                                        border: "1px solid var(--border)",
                                                    }}
                                                >
                                                    <p
                                                        style={{
                                                            color: STATUS_COLOR[
                                                                payload[0]
                                                                    .name as string
                                                            ],
                                                        }}
                                                    >
                                                        {payload[0].name}:{" "}
                                                        {payload[0].value}
                                                    </p>
                                                </div>
                                            ) : null
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map((e) => (
                                    <div
                                        key={e.name}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-sm"
                                                style={{
                                                    background:
                                                        STATUS_COLOR[e.name],
                                                }}
                                            />
                                            <span className="font-mono text-text-dim">
                                                {e.name}
                                            </span>
                                        </div>
                                        <span
                                            className="font-mono font-bold"
                                            style={{
                                                color: STATUS_COLOR[e.name],
                                            }}
                                        >
                                            {e.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[155px] flex items-center justify-center font-mono text-sm text-text-dim">
                            {t("noRuns")}
                        </div>
                    )}
                </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Panel className="p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("topSignatures")}
                    </p>
                    {topSigs.length > 0 ? (
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={topSigs} layout="vertical">
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{
                                        fill: "var(--text-dim)",
                                        fontSize: 12,
                                        fontFamily: "monospace",
                                    }}
                                />
                                <YAxis
                                    dataKey="sig"
                                    type="category"
                                    width={105}
                                    tick={{
                                        fill: "var(--text)",
                                        fontSize: 11,
                                        fontFamily: "monospace",
                                    }}
                                />
                                <Tooltip
                                    content={({ active, payload }) =>
                                        active && payload?.length ? (
                                            <div
                                                className="rounded px-3 py-2 text-sm font-mono shadow-panel"
                                                style={{
                                                    background: "var(--bg-2)",
                                                    border: "1px solid var(--border)",
                                                }}
                                            >
                                                <p className="text-text-dim">
                                                    {payload[0]?.payload?.sig}:{" "}
                                                    <span
                                                        style={{
                                                            color: "var(--accent-2)",
                                                        }}
                                                    >
                                                        {payload[0]?.value}
                                                    </span>
                                                </p>
                                            </div>
                                        ) : null
                                    }
                                />
                                <Bar
                                    dataKey="count"
                                    fill="var(--accent-2)"
                                    radius={[0, 3, 3, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[190px] flex items-center justify-center font-mono text-sm text-text-dim">
                            {t("noAlerts")}
                        </div>
                    )}
                </Panel>

                <Panel className="lg:col-span-2 p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("recentRuns")}
                    </p>
                    <table className="w-full">
                        <thead>
                            <tr
                                style={{
                                    borderBottom: "1px solid var(--border)",
                                }}
                            >
                                {[
                                    t("id"),
                                    t("scenario"),
                                    t("status"),
                                    t("attack"),
                                    t("f1"),
                                    t("latency"),
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="pb-2.5 pr-3 text-left font-mono text-xs uppercase tracking-widest text-text-dim"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentRuns.map((run) => (
                                <tr
                                    key={run.id}
                                    style={{
                                        borderBottom:
                                            "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                                    }}
                                >
                                    <td className="py-3 pr-3 font-mono text-sm text-text-dim">
                                        <Link
                                            to={`/runs/${run.id}`}
                                            className="hover:text-accent transition-colors"
                                        >
                                            #{run.id.slice(-4)}
                                        </Link>
                                    </td>
                                    <td className="py-3 pr-3 text-sm text-text max-w-[130px] truncate">
                                        {run.scenario?.name ?? "—"}
                                    </td>
                                    <td className="py-3 pr-3">
                                        <StatusBadge status={run.status} />
                                    </td>
                                    <td className="py-3 pr-3 font-mono text-sm">
                                        {run.attackSuccess == null ? (
                                            <span className="text-text-dim">
                                                —
                                            </span>
                                        ) : run.attackSuccess ? (
                                            <span
                                                style={{
                                                    color: "var(--danger)",
                                                }}
                                            >
                                                ✓ Yes
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: "var(--accent-2)",
                                                }}
                                            >
                                                ✗ No
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        className="py-3 pr-3 font-mono text-sm"
                                        style={{ color: "var(--accent)" }}
                                    >
                                        {run.metrics?.f1 != null
                                            ? `${(run.metrics.f1 * 100).toFixed(0)}%`
                                            : "—"}
                                    </td>
                                    <td
                                        className="py-3 font-mono text-sm"
                                        style={{ color: "var(--accent-2)" }}
                                    >
                                        {run.metrics?.latencyMs != null
                                            ? `${run.metrics.latencyMs}ms`
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                            {recentRuns.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center font-mono text-sm text-text-dim"
                                    >
                                        {t("noRuns")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Panel>
            </div>
        </div>
    );
}
