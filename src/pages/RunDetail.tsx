import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { runsApi } from "../api/client";
import { RunReport, PaginatedAlerts } from "../types";
import StatusBadge from "../components/StatusBadge";
import Panel from "../components/Panel";
import PageHeader from "../components/PageHeader";
import { useI18n } from "../i18n";
import {
    ArrowLeft,
    Shield,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { useState } from "react";
import RunAnimation from "../components/RunAnimation";

const ALERTS_PER_PAGE = 50;

// ── Severity helpers ──────────────────────────────────────────────────────────
const sevColor = (s: number) =>
    s === 1 ? "var(--danger)" : s === 2 ? "var(--warn)" : "var(--accent-2)";

const sevLabel = (s: number) => (s === 1 ? "HIGH" : s === 2 ? "MED" : "LOW");

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <Panel className="p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-text-dim">{icon}</span>
                <p className="font-mono text-xs uppercase tracking-widest text-text-dim">
                    {label}
                </p>
            </div>
            <p
                className="font-mono text-base text-text-bright truncate"
                title={value}
            >
                {value}
            </p>
        </Panel>
    );
}

function MetricRow({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div
            className="flex items-center justify-between py-2.5"
            style={{
                borderBottom:
                    "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
            }}
        >
            <span className="font-mono text-sm text-text-dim">{label}</span>
            <span className="font-mono text-base font-bold" style={{ color }}>
                {value}
            </span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RunDetail() {
    const { runId } = useParams<{ runId: string }>();
    const { t } = useI18n();
    const [alertPage, setAlertPage] = useState(1);

    // Основной запрос — report с метриками и attack events
    const {
        data: report,
        isLoading,
        error,
    } = useQuery<RunReport>({
        queryKey: ["run-report", runId],
        queryFn: () => runsApi.report(runId!),
        refetchInterval: (q) => {
            const s = q.state.data?.status;
            return s === "RUNNING" || s === "QUEUED" ? 3_000 : false;
        },
        enabled: !!runId,
    });

    // Алерты — запрашиваем только для завершённых runs
    const { data: alertsData } = useQuery<PaginatedAlerts>({
        queryKey: ["run-alerts", runId, alertPage],
        queryFn: () => runsApi.alerts(runId!, alertPage, ALERTS_PER_PAGE),
        enabled: !!report && report.status !== "QUEUED",
        keepPreviousData: true,
    } as any);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 animate-fade-in">
                <div className="text-center">
                    <div
                        className="w-7 h-7 border-2 rounded-full animate-spin mx-auto mb-3"
                        style={{
                            borderColor: "var(--border)",
                            borderTopColor: "var(--accent)",
                        }}
                    />
                    <p className="font-mono text-sm text-text-dim">
                        {t("loadingRun")}
                    </p>
                </div>
            </div>
        );
    }

    // ── Error / Not found ─────────────────────────────────────────────────────
    if (error || !report) {
        return (
            <div className="flex items-center justify-center py-20 animate-fade-in">
                <div className="text-center">
                    <AlertTriangle
                        size={28}
                        className="mx-auto mb-3"
                        style={{ color: "var(--danger)" }}
                    />
                    <p
                        className="font-mono text-base mb-2"
                        style={{ color: "var(--danger)" }}
                    >
                        {t("runNotFound")}
                    </p>
                    <Link
                        to="/experiments"
                        className="font-mono text-sm text-text-dim hover:text-accent transition-colors"
                    >
                        ← {t("backToExp")}
                    </Link>
                </div>
            </div>
        );
    }

    // ── Derived data ──────────────────────────────────────────────────────────
    const m = report.metrics;

    const radarData = m
        ? [
              {
                  metric: "Precision",
                  value: Math.round((m.precision ?? 0) * 100),
              },
              { metric: "Recall", value: Math.round((m.recall ?? 0) * 100) },
              { metric: "F1", value: Math.round((m.f1 ?? 0) * 100) },
          ]
        : [];

    const duration =
        report.startedAt && report.finishedAt
            ? Math.round(
                  (new Date(report.finishedAt).getTime() -
                      new Date(report.startedAt).getTime()) /
                      1000,
              )
            : null;

    const attackEvents = report.attackEvents ?? [];

    const evColor = (type: string) => {
        switch (type) {
            case "attack_success":
                return "var(--danger)";
            case "attack_fail":
                return "var(--accent-2)";
            case "attack_start":
                return "var(--accent)";
            case "attack_end":
                return "var(--warn)";
            case "error":
                return "var(--danger)";
            default:
                return "var(--muted)";
        }
    };

    const totalAlertPages = alertsData
        ? Math.ceil(alertsData.total / ALERTS_PER_PAGE)
        : 0;

    const isActive = report.status === "RUNNING" || report.status === "QUEUED";

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in">
            {/* Back link + header */}
            <div className="mb-5">
                <Link
                    to="/experiments"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-text-dim hover:text-accent transition-colors mb-3"
                >
                    <ArrowLeft size={13} /> {t("backToExp")}
                </Link>
                <PageHeader
                    title={`Run #${report.runId.slice(-6)}`}
                    sub={`// experiment: ${report.experiment}`}
                    actions={<StatusBadge status={report.status} />}
                />
            </div>

            {/* ── Active run banner ── */}
            {isActive && (
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                    style={{
                        background:
                            "color-mix(in srgb, var(--warn) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--warn) 25%, transparent)",
                    }}
                >
                    <Loader2
                        size={16}
                        className="animate-spin flex-shrink-0"
                        style={{ color: "var(--warn)" }}
                    />
                    <p
                        className="font-mono text-sm"
                        style={{ color: "var(--warn)" }}
                    >
                        {report.status === "RUNNING"
                            ? "Attack simulation in progress… auto-refreshing every 3s"
                            : "Run is queued, waiting for runner to pick it up…"}
                    </p>
                </div>
            )}

            {/* ── LIVE ATTACK ANIMATION ── */}
            <div className="mb-5">
                <RunAnimation report={report} />
            </div>

            {/* ── Info cards: scenario / profile / time ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <InfoCard
                    label={t("scenario")}
                    value={report.scenario ?? "—"}
                    icon={<Target size={14} />}
                />
                <InfoCard
                    label={t("idsProfile")}
                    value={report.idsProfile ?? "default"}
                    icon={<Shield size={14} />}
                />
                <InfoCard
                    label={t("started")}
                    value={
                        report.startedAt
                            ? format(
                                  new Date(report.startedAt),
                                  "HH:mm:ss dd/MM",
                              )
                            : "—"
                    }
                    icon={<Clock size={14} />}
                />
                <InfoCard
                    label={t("duration")}
                    value={
                        duration !== null
                            ? `${duration}s`
                            : isActive
                              ? "running…"
                              : "—"
                    }
                    icon={<Clock size={14} />}
                />
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <Panel className="p-4">
                    <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                        {t("alerts")}
                    </p>
                    <p
                        className="font-mono text-3xl font-bold"
                        style={{ color: "var(--warn)" }}
                    >
                        {report.alertsCount}
                    </p>
                </Panel>

                {m ? (
                    <>
                        <Panel className="p-4">
                            <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                                TP / FP / FN
                            </p>
                            <p className="font-mono text-base">
                                <span style={{ color: "var(--accent-2)" }}>
                                    {m.tp}
                                </span>
                                {" / "}
                                <span style={{ color: "var(--warn)" }}>
                                    {m.fp}
                                </span>
                                {" / "}
                                <span style={{ color: "var(--danger)" }}>
                                    {m.fn}
                                </span>
                            </p>
                        </Panel>
                        <Panel className="p-4">
                            <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                                {t("f1Score")}
                            </p>
                            <p
                                className="font-mono text-3xl font-bold"
                                style={{ color: "var(--accent)" }}
                            >
                                {m.f1 != null
                                    ? `${(m.f1 * 100).toFixed(1)}%`
                                    : "—"}
                            </p>
                        </Panel>
                        <Panel className="p-4">
                            <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                                {t("detectionLatency")}
                            </p>
                            <p
                                className="font-mono text-3xl font-bold"
                                style={{ color: "var(--accent-2)" }}
                            >
                                {m.latencyMs != null ? `${m.latencyMs}ms` : "—"}
                            </p>
                        </Panel>
                    </>
                ) : (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Panel key={i} className="p-4">
                            <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                                —
                            </p>
                            <p className="font-mono text-3xl font-bold text-text-dim">
                                —
                            </p>
                        </Panel>
                    ))
                )}
            </div>

            {/* ── Attack result banner ── */}
            {report.attackSuccess != null && (
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                    style={{
                        background: `color-mix(in srgb, ${report.attackSuccess ? "var(--danger)" : "var(--accent-2)"} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${report.attackSuccess ? "var(--danger)" : "var(--accent-2)"} 25%, transparent)`,
                    }}
                >
                    {report.attackSuccess ? (
                        <>
                            <XCircle
                                size={18}
                                style={{ color: "var(--danger)" }}
                            />
                            <p
                                className="font-mono text-sm"
                                style={{ color: "var(--danger)" }}
                            >
                                {t("attackSucceeded")}
                            </p>
                        </>
                    ) : (
                        <>
                            <CheckCircle2
                                size={18}
                                style={{ color: "var(--accent-2)" }}
                            />
                            <p
                                className="font-mono text-sm"
                                style={{ color: "var(--accent-2)" }}
                            >
                                {t("attackBlocked")}
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* ── Metrics / Radar / Timeline ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Detection metrics table */}
                {m ? (
                    <Panel className="p-5">
                        <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                            // {t("detectionMetricsFull")}
                        </p>
                        <div>
                            <MetricRow
                                label={t("truePositives")}
                                value={String(m.tp)}
                                color="var(--accent-2)"
                            />
                            <MetricRow
                                label={t("falsePositives")}
                                value={String(m.fp)}
                                color="var(--warn)"
                            />
                            <MetricRow
                                label={t("falseNegatives")}
                                value={String(m.fn)}
                                color="var(--danger)"
                            />
                            <MetricRow
                                label={t("precision")}
                                value={
                                    m.precision != null
                                        ? `${(m.precision * 100).toFixed(1)}%`
                                        : "—"
                                }
                                color="var(--accent)"
                            />
                            <MetricRow
                                label={t("recall")}
                                value={
                                    m.recall != null
                                        ? `${(m.recall * 100).toFixed(1)}%`
                                        : "—"
                                }
                                color="var(--accent)"
                            />
                            <MetricRow
                                label={t("f1Score")}
                                value={
                                    m.f1 != null
                                        ? `${(m.f1 * 100).toFixed(1)}%`
                                        : "—"
                                }
                                color="var(--accent)"
                            />
                            <MetricRow
                                label={t("detectionLatency")}
                                value={
                                    m.latencyMs != null
                                        ? `${m.latencyMs}ms`
                                        : "—"
                                }
                                color="var(--warn)"
                            />
                        </div>
                    </Panel>
                ) : (
                    <Panel className="p-5 flex items-center justify-center">
                        <p className="font-mono text-sm text-text-dim text-center">
                            {isActive
                                ? "Metrics will appear after run completes"
                                : "No metrics available"}
                        </p>
                    </Panel>
                )}

                {/* Radar chart */}
                {radarData.length > 0 ? (
                    <Panel className="p-5">
                        <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-3">
                            // {t("performanceRadar")}
                        </p>
                        <ResponsiveContainer width="100%" height={230}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis
                                    dataKey="metric"
                                    tick={{
                                        fill: "var(--text-dim)",
                                        fontSize: 12,
                                        fontFamily: "monospace",
                                    }}
                                />
                                <Radar
                                    dataKey="value"
                                    stroke="var(--accent)"
                                    fill="var(--accent)"
                                    fillOpacity={0.15}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    formatter={(v: any) => [`${v}%`, ""]}
                                    contentStyle={{
                                        background: "var(--bg-2)",
                                        border: "1px solid var(--border)",
                                        fontFamily: "monospace",
                                        fontSize: 13,
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Panel>
                ) : (
                    <Panel className="p-5 flex items-center justify-center">
                        <p className="font-mono text-sm text-text-dim text-center">
                            {isActive
                                ? "Radar will appear after run completes"
                                : "No metrics for radar"}
                        </p>
                    </Panel>
                )}

                {/* Attack timeline */}
                <Panel className="p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("attackTimeline")}
                    </p>
                    {attackEvents.length === 0 ? (
                        <p className="font-mono text-sm text-text-dim text-center py-8">
                            {isActive
                                ? "Waiting for events…"
                                : "No events recorded"}
                        </p>
                    ) : (
                        <div className="space-y-0">
                            {attackEvents.map((ev, i) => (
                                <div
                                    key={ev.id}
                                    className="flex items-start gap-3"
                                >
                                    <div className="relative flex flex-col items-center flex-shrink-0">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full mt-1"
                                            style={{
                                                background: evColor(ev.type),
                                            }}
                                        />
                                        {i < attackEvents.length - 1 && (
                                            <div
                                                className="w-px flex-1 min-h-[20px] mt-1"
                                                style={{
                                                    background: "var(--border)",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="pb-3 min-w-0 flex-1">
                                        <p
                                            className="font-mono text-sm font-medium"
                                            style={{ color: evColor(ev.type) }}
                                        >
                                            {ev.type
                                                .replace(/_/g, " ")
                                                .toUpperCase()}
                                        </p>
                                        <p className="font-mono text-xs text-text-dim">
                                            {format(
                                                new Date(ev.timestamp),
                                                "HH:mm:ss.SSS",
                                            )}
                                        </p>
                                        {ev.data &&
                                            "snippet" in ev.data &&
                                            !!ev.data.snippet && (
                                                <p
                                                    className="font-mono text-xs text-text-dim mt-0.5 truncate"
                                                    title={String(
                                                        ev.data.snippet,
                                                    )}
                                                >
                                                    {String(
                                                        ev.data.snippet,
                                                    ).slice(0, 80)}
                                                </p>
                                            )}
                                        {ev.data &&
                                            "message" in ev.data &&
                                            !!ev.data.message && (
                                                <p
                                                    className="font-mono text-xs mt-0.5 truncate"
                                                    style={{
                                                        color: "var(--danger)",
                                                    }}
                                                >
                                                    {String(ev.data.message)}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {/* ── Alerts table ── */}
            {(alertsData || report.status === "FINISHED") && (
                <Panel>
                    <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <p className="font-mono text-sm uppercase tracking-widest text-text-dim">
                            // {t("capturedAlerts")}
                            {alertsData && (
                                <span className="ml-2 text-text-dim">
                                    · {alertsData.total} {t("total")}
                                </span>
                            )}
                        </p>
                        {totalAlertPages > 1 && (
                            <p className="font-mono text-sm text-text-dim">
                                Page {alertPage} / {totalAlertPages}
                            </p>
                        )}
                    </div>

                    {!alertsData ? (
                        <div className="flex items-center justify-center py-10">
                            <div
                                className="w-5 h-5 border-2 rounded-full animate-spin"
                                style={{
                                    borderColor: "var(--border)",
                                    borderTopColor: "var(--accent)",
                                }}
                            />
                        </div>
                    ) : alertsData.data.length === 0 ? (
                        <p className="font-mono text-sm text-text-dim text-center py-10">
                            {t("noAlertsFound")}
                        </p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom:
                                                    "1px solid var(--border)",
                                            }}
                                        >
                                            {[
                                                t("timestamp"),
                                                t("signature"),
                                                t("severity"),
                                                t("srcIp"),
                                                t("dstIp"),
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3 text-left font-mono text-xs uppercase tracking-widest text-text-dim"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alertsData.data.map((a) => (
                                            <tr
                                                key={a.id}
                                                style={{
                                                    borderBottom:
                                                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                                                }}
                                            >
                                                <td className="px-5 py-3 font-mono text-sm text-text-dim whitespace-nowrap">
                                                    {format(
                                                        new Date(a.timestamp),
                                                        "HH:mm:ss.SSS",
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 font-mono text-sm text-text max-w-xs">
                                                    <span
                                                        className="truncate block"
                                                        title={a.signature}
                                                    >
                                                        {a.signature}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className="inline-flex px-2.5 py-1 rounded text-sm font-mono"
                                                        style={{
                                                            color: sevColor(
                                                                a.severity,
                                                            ),
                                                            background: `color-mix(in srgb, ${sevColor(a.severity)} 12%, transparent)`,
                                                            border: `1px solid color-mix(in srgb, ${sevColor(a.severity)} 25%, transparent)`,
                                                        }}
                                                    >
                                                        {sevLabel(a.severity)} ·{" "}
                                                        {a.severity}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 font-mono text-sm text-text-dim">
                                                    {a.srcIp}
                                                </td>
                                                <td className="px-5 py-3 font-mono text-sm text-text-dim">
                                                    {a.destIp}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalAlertPages > 1 && (
                                <div
                                    className="flex items-center justify-between px-5 py-3"
                                    style={{
                                        borderTop: "1px solid var(--border)",
                                    }}
                                >
                                    <p className="font-mono text-sm text-text-dim">
                                        {(alertPage - 1) * ALERTS_PER_PAGE + 1}–
                                        {Math.min(
                                            alertPage * ALERTS_PER_PAGE,
                                            alertsData.total,
                                        )}{" "}
                                        of {alertsData.total}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={alertPage <= 1}
                                            onClick={() =>
                                                setAlertPage((p) => p - 1)
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-sm transition-all disabled:opacity-30"
                                            style={{
                                                background: "var(--bg-3)",
                                                border: "1px solid var(--border)",
                                                color: "var(--text-dim)",
                                            }}
                                        >
                                            <ChevronLeft size={14} /> Prev
                                        </button>
                                        <button
                                            disabled={
                                                alertPage >= totalAlertPages
                                            }
                                            onClick={() =>
                                                setAlertPage((p) => p + 1)
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 rounded font-mono text-sm transition-all disabled:opacity-30"
                                            style={{
                                                background: "var(--bg-3)",
                                                border: "1px solid var(--border)",
                                                color: "var(--text-dim)",
                                            }}
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Panel>
            )}
        </div>
    );
}
