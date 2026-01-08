export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  exploitType: string;
  targetIP: string;
  targetOS: string;
  targetPort: number;
  createdAt: string;
  status: 'draft' | 'ready' | 'running' | 'completed';
}

export interface Test {
  id: string;
  scenarioId: string;
  scenarioName: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'failed';
  totalAttacks: number;
  detectedAttacks: number;
  missedAttacks: number;
  falsePositives: number;
}

export interface TestResult {
  id: string;
  testId: string;
  attackType: string;
  exploitName: string;
  idsDetected: boolean;
  detectionTime?: number;
  falsePositive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  sourceIP: string;
  targetIP: string;
  protocol: string;
}

export interface IDSConfiguration {
  id: string;
  name: string;
  type: 'snort' | 'suricata';
  version: string;
  rules: number;
  sensitivity: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
}

export interface LabEnvironment {
  id: string;
  name: string;
  type: 'attacker' | 'target' | 'ids';
  ip: string;
  os: string;
  status: 'online' | 'offline' | 'busy';
  cpu: number;
  memory: number;
  network: number;
}

export interface DashboardStats {
  totalTests: number;
  activeTests: number;
  totalAttacks: number;
  detectedAttacks: number;
  detectionRate: number;
  falsePositiveRate: number;
  avgDetectionTime: number;
}

export interface ExploitCategory {
  name: string;
  count: number;
  color: string;
}

export interface TimeSeriesData {
  timestamp: string;
  attacks: number;
  detected: number;
  missed: number;
}