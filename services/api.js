const DEFAULT_API_URL = 'http://localhost:3000';

export const API_URL =
  window.MISTRESS_X_API_URL ||
  localStorage.getItem('MISTRESS_X_API_URL') ||
  DEFAULT_API_URL;

export function getAuthToken() {
  return localStorage.getItem('token');
}

export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}
