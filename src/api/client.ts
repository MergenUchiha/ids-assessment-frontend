const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });
    if (!res.ok)
        throw new Error(`API error ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
}

import type {
    Experiment,
    Run,
    RunReport,
    PaginatedAlerts,
    Scenario,
    IdsProfile,
    Alert,
} from "../types";

// ─── All backend endpoints ─────────────────────────────────────────────────
export const api = {
    // Auth — POST /auth/login, POST /auth/register
    login: (email: string, password: string) =>
        request<{ access_token: string }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),
    register: (email: string, password: string) =>
        request<{ access_token: string }>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),

    // Experiments — GET /experiments, GET /experiments/:id, POST /experiments, DELETE /experiments/:id
    getExperiments: () => request<Experiment[]>("/experiments"),
    getExperiment: (id: string) => request<Experiment>(`/experiments/${id}`),
    createExperiment: (name: string, description?: string) =>
        request<Experiment>("/experiments", {
            method: "POST",
            body: JSON.stringify({ name, description }),
        }),
    deleteExperiment: (id: string) =>
        request<void>(`/experiments/${id}`, { method: "DELETE" }),

    // Runs — POST /runs/:expId/:scId, GET /runs/:id, GET /runs/:id/report, GET /runs/:id/alerts
    createRun: (experimentId: string, scenarioId: string) =>
        request<Run>(`/runs/${experimentId}/${scenarioId}`, { method: "POST" }),
    getRun: (runId: string) => request<Run>(`/runs/${runId}`),
    getRunReport: (runId: string) =>
        request<RunReport>(`/runs/${runId}/report`),
    getRunAlerts: (runId: string, page = 1, limit = 50) =>
        request<PaginatedAlerts>(
            `/runs/${runId}/alerts?page=${page}&limit=${limit}`,
        ),

    // Scenarios — GET /scenarios, GET /scenarios/:id, POST /scenarios, DELETE /scenarios/:id
    getScenarios: () => request<Scenario[]>("/scenarios"),
    getScenario: (id: string) => request<Scenario>(`/scenarios/${id}`),
    createScenario: (data: Omit<Scenario, "id" | "createdAt">) =>
        request<Scenario>("/scenarios", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    deleteScenario: (id: string) =>
        request<void>(`/scenarios/${id}`, { method: "DELETE" }),

    // IDS Profiles — GET /ids-profiles, POST /ids-profiles, DELETE /ids-profiles/:id
    getIdsProfiles: () => request<IdsProfile[]>("/ids-profiles"),
    createIdsProfile: (name: string, ruleset: string) =>
        request<IdsProfile>("/ids-profiles", {
            method: "POST",
            body: JSON.stringify({ name, ruleset }),
        }),
    deleteIdsProfile: (id: string) =>
        request<void>(`/ids-profiles/${id}`, { method: "DELETE" }),

    // Alerts — GET /alerts
    getAllAlerts: () => request<Alert[]>("/alerts"),
};

// ─── Named API groups ──────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) => api.login(email, password),
    register: (email: string, password: string) =>
        api.register(email, password),
};

export const experimentsApi = {
    list: () => api.getExperiments(),
    get: (id: string) => api.getExperiment(id),
    create: (name: string, description?: string) =>
        api.createExperiment(name, description),
    delete: (id: string) => api.deleteExperiment(id),
    remove: (id: string) => api.deleteExperiment(id),
};

export const runsApi = {
    create: (experimentId: string, scenarioId: string) =>
        api.createRun(experimentId, scenarioId),
    get: (runId: string) => api.getRun(runId),
    report: (runId: string) => api.getRunReport(runId),
    getReport: (runId: string) => api.getRunReport(runId),
    alerts: (runId: string, page = 1, limit = 50) =>
        api.getRunAlerts(runId, page, limit),
    getAlerts: (runId: string, page = 1, limit = 50) =>
        api.getRunAlerts(runId, page, limit),
};

export const scenariosApi = {
    list: () => api.getScenarios(),
    get: (id: string) => api.getScenario(id),
    create: (data: Omit<Scenario, "id" | "createdAt">) =>
        api.createScenario(data),
    delete: (id: string) => api.deleteScenario(id),
    remove: (id: string) => api.deleteScenario(id),
};

export const idsProfilesApi = {
    list: () => api.getIdsProfiles(),
    create: (name: string, ruleset: string) =>
        api.createIdsProfile(name, ruleset),
    delete: (id: string) => api.deleteIdsProfile(id),
    remove: (id: string) => api.deleteIdsProfile(id),
};

export const alertsApi = {
    list: () => api.getAllAlerts(),
};
