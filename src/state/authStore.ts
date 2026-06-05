import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../api/authApi';

const AUTH_STORAGE_KEY = 'mistress-x.auth-session.v1';

let currentUser: AuthUser | null = null;
let currentToken: string | null = null;

export type AuthSession = {
  user: AuthUser;
  token: string;
};

export async function setAuthSession(user: AuthUser, token: string) {
  currentUser = user;
  currentToken = token;

  await AsyncStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ user, token }),
  );
}

export function hydrateAuthSession(session: AuthSession) {
  currentUser = session.user;
  currentToken = session.token;
}

export async function loadStoredAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.user || !parsed?.token) {
      await clearAuthSession();
      return null;
    }

    hydrateAuthSession(parsed);
    return parsed;
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function clearAuthSession() {
  currentUser = null;
  currentToken = null;
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

export function getCurrentToken(): string | null {
  return currentToken;
}

export function isLoggedIn(): boolean {
  return !!currentUser && !!currentToken;
}
