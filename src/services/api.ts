import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// DEVICES API
// ============================================
export const devicesApi = {
  getAll: () => api.get('/devices'),
  getOne: (id: string) => api.get(`/devices/${id}`),
  create: (data: any) => api.post('/devices', data),
  update: (id: string, data: any) => api.put(`/devices/${id}`, data),
  delete: (id: string) => api.delete(`/devices/${id}`),
  getVulnerabilities: (id: string) => api.get(`/devices/${id}/vulnerabilities`),
};

// ============================================
// SCANS API
// ============================================
export const scansApi = {
  start: (data: { deviceId: string; type: string }) => api.post('/scans/start', data),
  stop: (id: string) => api.post(`/scans/${id}/stop`),
  getAll: () => api.get('/scans'),
  getOne: (id: string) => api.get(`/scans/${id}`),
};

// ============================================
// VULNERABILITIES API
// ============================================
export const vulnerabilitiesApi = {
  getAll: (params?: { severity?: string; device?: string }) => 
    api.get('/vulnerabilities', { params }),
  getOne: (id: string) => api.get(`/vulnerabilities/${id}`),
  getStats: () => api.get('/vulnerabilities/stats/summary'),
};

// ============================================
// REPORTS API
// ============================================
export const reportsApi = {
  generate: (type: 'technical' | 'executive' | 'compliance') => 
    api.post('/reports/generate', { type }),
  getAll: () => api.get('/reports'),
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMetrics: () => api.get('/analytics/metrics'),
  getTraffic: () => api.get('/analytics/traffic'),
  getTrends: () => api.get('/analytics/trends'),
  getActivity: () => api.get('/analytics/activity'),
};