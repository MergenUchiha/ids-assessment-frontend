import { AttackScenario, Test, TestResult, IDSConfiguration, LabEnvironment, DashboardStats } from '../types';

export const mockScenarios: AttackScenario[] = [
  {
    id: '1',
    name: 'EternalBlue (MS17-010)',
    description: 'SMB exploit targeting Windows systems',
    exploitType: 'Remote Code Execution',
    targetIP: '192.168.1.100',
    targetOS: 'Windows Server 2008 R2',
    targetPort: 445,
    createdAt: new Date().toISOString(),
    status: 'ready',
  },
  {
    id: '2',
    name: 'Log4Shell (CVE-2021-44228)',
    description: 'JNDI injection vulnerability in Log4j',
    exploitType: 'Remote Code Execution',
    targetIP: '192.168.1.101',
    targetOS: 'Ubuntu 20.04',
    targetPort: 8080,
    createdAt: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: '3',
    name: 'Shellshock (CVE-2014-6271)',
    description: 'Bash environment variable command injection',
    exploitType: 'Command Injection',
    targetIP: '192.168.1.102',
    targetOS: 'Debian 7',
    targetPort: 80,
    createdAt: new Date().toISOString(),
    status: 'draft',
  },
];

export const mockTests: Test[] = [
  {
    id: 't1',
    scenarioId: '1',
    scenarioName: 'EternalBlue (MS17-010)',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    finishedAt: new Date().toISOString(),
    status: 'completed',
    totalAttacks: 50,
    detectedAttacks: 47,
    missedAttacks: 3,
    falsePositives: 2,
  },
  {
    id: 't2',
    scenarioId: '2',
    scenarioName: 'Log4Shell (CVE-2021-44228)',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'running',
    totalAttacks: 25,
    detectedAttacks: 23,
    missedAttacks: 2,
    falsePositives: 1,
  },
];

export const mockResults: TestResult[] = Array.from({ length: 50 }, (_, i) => ({
  id: `r${i}`,
  testId: 't1',
  attackType: ['RCE', 'SQLi', 'XSS', 'CSRF'][Math.floor(Math.random() * 4)],
  exploitName: ['MS17-010', 'CVE-2021-44228', 'CVE-2014-6271'][Math.floor(Math.random() * 3)],
  idsDetected: Math.random() > 0.1,
  detectionTime: Math.random() > 0.1 ? Math.floor(Math.random() * 5000) : undefined,
  falsePositive: Math.random() > 0.95,
  severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
  timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  sourceIP: '192.168.1.50',
  targetIP: '192.168.1.100',
  protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
}));

export const mockIDSConfigs: IDSConfiguration[] = [
  {
    id: 'ids1',
    name: 'Snort Primary',
    type: 'snort',
    version: '3.1.70.0',
    rules: 45234,
    sensitivity: 'high',
    status: 'active',
  },
  {
    id: 'ids2',
    name: 'Suricata Backup',
    type: 'suricata',
    version: '7.0.2',
    rules: 38921,
    sensitivity: 'medium',
    status: 'inactive',
  },
];

export const mockLabEnvironments: LabEnvironment[] = [
  {
    id: 'lab1',
    name: 'Kali Attacker',
    type: 'attacker',
    ip: '192.168.1.50',
    os: 'Kali Linux 2023.4',
    status: 'online',
    cpu: 45,
    memory: 62,
    network: 78,
  },
  {
    id: 'lab2',
    name: 'Windows Target',
    type: 'target',
    ip: '192.168.1.100',
    os: 'Windows Server 2008 R2',
    status: 'busy',
    cpu: 89,
    memory: 71,
    network: 92,
  },
  {
    id: 'lab3',
    name: 'IDS Sensor',
    type: 'ids',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04',
    status: 'online',
    cpu: 34,
    memory: 48,
    network: 65,
  },
];

export const mockDashboardStats: DashboardStats = {
  totalTests: 47,
  activeTests: 2,
  totalAttacks: 2847,
  detectedAttacks: 2654,
  detectionRate: 93.2,
  falsePositiveRate: 2.1,
  avgDetectionTime: 1247,
};