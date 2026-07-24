import axios from 'axios';

// Empty string = same-origin (when UI is served by Express).
// Unset in development → local backend on 5001.
const rawApiUrl = process.env.REACT_APP_API_URL;
export const API_BASE =
  rawApiUrl !== undefined
    ? rawApiUrl
    : process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:5001';

const client = axios.create({
  baseURL: API_BASE,
});

// Attach JWT (if present) to every outgoing request.
client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('farmco_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // localStorage unavailable (e.g. private mode) - ignore
  }
  return config;
});

// Centralized 401 handling: clear stored session so the app can redirect to
// login. We don't force a hard reload here - AuthContext listens for this
// event and updates React state instead.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem('farmco_token');
        localStorage.removeItem('farmco_user');
      } catch (e) {
        /* ignore */
      }
      window.dispatchEvent(new CustomEvent('farmco:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export default client;
