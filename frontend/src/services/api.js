import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://shree-amar-ganesh-api.onrender.com/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('amgm_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Forbidden globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : null;

    if (status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('amgm_auth_token');
        localStorage.removeItem('amgm_user');
        window.location.href = '/committee/login?expired=1';
      }
    }

    const message = (data && data.message) || 'काहीतरी समस्या आली आहे. कृपया पुन्हा प्रयत्न करा.';
    return Promise.reject(new Error(message));
  }
);

export default api;
