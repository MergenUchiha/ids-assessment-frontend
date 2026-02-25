import clsx from "clsx";
import { RunStatus } from "../types";

const MAP: Record<
    RunStatus,
    { label: string; style: React.CSSProperties; dot: string }
> = {
    QUEUED: {
        label: "Queued",
        style: {
            background: "rgba(55,65,81,0.3)",
            color: "#94a3b8",
            border: "1px solid rgba(55,65,81,0.5)",
        },
        dot: "bg-gray-500",
    },
    RUNNING: {
        label: "Running",
        style: {
            background: "rgba(249,115,22,0.15)",
            color: "var(--warn)",
            border: "1px solid rgba(249,115,22,0.3)",
        },
        dot: "bg-orange-400 animate-pulse",
    },
    FINISHED: {
        label: "Finished",
        style: {
            background: "rgba(34,211,165,0.15)",
            color: "var(--accent-2)",
            border: "1px solid rgba(34,211,165,0.3)",
        },
        dot: "bg-emerald-400",
    },
    FAILED: {
        label: "Failed",
        style: {
            background: "rgba(239,68,68,0.15)",
            color: "var(--danger)",
            border: "1px solid rgba(239,68,68,0.3)",
        },
        dot: "bg-red-400",
    },
};

export default function StatusBadge({ status }: { status: RunStatus }) {
    const { label, style, dot } = MAP[status] ?? MAP.QUEUED;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-mono uppercase tracking-wide"
            style={style}
        >
            <span className={clsx("w-2 h-2 rounded-full", dot)} />
            {label}
        </span>
    );
}
