const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

import type {
  Experiment, Run, RunReport, PaginatedAlerts,
  Scenario, IdsProfile, Alert,
} from '../types'

// ─── Core API ─────────────────────────────────────────────────────────────
export const api = {
  login:  (email: string, password: string) =>
    request<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getExperiments: () => request<Experiment[]>('/experiments'),
  createExperiment: (name: string, description?: string) =>
    request<Experiment>('/experiments', { method: 'POST', body: JSON.stringify({ name, description }) }),
  deleteExperiment: (id: string) => request<void>(`/experiments/${id}`, { method: 'DELETE' }),
  createRun: (experimentId: string, scenarioId: string) =>
    request<Run>(`/runs/${experimentId}/${scenarioId}`, { method: 'POST' }),
  getRun: (runId: string) => request<Run>(`/runs/${runId}`),
  getRunReport: (runId: string) => request<RunReport>(`/runs/${runId}/report`),
  getRunAlerts: (runId: string, page = 1, limit = 50) =>
    request<PaginatedAlerts>(`/runs/${runId}/alerts?page=${page}&limit=${limit}`),
  getScenarios: () => request<Scenario[]>('/scenarios'),
  createScenario: (data: Omit<Scenario, 'id' | 'createdAt'>) =>
    request<Scenario>('/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  deleteScenario: (id: string) => request<void>(`/scenarios/${id}`, { method: 'DELETE' }),
  getIdsProfiles: () => request<IdsProfile[]>('/ids-profiles'),
  createIdsProfile: (name: string, ruleset: string) =>
    request<IdsProfile>('/ids-profiles', { method: 'POST', body: JSON.stringify({ name, ruleset }) }),
  deleteIdsProfile: (id: string) => request<void>(`/ids-profiles/${id}`, { method: 'DELETE' }),
  getAllAlerts: () => request<Alert[]>('/alerts'),
}

// ─── Auth API (used by useAuth hook) ──────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => api.login(email, password),
}

// ─── Namespace exports — return arrays directly (no wrapper) ──────────────
export const experimentsApi = {
  list:   () => api.getExperiments(),
  create: (name: string, description?: string) => api.createExperiment(name, description),
  remove: (id: string) => api.deleteExperiment(id),
  delete: (id: string) => api.deleteExperiment(id),   // alias
}

export const runsApi = {
  create:  (experimentId: string, scenarioId: string) => api.createRun(experimentId, scenarioId),
  get:     (runId: string) => api.getRun(runId),
  report:  (runId: string) => api.getRunReport(runId),   // alias used by RunDetail
  getReport: (runId: string) => api.getRunReport(runId),
  alerts:  (runId: string, page = 1, limit = 50) => api.getRunAlerts(runId, page, limit), // alias
  getAlerts: (runId: string, page = 1, limit = 50) => api.getRunAlerts(runId, page, limit),
}

export const scenariosApi = {
  list:   () => api.getScenarios(),
  create: (data: Omit<Scenario, 'id' | 'createdAt'>) => api.createScenario(data),
  remove: (id: string) => api.deleteScenario(id),
  delete: (id: string) => api.deleteScenario(id),
}

export const idsProfilesApi = {
  list:   () => api.getIdsProfiles(),
  create: (name: string, ruleset: string) => api.createIdsProfile(name, ruleset),
  remove: (id: string) => api.deleteIdsProfile(id),
  delete: (id: string) => api.deleteIdsProfile(id),
}

export const alertsApi = {
  list: () => api.getAllAlerts(),
}
