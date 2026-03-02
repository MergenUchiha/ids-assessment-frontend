import { useEffect, useRef, useState, useCallback } from "react";
import type { RunReport, AttackEvent } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Packet {
    id: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    progress: number; // 0..1
    color: string;
    label: string;
    speed: number;
    createdAt: number;
    type: "attack" | "response" | "alert" | "block" | "scan";
}

interface NodeState {
    attacker: "idle" | "scanning" | "attacking" | "success" | "failed";
    victim: "idle" | "probed" | "compromised" | "defended";
    suricata: "idle" | "monitoring" | "detecting" | "alerting" | "blocking";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PACKET_COLORS = {
    attack: "#ef4444",
    response: "#22d3a5",
    alert: "#f97316",
    block: "#a78bfa",
    scan: "#38bdf8",
};

const NODE_POSITIONS = {
    attacker: { x: 120, y: 200 },
    victim: { x: 520, y: 200 },
    suricata: { x: 320, y: 60 },
};

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function easeInOut(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Canvas Renderer ──────────────────────────────────────────────────────────
function useAnimationCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    packets: React.MutableRefObject<Packet[]>,
    nodeState: NodeState,
    alertCount: number,
    report: RunReport | null,
) {
    const animFrameRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const drawNode = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            label: string,
            sublabel: string,
            state: string,
            glowColor: string,
            icon: string,
            time: number,
        ) => {
            const radius = 44;
            const pulse = Math.sin(time * 0.003) * 0.5 + 0.5;

            // Outer glow ring (animated)
            const isActive = state !== "idle" && state !== "monitoring";
            if (isActive) {
                const glowRadius = radius + 12 + pulse * 8;
                const grd = ctx.createRadialGradient(
                    x,
                    y,
                    radius,
                    x,
                    y,
                    glowRadius,
                );
                grd.addColorStop(0, glowColor + "55");
                grd.addColorStop(1, glowColor + "00");
                ctx.beginPath();
                ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            // Rotating ring for active states
            if (
                state === "scanning" ||
                state === "attacking" ||
                state === "detecting" ||
                state === "alerting"
            ) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(time * 0.002);
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const dotX = Math.cos(angle) * (radius + 10);
                    const dotY = Math.sin(angle) * (radius + 10);
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = glowColor + (i % 2 === 0 ? "cc" : "55");
                    ctx.fill();
                }
                ctx.restore();
            }

            // Main circle
            const bgGrd = ctx.createRadialGradient(
                x - 8,
                y - 8,
                5,
                x,
                y,
                radius,
            );
            bgGrd.addColorStop(0, "#1a2133");
            bgGrd.addColorStop(1, "#0d1117");
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = bgGrd;
            ctx.fill();

            // Border
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = isActive ? glowColor + "cc" : glowColor + "44";
            ctx.lineWidth = isActive ? 2 : 1.5;
            ctx.stroke();

            // Icon
            ctx.font = "26px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = glowColor;
            ctx.fillText(icon, x, y);

            // Label
            ctx.font = "bold 11px 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#eef2ff";
            ctx.fillText(label, x, y + radius + 10);

            // State badge
            const stateColors: Record<string, string> = {
                idle: "#6b7f96",
                monitoring: "#38bdf8",
                scanning: "#38bdf8",
                probed: "#f97316",
                attacking: "#ef4444",
                compromised: "#ef4444",
                detecting: "#f97316",
                alerting: "#ef4444",
                blocking: "#a78bfa",
                success: "#ef4444",
                failed: "#22d3a5",
                defended: "#22d3a5",
            };
            const stateColor = stateColors[state] ?? "#6b7f96";

