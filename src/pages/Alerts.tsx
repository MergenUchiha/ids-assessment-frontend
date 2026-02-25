import { useQuery } from "@tanstack/react-query";
import { alertsApi } from "../api/client";
import { Alert } from "../types";
import Panel from "../components/Panel";
import PageHeader from "../components/PageHeader";
import { useI18n } from "../i18n";
import { Shield, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const PAGE_SIZE = 50;

export default function Alerts() {
    const { t } = useI18n();
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<keyof Alert>("timestamp");
    const [sortAsc, setSortAsc] = useState(false);
    const [page, setPage] = useState(1);

    const { data: alerts = [], isLoading } = useQuery<Alert[]>({
        queryKey: ["alerts-all"],
        queryFn: () => alertsApi.list(),
        refetchInterval: 15_000,
    });

    const sevColor = (s: number) =>
        s === 1 ? "var(--danger)" : s === 2 ? "var(--warn)" : "var(--accent-2)";

    const filtered = alerts
        .filter(
            (a) =>
                !search ||
                a.signature.toLowerCase().includes(search.toLowerCase()) ||
                a.srcIp.includes(search) ||
                a.destIp.includes(search),
        )
        .sort((a, b) => {
            const cmp = String(a[sortField] ?? "").localeCompare(
                String(b[sortField] ?? ""),
            );
            return sortAsc ? cmp : -cmp;
        });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 when search changes
    const handleSearch = (v: string) => {
        setSearch(v);
        setPage(1);
    };

    const stats = {
        sev1: alerts.filter((a) => a.severity === 1).length,
        sev2: alerts.filter((a) => a.severity === 2).length,
        sev3: alerts.filter((a) => a.severity === 3).length,
    };

    const SortBtn = ({
        field,
        label,
    }: {
        field: keyof Alert;
        label: string;
    }) => (
        <button
            className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-text-dim hover:text-text transition-colors"
            onClick={() => {
                if (sortField === field) setSortAsc((p) => !p);
                else {
                    setSortField(field);
                    setSortAsc(true);
                }
                setPage(1);
            }}
        >
            {label}
            {sortField === field ? (
                sortAsc ? (
                    <ArrowUp size={10} />
                ) : (
                    <ArrowDown size={10} />
                )
            ) : null}
        </button>
    );

    return (
        <div className="animate-fade-in">
            <PageHeader title={t("alerts")} sub={`// ${t("suricataAlerts")}`} />

            {/* Severity stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                    {
                        label: t("critical"),
                        value: stats.sev1,
                        color: "var(--danger)",
                    },
                    {
                        label: t("high"),
                        value: stats.sev2,
                        color: "var(--warn)",
                    },
                    {
                        label: t("medium"),
                        value: stats.sev3,
                        color: "var(--accent-2)",
                    },
                ].map(({ label, value, color }) => (
                    <Panel key={label} className="p-4 relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 right-0 h-px"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                            }}
                        />
                        <p className="font-mono text-xs uppercase tracking-widest text-text-dim mb-2">
                            {label}
                        </p>
                        <p
                            className="font-mono font-bold text-4xl"
                            style={{ color }}
                        >
                            {value}
                        </p>
                    </Panel>
                ))}
            </div>

            <Panel>
                {/* Search bar */}
                <div
                    className="px-5 py-3 flex items-center gap-3"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <Shield size={14} className="text-text-dim flex-shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={t("filterAlerts")}
                        className="flex-1 bg-transparent font-mono text-sm focus:outline-none text-text placeholder:text-text-dim"
                    />
                    <span className="font-mono text-sm text-text-dim whitespace-nowrap">
                        {filtered.length} {t("events")}
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div
                            className="w-7 h-7 border-2 rounded-full animate-spin"
                            style={{
                                borderColor: "var(--border)",
                                borderTopColor: "var(--accent)",
                            }}
                        />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="font-mono text-sm text-text-dim text-center py-16">
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
                                        <th className="px-5 py-3 text-left">
                                            <SortBtn
                                                field="timestamp"
                                                label={t("timestamp")}
                                            />
                                        </th>
                                        <th className="px-5 py-3 text-left">
                                            <SortBtn
                                                field="signature"
                                                label={t("signature")}
                                            />
                                        </th>
                                        <th className="px-5 py-3 text-left">
                                            <SortBtn
                                                field="severity"
                                                label={t("severity")}
                                            />
                                        </th>
                                        <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-widest text-text-dim">
                                            {t("srcIp")}
                                        </th>
                                        <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-widest text-text-dim">
                                            {t("dstIp")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="transition-colors"
                                            style={{
                                                borderBottom:
                                                    "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                                            }}
                                        >
                                            <td className="px-5 py-3 font-mono text-sm text-text-dim whitespace-nowrap">
                                                {format(
                                                    new Date(a.timestamp),
                                                    "MM/dd HH:mm:ss",
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
                                                    {a.severity === 1
                                                        ? "HIGH"
                                                        : a.severity === 2
                                                          ? "MED"
                                                          : "LOW"}{" "}
                                                    ·{a.severity}
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
                        {totalPages > 1 && (
                            <div
                                className="flex items-center justify-between px-5 py-3"
                                style={{ borderTop: "1px solid var(--border)" }}
                            >
                                <p className="font-mono text-sm text-text-dim">
                                    Page {page} of {totalPages} ·{" "}
                                    {filtered.length} results
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="px-3 py-1.5 rounded font-mono text-sm transition-all disabled:opacity-30"
                                        style={{
                                            background: "var(--bg-3)",
                                            border: "1px solid var(--border)",
                                            color: "var(--text-dim)",
                                        }}
                                    >
                                        ← Prev
                                    </button>
                                    {Array.from(
                                        { length: Math.min(totalPages, 7) },
                                        (_, i) => {
                                            const p =
                                                totalPages <= 7
                                                    ? i + 1
                                                    : page <= 4
                                                      ? i + 1
                                                      : page >= totalPages - 3
                                                        ? totalPages - 6 + i
                                                        : page - 3 + i;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className="px-3 py-1.5 rounded font-mono text-sm transition-all"
                                                    style={{
                                                        background:
                                                            page === p
                                                                ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                                                                : "var(--bg-3)",
                                                        border: `1px solid ${page === p ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border)"}`,
                                                        color:
                                                            page === p
                                                                ? "var(--accent)"
                                                                : "var(--text-dim)",
                                                    }}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        },
                                    )}
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="px-3 py-1.5 rounded font-mono text-sm transition-all disabled:opacity-30"
                                        style={{
                                            background: "var(--bg-3)",
                                            border: "1px solid var(--border)",
                                            color: "var(--text-dim)",
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Panel>
        </div>
    );
}
