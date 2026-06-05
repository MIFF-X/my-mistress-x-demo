import { getAuthSession } from './auth-client.js';
import { createAuthScreen } from './auth-screen.js';
import { mountDashboardForCurrentUser } from './role-router.js';

export function bootstrapAuthApp({ appElement = document.getElementById('app'), routeFactories = {} } = {}) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';

  const session = getAuthSession();

  if (session?.user && (session.accessToken || session.token)) {
    return mountDashboardForCurrentUser(appElement, routeFactories);
  }

  appElement.appendChild(createAuthScreen({ mode: 'login', routeFactories }));

  return {
    role: null,
    id: 'auth-screen',
    label: 'Authentication Screen',
  };
}
