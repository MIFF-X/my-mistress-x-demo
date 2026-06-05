const SESSION_KEY = 'mistress_x_session';

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getCurrentUserId() {
  return getSession()?.userId || null;
}

export function getAccessToken() {
  return getSession()?.accessToken || null;
}

export function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('No access token found. Please login first.');
  }

  return token;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
