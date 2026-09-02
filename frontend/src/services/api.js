import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 添加token和语言参数
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem('lang') || 'en';
    // Add lang query param to GET requests for challenges/pool/phases
    if (config.method === 'get' && !config.params) {
      config.params = { lang };
    } else if (config.method === 'get' && config.params) {
      config.params.lang = lang;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// 题目相关（全量题库，用于裁判/管理）
export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  getById: (id) => api.get(`/challenges/${id}`),
};

// 题库分配相关（比赛用）
export const poolAPI = {
  getNext: () => api.get('/pool/next'),
  skip: (challengeId) => api.post('/pool/skip', { challenge_id: challengeId }),
  getSkipStatus: () => api.get('/pool/skip-status'),
};

// 提交相关
export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getHistory: () => api.get('/submissions/history'),
};

// 排行榜相关
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
  getTeams: () => api.get('/leaderboard/teams'),
  getStats: () => api.get('/leaderboard/stats'),
};

// 裁判相关
export const judgeAPI = {
  getSubmissions: () => api.get('/judge/submissions'),
  getStatistics: () => api.get('/judge/statistics'),
  addChallenge: (data) => api.post('/judge/challenges', data),
};

export default api;