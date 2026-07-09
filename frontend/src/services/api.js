 import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  withCredentials: true
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('neuralpath-auth');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (err) {
        console.error(err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Agar response hi nahi hai
    if (!error.response) {
      return Promise.reject(error);
    }

    // Refresh endpoint fail ho gaya
    if (originalRequest.url?.includes('/auth/refresh')) {
      localStorage.removeItem('neuralpath-auth');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Token expire hua
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        );

        const newToken = refreshResponse.data.token;

        // Update localStorage
        const stored = localStorage.getItem('neuralpath-auth');

        if (stored) {
          const parsed = JSON.parse(stored);

          parsed.state.token = newToken;

          localStorage.setItem(
            'neuralpath-auth',
            JSON.stringify(parsed)
          );
        }

        // Update headers
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {

        localStorage.removeItem('neuralpath-auth');

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ================= AUTH =================

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password })
};

// ================= PROBLEMS =================

export const problemAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getOne: (slug) => api.get(`/problems/${slug}`),
  submit: (id, data) => api.post(`/problems/${id}/submit`, data),
  getSimilar: (id) => api.get(`/problems/${id}/similar`)
};

// ================= AI =================

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  createSession: (data) => api.post('/ai/session', data),
  generateTest: (data) => api.post('/ai/generate-test', data),
  evaluate: (data) => api.post('/ai/evaluate', data),
  generateRoadmap: (data) => api.post('/ai/roadmap', data),
  getUsage: () => api.get('/ai/usage')
};

// ================= TEST =================

export const testAPI = {
  getAll: (params) => api.get('/tests', { params }),
  getOne: (id) => api.get(`/tests/${id}`),
  start: (id) => api.post(`/tests/${id}/start`),
  submit: (id, data) => api.post(`/tests/${id}/submit`, data),
  history: () => api.get('/tests/attempts/history')
};

// ================= PROGRESS =================

export const progressAPI = {
  dashboard: () => api.get('/progress/dashboard'),
  heatmap: () => api.get('/progress/heatmap'),
  topicMastery: () => api.get('/progress/topic-mastery')
};

// ================= LEADERBOARD =================

export const leaderboardAPI = {
  get: (params) => api.get('/leaderboard', { params })
};

// ================= SUBSCRIPTION =================

export const subscriptionAPI = {
  plans: () => api.get('/subscriptions/plans'),
  createOrder: (data) => api.post('/subscriptions/create-order', data),
  verifyPayment: (data) => api.post('/subscriptions/verify-payment', data),
  cancel: () => api.delete('/subscriptions/cancel')
};

// ================= ADMIN =================

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  createProblem: (data) => api.post('/admin/problems', data),
  updateProblem: (id, data) => api.put(`/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),
  createTest: (data) => api.post('/admin/tests', data)
};