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

const ALERTS_PER_PAGE = 50;

export default function RunDetail() {
    const { runId } = useParams<{ runId: string }>();
    const { t } = useI18n();
    const [alertPage, setAlertPage] = useState(1);

    const {
        data: report,
        isLoading,
        error,
    } = useQuery<RunReport>({
        queryKey: ["run-report", runId],
        queryFn: () => runsApi.report(runId!),
        refetchInterval: (q) => {
            const s = q.state.data?.status;
            return s === "RUNNING" || s === "QUEUED" ? 3000 : false;
        },
        enabled: !!runId,
    });

    // GET /runs/:runId/alerts?page=N&limit=50
    const { data: alertsData } = useQuery<PaginatedAlerts>({
        queryKey: ["run-alerts", runId, alertPage],
        queryFn: () => runsApi.alerts(runId!, alertPage, ALERTS_PER_PAGE),
        enabled: !!report && report.status === "FINISHED",
    });

    if (isLoading)
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

    if (error || !report)
        return (
            <div className="flex items-center justify-center py-20 animate-fade-in">
                <div className="text-center">
                    <AlertTriangle
                        size={28}
                        className="mx-auto mb-3"
                        style={{ color: "var(--danger)" }}
                    />
                    <p
                        className="font-mono text-base"
                        style={{ color: "var(--danger)" }}
                    >
                        {t("runNotFound")}
                    </p>
                    <Link
                        to="/experiments"
                        className="font-mono text-sm text-text-dim hover:text-accent mt-2 block transition-colors"
                    >
                        ← {t("backToExp")}
                    </Link>
                </div>
            </div>
        );

    const m = report.metrics;
    const attackEvents = report.attackEvents ?? [];

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

    const evColor = (type: string) => {
        if (type === "attack_success") return "var(--danger)";
        if (type === "attack_fail") return "var(--accent-2)";
        if (type === "attack_start") return "var(--accent)";
        if (type === "attack_end") return "var(--warn)";
        if (type === "error") return "var(--danger)";
        return "var(--muted)";
    };

    const totalAlertPages = alertsData
        ? Math.ceil(alertsData.total / ALERTS_PER_PAGE)
        : 0;

    return (
        <div className="animate-fade-in">
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

            {/* Info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    {
                        label: t("scenario"),
                        value: report.scenario ?? "—",
                        icon: <Target size={14} />,
                    },
                    {
                        label: t("idsProfile"),
                        value: report.idsProfile ?? "default",
                        icon: <Shield size={14} />,
                    },
                    {
                        label: t("started"),
                        value: report.startedAt
                            ? format(new Date(report.startedAt), "HH:mm:ss")
                            : "—",
                        icon: <Clock size={14} />,
                    },
                    {
                        label: t("duration"),
                        value: duration !== null ? `${duration}s` : "—",
                        icon: <Clock size={14} />,
                    },
                ].map(({ label, value, icon }) => (
                    <Panel key={label} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-text-dim">{icon}</span>
                            <p className="font-mono text-xs uppercase tracking-widest text-text-dim">
                                {label}
                            </p>
                        </div>
                        <p className="font-mono text-base text-text-bright">
                            {value}
                        </p>
                    </Panel>
                ))}
            </div>

            {/* Quick stats */}
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
                {m && (
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
                )}
            </div>

            {/* Attack banner */}
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

            {/* 3 columns: metrics / radar / timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {m && (
                    <Panel className="p-5">
                        <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                            // {t("detectionMetricsFull")}
                        </p>
                        <div>
                            {[
                                {
                                    label: t("truePositives"),
                                    value: m.tp,
                                    color: "var(--accent-2)",
                                },
                                {
                                    label: t("falsePositives"),
                                    value: m.fp,
                                    color: "var(--warn)",
                                },
                                {
                                    label: t("falseNegatives"),
                                    value: m.fn,
                                    color: "var(--danger)",
                                },
                                {
                                    label: t("precision"),
                                    value:
                                        m.precision != null
                                            ? `${(m.precision * 100).toFixed(1)}%`
                                            : "—",
                                    color: "var(--accent)",
                                },
                                {
                                    label: t("recall"),
                                    value:
                                        m.recall != null
                                            ? `${(m.recall * 100).toFixed(1)}%`
                                            : "—",
                                    color: "var(--accent)",
                                },
                                {
                                    label: t("f1Score"),
                                    value:
                                        m.f1 != null
                                            ? `${(m.f1 * 100).toFixed(1)}%`
                                            : "—",
                                    color: "var(--accent)",
                                },
                                {
                                    label: t("detectionLatency"),
                                    value:
                                        m.latencyMs != null
                                            ? `${m.latencyMs}ms`
                                            : "—",
                                    color: "var(--warn)",
                                },
                            ].map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between py-2.5"
                                    style={{
                                        borderBottom:
                                            "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                                    }}
                                >
                                    <span className="font-mono text-sm text-text-dim">
                                        {label}
                                    </span>
                                    <span
                                        className="font-mono text-base font-bold"
                                        style={{ color }}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                )}

                {radarData.length > 0 && (
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
                                    formatter={(v: any) => `${v}%`}
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
                )}

                <Panel className="p-5">
                    <p className="font-mono text-sm uppercase tracking-widest text-text-dim mb-4">
                        // {t("attackTimeline")}
                    </p>
                    {attackEvents.length === 0 ? (
                        <p className="font-mono text-sm text-text-dim text-center py-8">
                            No events recorded
                        </p>
                    ) : (
                        <div className="space-y-1">
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
                                                className="w-px min-h-6 mt-1"
                                                style={{
                                                    background: "var(--border)",
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="pb-3 min-w-0">
                                        <p className="font-mono text-sm font-medium text-text">
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
                                                    className="font-mono text-xs text-text-dim mt-0.5 truncate max-w-[200px]"
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
                                                    className="font-mono text-xs mt-0.5 truncate max-w-[200px]"
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

            {/* Alerts table + pagination */}
            {alertsData && (
                <Panel>
                    <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <p className="font-mono text-sm uppercase tracking-widest text-text-dim">
                            // {t("capturedAlerts")} · {alertsData.total}{" "}
                            {t("total")}
                        </p>
                        {totalAlertPages > 1 && (
                            <p className="font-mono text-sm text-text-dim">
                                Page {alertPage} / {totalAlertPages}
                            </p>
                        )}
                    </div>

                    {alertsData.data.length === 0 ? (
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
                                                            color:
                                                                a.severity === 1
                                                                    ? "var(--danger)"
                                                                    : a.severity ===
                                                                        2
                                                                      ? "var(--warn)"
                                                                      : "var(--accent-2)",
                                                            background: `color-mix(in srgb, ${a.severity === 1 ? "var(--danger)" : a.severity === 2 ? "var(--warn)" : "var(--accent-2)"} 12%, transparent)`,
                                                            border: `1px solid color-mix(in srgb, ${a.severity === 1 ? "var(--danger)" : a.severity === 2 ? "var(--warn)" : "var(--accent-2)"} 25%, transparent)`,
                                                        }}
                                                    >
                                                        {a.severity === 1
                                                            ? "HIGH"
                                                            : a.severity === 2
                                                              ? "MED"
                                                              : "LOW"}{" "}
                                                        · {a.severity}
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
