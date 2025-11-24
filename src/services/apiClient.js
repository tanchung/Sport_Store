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
        // Initialize headers if not present
        if (!config.headers) {
            config.headers = {};
        }
        
        if (config.auth !== false) {
            // Authenticated request - add token
            const token = CookieService.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API Client] Authenticated request to:', config.url);
            }
        } else {
            // Public request - explicitly remove Authorization header
            console.log('[API Client] Public request to:', config.url, '- Removing auth headers');
            console.log('[API Client] Headers before cleanup:', {...config.headers});
            if (config.headers.Authorization) {
                delete config.headers.Authorization;
            }
            if (config.headers.authorization) {
                delete config.headers.authorization;
            }
            console.log('[API Client] Headers after cleanup:', {...config.headers});
            console.log('[API Client] Final request URL:', config.baseURL + config.url);
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
          try { await AuthService.logout(); } catch (e) {}
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Kiểm tra xem có token hợp lệ không trước khi gọi API
const validateToken = () => {
    if (!CookieService.hasAuthTokens()) {
        console.warn('No authentication tokens found. User may need to log in.');
        return false;
    }
    return true;
};

const api = {
    get: (url, params = {}, headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.get(url, { params, headers });
    },

    post: (url, data = {}, headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.post(url, data, { headers });
    },

    put: (url, data = {}, headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.put(url, data, { headers });
    },

    patch: (url, data = {}, headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.patch(url, data, { headers });
    },

    delete: (url, headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.delete(url, { headers });
    },

    jsonPatch: (url, operations = [], headers = {}) => {
        if (!validateToken()) {
            return Promise.reject(new Error('Authentication required. Please log in.'));
        }
        return apiClient.patch(url, operations, {
            headers: {
                ...headers,
                'Content-Type': 'application/json-patch+json'
            }
        });
    },

    public: {
        get: (url, params = {}, headers = {}) => {
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