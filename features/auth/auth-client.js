const AUTH_SESSION_KEY = 'mistress_x_auth_session';
const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function requestAuth(path, body) {
  const response = await fetch(`${API_BASE_URL}/auth${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data;
}

export function saveAuthSession(session) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getAuthToken() {
  return getAuthSession()?.accessToken || getAuthSession()?.token || null;
}

export function getAuthUser() {
  return getAuthSession()?.user || null;
}

export function getAuthRole() {
  return getAuthUser()?.role || null;
}

export function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export async function registerUser({ email, username, password, role = 'SUB', isAdult = true }) {
  const session = await requestAuth('/register', {
    email,
    username,
    password,
    role,
    isAdult,
  });

  saveAuthSession(session);
  return session;
}

export async function loginUser({ email, password }) {
  const session = await requestAuth('/login', { email, password });
  saveAuthSession(session);
  return session;
}

export function buildAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export function requireAuthSession() {
  const session = getAuthSession();

  if (!session?.user || !(session.accessToken || session.token)) {
    throw new Error('Login required. No valid Mistress-X session found.');
  }

  return session;
}