            ctx.font = "9px 'JetBrains Mono', monospace";
            ctx.fillStyle = stateColor;
            ctx.fillText(sublabel || state.toUpperCase(), x, y + radius + 24);
        },
        [],
    );

    const drawConnection = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            active: boolean,
            color: string,
            dashed = false,
        ) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            if (dashed) {
                ctx.setLineDash([4, 6]);
            } else {
                ctx.setLineDash([]);
            }
            ctx.strokeStyle = active ? color + "88" : "#1e2a3a";
            ctx.lineWidth = active ? 1.5 : 1;
            ctx.stroke();
            ctx.setLineDash([]);
        },
        [],
    );

    const drawPacket = useCallback(
        (ctx: CanvasRenderingContext2D, packet: Packet, time: number) => {
            const t = easeInOut(packet.progress);
            const x = lerp(packet.fromX, packet.toX, t);
            const y = lerp(packet.fromY, packet.toY, t);

            // Tail trail
            for (let i = 1; i <= 5; i++) {
                const tailT = Math.max(0, t - i * 0.04);
                const tx = lerp(packet.fromX, packet.toX, easeInOut(tailT));
                const ty = lerp(packet.fromY, packet.toY, easeInOut(tailT));
                ctx.beginPath();
                ctx.arc(tx, ty, 3 - i * 0.4, 0, Math.PI * 2);
                ctx.fillStyle =
                    packet.color +
                    Math.floor((6 - i) * 25)
                        .toString(16)
                        .padStart(2, "0");
                ctx.fill();
            }

            // Main packet dot
            const grd = ctx.createRadialGradient(x, y, 0, x, y, 7);
            grd.addColorStop(0, "#ffffff");
            grd.addColorStop(0.3, packet.color);
            grd.addColorStop(1, packet.color + "00");
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Label
            if (packet.label) {
                ctx.font = "8px 'JetBrains Mono', monospace";
                ctx.fillStyle = packet.color;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(packet.label, x, y - 9);
            }
        },
        [],
    );

    const drawGrid = useCallback(
        (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.strokeStyle = "#1e2a3a33";
            ctx.lineWidth = 0.5;
            const step = 30;
            for (let x = 0; x < w; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        },
        [],
    );

    const drawAlertCounter = useCallback(
        (ctx: CanvasRenderingContext2D, count: number, time: number) => {
            if (count === 0) return;
            const x = NODE_POSITIONS.suricata.x;
            const y = NODE_POSITIONS.suricata.y;
            const pulse = Math.sin(time * 0.005) * 0.5 + 0.5;

            ctx.font = `bold 10px 'JetBrains Mono', monospace`;
            ctx.fillStyle = `rgba(239, 68, 68, ${0.6 + pulse * 0.4})`;
            ctx.textAlign = "center";
            ctx.fillText(`⚠ ${count} ALERTS`, x, y - 65);
        },
        [],
    );

    const drawStatusBanner = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            report: RunReport | null,
            w: number,
        ) => {
            if (!report) return;

            const bannerText =
                report.status === "RUNNING"
                    ? "● SIMULATION IN PROGRESS"
                    : report.status === "FINISHED" && report.attackSuccess
                      ? "⚡ ATTACK SUCCEEDED — IDS DETECTION CRITICAL"
                      : report.status === "FINISHED"
                        ? "✓ ATTACK BLOCKED — IDS EFFECTIVE"
                        : report.status === "FAILED"
                          ? "✕ SIMULATION FAILED"
                          : report.status === "QUEUED"
                            ? "◌ QUEUED — WAITING FOR RUNNER"
                            : "";

            if (!bannerText) return;

            const color =
                report.status === "RUNNING"
                    ? "#f97316"
                    : report.status === "FINISHED" && report.attackSuccess
                      ? "#ef4444"
                      : report.status === "FINISHED"
                        ? "#22d3a5"
                        : "#6b7f96";

            ctx.font = "bold 11px 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = color;
            ctx.fillText(bannerText, w / 2, 14);
        },
        [],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const animate = (time: number) => {
            const delta = time - lastTimeRef.current;
            lastTimeRef.current = time;

            const W = canvas.width;
            const H = canvas.height;

            // Clear
            ctx.clearRect(0, 0, W, H);

            // Background
            ctx.fillStyle = "#07090f";
            ctx.fillRect(0, 0, W, H);

            // Grid
            drawGrid(ctx, W, H);

            // Status banner
            drawStatusBanner(ctx, report, W);

            const A = NODE_POSITIONS.attacker;
            const V = NODE_POSITIONS.victim;
            const S = NODE_POSITIONS.suricata;

            // Connections
            const attackActive =
                nodeState.attacker === "scanning" ||
                nodeState.attacker === "attacking";
            const suricataActive = nodeState.suricata !== "idle";

            drawConnection(ctx, A.x, A.y, V.x, V.y, attackActive, "#ef4444");
            drawConnection(
                ctx,
                A.x,
                A.y,
                S.x,
                S.y,
                suricataActive,
                "#38bdf8",
                true,
            );
            drawConnection(
                ctx,
                V.x,
                V.y,
                S.x,
                S.y,
                suricataActive,
                "#22d3a5",
                true,
            );

            // Network label on the Attacker→Victim line
            ctx.save();
            ctx.font = "9px 'JetBrains Mono', monospace";
            ctx.fillStyle = "#1e2a3a";
            ctx.textAlign = "center";
            const midX = (A.x + V.x) / 2;
            const midY = (A.y + V.y) / 2;
            ctx.fillRect(midX - 28, midY - 9, 56, 14);
            ctx.fillStyle = "#2d3d52";
            ctx.fillText("eth0  TCP/IP", midX, midY + 1);
            ctx.restore();

            // Update and draw packets
            const pkts = packets.current;
            for (let i = pkts.length - 1; i >= 0; i--) {
                const p = pkts[i];
                p.progress = Math.min(1, p.progress + p.speed * (delta / 16));
                if (p.progress >= 1) {
                    pkts.splice(i, 1);
                } else {
                    drawPacket(ctx, p, time);
                }
            }

            // Nodes
            const getNodeSublabel = (key: keyof NodeState) => {
                const s = nodeState[key];
                const labels: Record<string, string> = {
                    idle: "STANDBY",
                    scanning: "SCANNING...",
                    attacking: "EXPLOITING",
                    success: "PWNED",
                    failed: "BLOCKED",
                    probed: "PROBED",
                    compromised: "COMPROMISED",
                    defended: "SECURED",
                    monitoring: "MONITORING",
                    detecting: "DETECTING",
                    alerting: "ALERTING!",
                    blocking: "BLOCKING",
                };
                return labels[s] ?? s.toUpperCase();
            };

            drawNode(
                ctx,
                A.x,
                A.y,
                "ATTACKER",
                getNodeSublabel("attacker"),
                nodeState.attacker,
                "#ef4444",
                "💀",
                time,
            );
            drawNode(
                ctx,
                V.x,
                V.y,
                "VICTIM",
                getNodeSublabel("victim"),
                nodeState.victim,
                "#38bdf8",
                "🖥️",
                time,
            );
            drawNode(
                ctx,
                S.x,
                S.y,
                "SURICATA IDS",
                getNodeSublabel("suricata"),
                nodeState.suricata,
                "#22d3a5",
                "🛡️",
                time,
            );

            // Alert counter
            drawAlertCounter(ctx, alertCount, time);

            // Metrics overlay (bottom-right) if finished
            if (report?.metrics && report.status === "FINISHED") {
                const m = report.metrics;
                ctx.save();
                ctx.font = "9px 'JetBrains Mono', monospace";
                ctx.fillStyle = "#0d1117cc";
                ctx.fillRect(W - 130, H - 70, 122, 62);
                ctx.strokeStyle = "#1e2a3a";
                ctx.lineWidth = 1;
                ctx.strokeRect(W - 130, H - 70, 122, 62);

                const lines = [
                    [
                        "F1",
                        m.f1 != null ? `${(m.f1 * 100).toFixed(0)}%` : "—",
                        "#a78bfa",
                    ],
                    [
                        "PREC",
                        m.precision != null
                            ? `${(m.precision * 100).toFixed(0)}%`
                            : "—",
                        "#22d3a5",
                    ],
                    [
                        "RECALL",
                        m.recall != null
                            ? `${(m.recall * 100).toFixed(0)}%`
                            : "—",
                        "#f97316",
                    ],
                    [
                        "LATENCY",
                        m.latencyMs != null ? `${m.latencyMs}ms` : "—",
                        "#38bdf8",
                    ],
                ] as [string, string, string][];

                lines.forEach(([label, val, color], i) => {
                    ctx.fillStyle = "#6b7f96";
                    ctx.textAlign = "left";
                    ctx.fillText(label, W - 124, H - 57 + i * 13);
                    ctx.fillStyle = color;
                    ctx.textAlign = "right";
                    ctx.fillText(val, W - 16, H - 57 + i * 13);
                });
                ctx.restore();
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [
        nodeState,
        alertCount,
        report,
        drawNode,
        drawConnection,
        drawPacket,
        drawGrid,
        drawAlertCounter,
        drawStatusBanner,
    ]);
}

