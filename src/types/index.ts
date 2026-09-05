export type RunStatus = "QUEUED" | "RUNNING" | "FINISHED" | "FAILED";

/**
 * One run contributes one cell of a confusion matrix. Precision, recall and
 * F1 are not on the row — over a single run they can only be 0 or 1 — so they
 * are derived from the cells with `deriveScores`, and the experiment-wide
 * figures come from the summary endpoint.
 */
export interface Metric {
    id: string;
    runId: string;
    tp: number;
    fp: number;
    fn: number;
    tn: number;
    latencyMs: number | null;
}

export interface ConfusionCells {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
}

export interface DerivedScores {
    precision: number | null;
    recall: number | null;
    f1: number | null;
}

/** Precision, recall and F1 from confusion-matrix cells. */
export function deriveScores(c: ConfusionCells): DerivedScores {
    const precision = c.tp + c.fp > 0 ? c.tp / (c.tp + c.fp) : null;
    const recall = c.tp + c.fn > 0 ? c.tp / (c.tp + c.fn) : null;
    const f1 =
        precision != null && recall != null && precision + recall > 0
            ? (2 * precision * recall) / (precision + recall)
            : null;
    return { precision, recall, f1 };
}

export interface ExperimentSummary {
    experimentId: string;
    name: string;
    runs: number;
    attackRuns: number;
    baselineRuns: number;
    confusionMatrix: ConfusionCells;
    precision: number | null;
    recall: number | null;
    f1: number | null;
    avgLatencyMs: number | null;
}

export interface Alert {
    id: string;
    runId: string;
    timestamp: string;
    signature: string;
    severity: number;
    srcIp: string;
    destIp: string;
    raw: Record<string, unknown>;
}

export interface AttackEvent {
    id: string;
    runId: string;
    type:
        | "attack_start"
        | "attack_end"
        | "attack_success"
        | "attack_fail"
        | "error";
    timestamp: string;
    data?: Record<string, unknown>;
}

export interface Scenario {
    id: string;
    name: string;
    description?: string;
    msfModule: string;
    payload?: string;
    rport?: number;
    expectedSignatures: string[];
    createdAt: string;
}

export interface IdsProfile {
    id: string;
    name: string;
    ruleset: string;
    createdAt: string;
}

export interface Run {
    id: string;
    experimentId: string;
    scenarioId?: string;
    idsProfileId?: string;
    status: RunStatus;
    startedAt?: string | null;
    finishedAt?: string | null;
    attackSuccess?: boolean | null;
    detected?: boolean | null;
    isBaseline?: boolean;
    scenario?: Scenario | null;
    idsProfile?: IdsProfile | null;
    alerts?: Alert[];
    metrics?: Metric | null;
    attackEvents?: AttackEvent[];
}

export interface Experiment {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    runs: Run[];
}

export interface RunReport {
    runId: string;
    experiment: string;
    scenario?: string;
    idsProfile?: string;
    status: RunStatus;
    attackSuccess?: boolean | null;
    detected?: boolean | null;
    isBaseline?: boolean;
    metrics?: Metric;
    alertsCount: number;
    startedAt?: string;
    finishedAt?: string;
    attackEvents: AttackEvent[];
}

export interface PaginatedAlerts {
    total: number;
    page: number;
    limit: number;
    data: Alert[];
}
