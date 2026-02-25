export type RunStatus = 'QUEUED' | 'RUNNING' | 'FINISHED' | 'FAILED';

export interface Metric {
  id: string;
  runId: string;
  tp: number;
  fp: number;
  fn: number;
  precision: number | null;
  recall: number | null;
  f1: number | null;
  latencyMs: number | null;
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
  type: 'attack_start' | 'attack_end' | 'attack_success' | 'attack_fail' | 'error';
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
  startedAt?: string;
  finishedAt?: string;
  attackSuccess?: boolean;
  scenario?: Scenario;
  idsProfile?: IdsProfile;
  alerts?: Alert[];
  metrics?: Metric;
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
  attackSuccess?: boolean;
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
