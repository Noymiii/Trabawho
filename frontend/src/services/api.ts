import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trabawho_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('trabawho_token');
      localStorage.removeItem('trabawho_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const authAPI = {
  register: (data: { fullname: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ========== WORKERS ==========
export const workerAPI = {
  getProfile: (userId?: number) =>
    api.get(userId ? `/workers/${userId}` : '/workers/me'),
  createProfile: (data: FormData) =>
    api.post('/workers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProfile: (data: FormData) =>
    api.put('/workers/me', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params?: Record<string, string>) =>
    api.get('/workers', { params }),
};

// ========== JOBS ==========
export const jobAPI = {
  create: (data: Record<string, unknown>) => api.post('/jobs', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/jobs/${id}`),
  getAll: (params?: Record<string, string>) => api.get('/jobs', { params }),
  getMine: () => api.get('/jobs/mine'),
  getById: (id: number) => api.get(`/jobs/${id}`),
};

// ========== SWIPES ==========
export const swipeAPI = {
  swipe: (data: { targetId: number; targetType: string; direction: string }) =>
    api.post('/swipes', data),
  getQueue: () => api.get('/swipes/queue'),
};

// ========== MATCHES ==========
export const matchAPI = {
  getAll: () => api.get('/matches'),
  updateStatus: (id: number, status: string) =>
    api.put(`/matches/${id}`, { status }),
};

// ========== MESSAGES ==========
export const messageAPI = {
  getByMatch: (matchId: number, page = 1) =>
    api.get(`/messages/${matchId}?page=${page}`),
  getConversations: () => api.get('/messages/conversations'),
};

// ========== ADMIN ==========
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getJobs: () => api.get('/admin/jobs'),
  deleteJob: (id: number) => api.delete(`/admin/jobs/${id}`),
  getMatches: () => api.get('/admin/matches'),
};

export default api;