// ─── Packet spawner hook ──────────────────────────────────────────────────────
function usePacketSpawner(
    packets: React.MutableRefObject<Packet[]>,
    nodeState: NodeState,
    isActive: boolean,
) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const counterRef = useRef(0);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!isActive) return;

        const A = NODE_POSITIONS.attacker;
        const V = NODE_POSITIONS.victim;
        const S = NODE_POSITIONS.suricata;

        const spawnPacket = () => {
            counterRef.current++;
            const id = String(counterRef.current);

            if (
                nodeState.attacker === "scanning" ||
                nodeState.attacker === "attacking"
            ) {
                // Attacker → Victim
                packets.current.push({
                    id,
                    fromX: A.x,
                    fromY: A.y,
                    toX: V.x,
                    toY: V.y,
                    progress: 0,
                    color:
                        nodeState.attacker === "attacking"
                            ? PACKET_COLORS.attack
                            : PACKET_COLORS.scan,
                    label: nodeState.attacker === "attacking" ? "EXP" : "SYN",
                    speed: 0.018 + Math.random() * 0.008,
                    createdAt: Date.now(),
                    type:
                        nodeState.attacker === "attacking" ? "attack" : "scan",
                });
            }

            if (
                nodeState.suricata === "detecting" ||
                nodeState.suricata === "alerting"
            ) {
                // Mirror traffic mirrored to Suricata
                packets.current.push({
                    id: id + "s",
                    fromX: (A.x + V.x) / 2,
                    fromY: (A.y + V.y) / 2,
                    toX: S.x,
                    toY: S.y,
                    progress: 0,
                    color: PACKET_COLORS.alert,
                    label: "COPY",
                    speed: 0.025 + Math.random() * 0.01,
                    createdAt: Date.now(),
                    type: "alert",
                });
            }

            if (
                nodeState.suricata === "alerting" ||
                nodeState.suricata === "blocking"
            ) {
                // Suricata → Victim (alert/block signal)
                packets.current.push({
                    id: id + "b",
                    fromX: S.x,
                    fromY: S.y,
                    toX: V.x,
                    toY: V.y,
                    progress: 0,
                    color: PACKET_COLORS.block,
                    label: "ALERT",
                    speed: 0.022 + Math.random() * 0.01,
                    createdAt: Date.now(),
                    type: "block",
                });
            }

            // Victim response
            if (
                nodeState.victim === "probed" ||
                nodeState.victim === "compromised"
            ) {
                if (counterRef.current % 3 === 0) {
                    packets.current.push({
                        id: id + "r",
                        fromX: V.x,
                        fromY: V.y,
                        toX: A.x,
                        toY: A.y,
                        progress: 0,
                        color: PACKET_COLORS.response,
                        label: "RSP",
                        speed: 0.02 + Math.random() * 0.01,
                        createdAt: Date.now(),
                        type: "response",
                    });
                }
            }

            // Limit total packets
            if (packets.current.length > 40) {
                packets.current.splice(0, packets.current.length - 40);
            }
        };

        intervalRef.current = setInterval(spawnPacket, 350);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [nodeState, isActive, packets]);
}

