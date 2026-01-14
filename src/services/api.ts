const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Scenarios API
export const scenariosAPI = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetchAPI<any[]>(`/scenarios${query}`);
  },

  getOne: (id: string) => fetchAPI<any>(`/scenarios/${id}`),

  create: (data: any) =>
    fetchAPI<any>('/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchAPI<any>(`/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<any>(`/scenarios/${id}`, {
      method: 'DELETE',
    }),

  run: (id: string) =>
    fetchAPI<any>(`/scenarios/${id}/run`, {
      method: 'POST',
    }),
};

// Tests API
export const testsAPI = {
  getAll: () => fetchAPI<any[]>('/tests'),

  getOne: (id: string) => fetchAPI<any>(`/tests/${id}`),

  getResults: (id: string) => fetchAPI<any[]>(`/tests/${id}/results`),

  getRecent: (limit: number = 5) => 
    fetchAPI<any[]>('/tests').then(tests => 
      tests
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, limit)
    ),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => fetchAPI<any>('/dashboard/stats'),
};

// Lab API
export const labAPI = {
  getEnvironments: () => fetchAPI<any[]>('/lab/environments'),

  getIDSConfigs: () => fetchAPI<any[]>('/lab/ids-configs'),

  updateIDSStatus: (id: string, status: string) =>
    fetchAPI<any>(`/lab/ids-configs/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  updateIDSRules: (id: string, rules: number) =>
    fetchAPI<any>(`/lab/ids-configs/${id}/rules`, {
      method: 'PUT',
      body: JSON.stringify({ rules }),
    }),
};

// Reports API
export const reportsAPI = {
  getAll: () => fetchAPI<any[]>('/reports'),

  getOne: (id: string) => fetchAPI<any>(`/reports/${id}`),

  generate: (data: any) =>
    fetchAPI<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<any>(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

// Health check
export const healthAPI = {
  check: () => fetchAPI<{ status: string; timestamp: string }>('/health').catch(() => ({
    status: 'error',
    timestamp: new Date().toISOString(),
  })),
};