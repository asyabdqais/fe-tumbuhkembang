import axios from 'axios';
import toast from 'react-hot-toast';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || `http://${window.location.hostname || 'localhost'}:8000`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // HTTP 403 Forbidden: User doesn't have permissions
    if (error.response && error.response.status === 403) {
      const errorMsg = error.response.data?.detail || 'Anda tidak memiliki hak akses untuk aksi ini.';
      toast.error(errorMsg, { id: 'forbidden-toast' });
      return Promise.reject(error);
    }

    // HTTP 401 Unauthorized: token expired
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/api/auth/refresh' || originalRequest.url === '/api/auth/login') {
        // Jika gagal di refresh token itu sendiri atau login, bersihkan sesi
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Jalankan silent refresh ke BE
        await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function clearSession() {
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_data');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default api;
