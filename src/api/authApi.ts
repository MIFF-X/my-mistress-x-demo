import { apiRequest } from './apiClient';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'ADMIN';
  displayName?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

type DemoAccount = AuthUser & { password: string };

export const DEMO_LOGIN_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-headmistress',
    email: 'headmistress@test.com',
    username: 'Headmistress',
    role: 'HEADMISTRESS',
    displayName: 'Headmistress Demo',
    password: 'Demo123!',
  },
  {
    id: 'demo-mistress',
    email: 'mistress@test.com',
    username: 'Mistress-X',
    role: 'MISTRESS',
    displayName: 'Mistress Demo',
    password: 'Demo123!',
  },
  {
    id: 'demo-seeded-mistress',
    email: 'demo.mistress@mistressx.local',
    username: 'demo_mistress',
    role: 'MISTRESS',
    displayName: 'Demo Mistress',
    password: 'MistressX123!',
  },
  {
    id: 'demo-sub',
    email: 'sub@test.com',
    username: 'SubDemo',
    role: 'SUB',
    displayName: 'Sub Demo',
    password: 'Demo123!',
  },
  {
    id: 'demo-seeded-sub',
    email: 'demo.sub@mistressx.local',
    username: 'demo_sub',
    role: 'SUB',
    displayName: 'Demo Sub',
    password: 'MistressX123!',
  },
  {
    id: 'demo-admin',
    email: 'admin@test.com',
    username: 'AdminDemo',
    role: 'ADMIN',
    displayName: 'Admin Demo',
    password: 'Demo123!',
  },
  {
    id: 'demo-test',
    email: 'test@test.com',
    username: 'TestMistress',
    role: 'MISTRESS',
    displayName: 'Test Mistress',
    password: 'test123',
  },
];

function isNetworkError(err: unknown) {
  return err instanceof TypeError || (err instanceof Error && err.message.toLowerCase().includes('network'));
}

function createDemoToken(user: AuthUser) {
  return `demo-token-${user.role.toLowerCase()}-${Date.now()}`;
}

function toAuthResponse(user: AuthUser): AuthResponse {
  return {
    user,
    token: createDemoToken(user),
  };
}

function findDemoAccount(email: string, password: string) {
  return DEMO_LOGIN_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
  );
}

function inferRoleFromRegister(email: string, username: string): AuthUser['role'] {
  const value = `${email} ${username}`.toLowerCase();

  if (value.includes('headmistress')) return 'HEADMISTRESS';
  if (value.includes('admin')) return 'ADMIN';
  if (value.includes('sub')) return 'SUB';

  return 'MISTRESS';
}

function createRegisteredDemoUser(body: { email: string; username: string }): AuthUser {
  return {
    id: `demo-register-${Date.now()}`,
    email: body.email.trim(),
    username: body.username.trim() || body.email.trim().split('@')[0] || 'MistressXUser',
    role: inferRoleFromRegister(body.email, body.username),
    displayName: body.username.trim() || 'Mistress-X User',
  };
}

export async function registerUser(body: { email: string; username: string; password: string }) {
  try {
    return await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return toAuthResponse(createRegisteredDemoUser(body));
    }

    throw err;
  }
}

export async function loginUser(body: { email: string; password: string }) {
  const demoAccount = findDemoAccount(body.email, body.password);

  try {
    return await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (demoAccount && (isNetworkError(err) || err instanceof Error)) {
      const { password: _password, ...user } = demoAccount;
      return toAuthResponse(user);
    }

    if (isNetworkError(err)) {
      throw new Error('Backend is offline. Use a demo login or switch to Register to create a local demo session.');
    }

    throw err;
  }
}
