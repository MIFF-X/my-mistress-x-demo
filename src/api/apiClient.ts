import { getCurrentToken } from '../state/authStore';

function getBrowserApiBaseUrl() {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:3000/api`;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? getBrowserApiBaseUrl() ?? 'http://localhost:3000/api';

function buildHeaders(options: RequestInit) {
  const token = getCurrentToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response;
}

export async function apiRequest<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const response = await fetchApi(path, options);
  return response.json() as Promise<TResponse>;
}

export async function apiTextRequest(path: string, options: RequestInit = {}): Promise<string> {
  const response = await fetchApi(path, options);
  return response.text();
}
