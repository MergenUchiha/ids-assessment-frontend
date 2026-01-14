export interface AttackScenario {
  id: string;
  name: string;
  description: string;
  exploitType: string;
  targetIP: string;
  targetOS: string;
  targetPort: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'ready' | 'running' | 'completed';
  tests?: Test[];
}

export interface Test {
  id: string;
  scenarioId: string;
  scenario?: AttackScenario;
  scenarioName?: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'completed' | 'failed';
  totalAttacks: number;
  detectedAttacks: number;
  missedAttacks: number;
  falsePositives: number;
  results?: TestResult[];
}

export interface TestResult {
  id: string;
  testId: string;
  test?: Test;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'comparative';
  format: 'pdf' | 'csv' | 'json';
  dateRange: string;
  testsIncluded: number;
  fileSize?: string;
  filePath?: string;
  createdAt: string;
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