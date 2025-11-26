import axios from "axios";
import CookieService from "./Cookie/CookieService";
import AuthService from "./Auth/AuthServices";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000, // timeout 30 giây
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.auth !== false) {
            const token = CookieService.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Token refresh management and automatic retry on 401
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (error.response) {
      const status = error.response.status;
      // Only try refresh for authenticated (non-public) requests and avoid loops
      if (status === 401 && originalRequest.auth !== false && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request until refresh completes
          return new Promise((resolve) => {
            addRefreshSubscriber((newToken) => {
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              originalRequest._retry = true;
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const res = await AuthService.refreshToken();
          const newToken = res?.accessToken || CookieService.getAccessToken();
          onRefreshed(newToken);
          isRefreshing = false;
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          isRefreshing = false;
          AuthService.logout().catch(() => {
            // Ignore logout errors during cleanup
          });
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

const api = {
    get: (url, params = {}, headers = {}) => {
        return apiClient.get(url, { params, headers });
    },

    post: (url, data = {}, headers = {}) => {
        return apiClient.post(url, data, { headers });
    },

    put: (url, data = {}, headers = {}) => {
        return apiClient.put(url, data, { headers });
    },

    patch: (url, data = {}, headers = {}) => {
        return apiClient.patch(url, data, { headers });
    },

    delete: (url, headers = {}) => {
        return apiClient.delete(url, { headers });
    },

    jsonPatch: (url, operations = [], headers = {}) => {
        return apiClient.patch(url, operations, {
            headers: {
                ...headers,
                'Content-Type': 'application/json-patch+json'
            }
        });
    },

    public: {
        get: (url, params = {}, headers = {}) => {
            console.log('[API Client Public GET] URL:', url);
            console.log('[API Client Public GET] Params:', params);
            return apiClient.get(url, {
                params,
                headers,
                auth: false
            });
        },

        post: (url, data = {}, headers = {}) => {
            return apiClient.post(url, data, {
                headers,
                auth: false
            });
        },

        put: (url, data = {}, headers = {}) => {
            return apiClient.put(url, data, {
                headers,
                auth: false
            });
        },

        patch: (url, data = {}, headers = {}) => {
            return apiClient.patch(url, data, {
                headers,
                auth: false
            });
        },

        delete: (url, headers = {}) => {
            return apiClient.delete(url, {
                headers,
                auth: false
            });
        },

        jsonPatch: (url, operations = [], headers = {}) => {
            return apiClient.patch(url, operations, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json-patch+json'
                },
                auth: false
            });
        }
    }
};

export default api;