// ─── State machine: attackEvents → NodeState ──────────────────────────────────
function computeNodeState(
    events: AttackEvent[],
    status: string,
    alertCount: number,
): NodeState {
    const types = new Set(events.map((e) => e.type));

    if (status === "QUEUED") {
        return { attacker: "idle", victim: "idle", suricata: "idle" };
    }

    if (status === "RUNNING") {
        if (types.has("attack_start") && !types.has("attack_end")) {
            return {
                attacker: "attacking",
                victim: "probed",
                suricata: alertCount > 0 ? "alerting" : "detecting",
            };
        }
        return {
            attacker: "scanning",
            victim: "idle",
            suricata: "monitoring",
        };
    }

    if (status === "FINISHED") {
        if (types.has("attack_success")) {
            return {
                attacker: "success",
                victim: "compromised",
                suricata: alertCount > 0 ? "alerting" : "idle",
            };
        }
        return {
            attacker: "failed",
            victim: "defended",
            suricata: alertCount > 0 ? "blocking" : "monitoring",
        };
    }

    if (status === "FAILED") {
        return { attacker: "failed", victim: "idle", suricata: "idle" };
    }

    return { attacker: "idle", victim: "idle", suricata: "idle" };
}

// ─── Event log line ───────────────────────────────────────────────────────────
function EventLine({ ev, index }: { ev: AttackEvent; index: number }) {
    const colors: Record<string, string> = {
        attack_start: "var(--accent)",
        attack_end: "var(--warn)",
        attack_success: "var(--danger)",
        attack_fail: "var(--accent-2)",
        error: "var(--danger)",
    };
    const icons: Record<string, string> = {
        attack_start: "▶",
        attack_end: "■",
        attack_success: "⚡",
        attack_fail: "✓",
        error: "✕",
    };

    const time = new Date(ev.timestamp);
    const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;

    return (
        <div
            className="flex items-start gap-2 py-1.5 px-2 rounded"
            style={{
                background:
                    index === 0
                        ? "color-mix(in srgb, var(--accent) 5%, transparent)"
                        : "transparent",
                borderLeft:
                    index === 0
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                animation: index === 0 ? "slideIn 0.3s ease-out" : "none",
            }}
        >
            <span
                className="font-mono text-xs flex-shrink-0 mt-0.5"
                style={{ color: colors[ev.type] ?? "#6b7f96" }}
            >
                {icons[ev.type] ?? "·"}
            </span>
            <div className="min-w-0 flex-1">
                <p
                    className="font-mono text-xs"
                    style={{ color: colors[ev.type] ?? "#6b7f96" }}
                >
                    {ev.type.replace(/_/g, " ").toUpperCase()}
                </p>
                <p className="font-mono text-[10px] text-text-dim">{timeStr}</p>
                {ev.data && "snippet" in ev.data && (
                    <p
                        className="font-mono text-[10px] text-text-dim truncate mt-0.5"
                        title={String(ev.data.snippet)}
                    >
                        {String(ev.data.snippet).slice(0, 55)}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Alert ticker ─────────────────────────────────────────────────────────────
function AlertTicker({ count, active }: { count: number; active: boolean }) {
    if (count === 0 && !active) return null;
    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
                background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
            }}
        >
            <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                    background: "var(--danger)",
                    animation: active
                        ? "pulse 1s ease-in-out infinite"
                        : "none",
                }}
            />
            <span
                className="font-mono text-xs"
                style={{ color: "var(--danger)" }}
            >
                SURICATA: {count} EVE ALERTS CAPTURED
            </span>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
interface RunAnimationProps {
    report: RunReport | null;
}

export default function RunAnimation({ report }: RunAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const packetsRef = useRef<Packet[]>([]);

    const events = report?.attackEvents ?? [];
    const status = report?.status ?? "QUEUED";
    const alertCount = report?.alertsCount ?? 0;
    const isActive = status === "RUNNING" || status === "QUEUED";

    const nodeState = computeNodeState(events, status, alertCount);

    // Canvas animation
    useAnimationCanvas(
        canvasRef,
        packetsRef,
        nodeState,
        alertCount,
        report ?? null,
    );

    // Packet spawning
    usePacketSpawner(packetsRef, nodeState, status === "RUNNING");

    // Handle canvas DPI
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
    }, []);

    // Legend items
    const legend = [
        { color: PACKET_COLORS.attack, label: "EXPLOIT" },
        { color: PACKET_COLORS.scan, label: "SCAN/PROBE" },
        { color: PACKET_COLORS.alert, label: "IDS COPY" },
        { color: PACKET_COLORS.block, label: "ALERT/BLOCK" },
        { color: PACKET_COLORS.response, label: "RESPONSE" },
    ];

    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{
                            background: isActive
                                ? "var(--warn)"
                                : status === "FINISHED"
                                  ? "var(--accent-2)"
                                  : "var(--muted)",
                            animation: isActive
                                ? "pulse 1.5s ease-in-out infinite"
                                : "none",
                        }}
                    />
                    <p className="font-mono text-xs uppercase tracking-widest text-text-dim">
                        // network topology — live visualization
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {legend.map(({ color, label }) => (
                        <span
                            key={label}
                            className="flex items-center gap-1 font-mono text-[10px] text-text-dim"
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: color }}
                            />
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex">
                {/* Canvas */}
                <div className="flex-1 relative" style={{ minHeight: 280 }}>
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: 280,
                            display: "block",
                        }}
                    />
                </div>

                {/* Right panel: event log */}
                <div
                    className="w-56 flex flex-col"
                    style={{
                        borderLeft: "1px solid var(--border)",
                        background: "var(--bg)",
                    }}
                >
                    <div
                        className="px-3 py-2 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <p className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
                            Attack Timeline
                        </p>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto p-1"
                        style={{ maxHeight: 240 }}
                    >
                        {events.length === 0 ? (
                            <p className="font-mono text-[10px] text-text-dim text-center py-6">
                                {isActive
                                    ? "Waiting for events..."
                                    : "No events"}
                            </p>
                        ) : (
                            [...events]
                                .reverse()
                                .map((ev, i) => (
                                    <EventLine key={ev.id} ev={ev} index={i} />
                                ))
                        )}
                    </div>
                </div>
            </div>

            {/* Footer: alert ticker */}
            {(alertCount > 0 || isActive) && (
                <div
                    className="px-4 py-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <AlertTicker count={alertCount} active={isActive} />
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to   { opacity: 1; transform: none; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
