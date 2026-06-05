import { getAuthRole, requireAuthSession } from './auth-client.js';
import { createDashboardModuleGrid } from '../dashboard/dashboard-module-grid.js';
import { createAdminDashboard } from '../dashboard/admin-dashboard.js';
import { createHeadmistressDashboard } from '../dashboard/headmistress-dashboard.js';
import { createMistressDashboard } from '../dashboard/mistress-dashboard.js';
import { createSubDashboard } from '../dashboard/sub-dashboard.js';

const ROLE_ROUTE_LABELS = {
  HEADMISTRESS: 'Headmistress Control Panel',
  ADMIN: 'Admin Control Panel',
  MISTRESS: 'Mistress Dashboard',
  SUB: 'Sub Dashboard',
};

const ROLE_ROUTE_IDS = {
  HEADMISTRESS: 'headmistress-dashboard',
  ADMIN: 'admin-dashboard',
  MISTRESS: 'mistress-dashboard',
  SUB: 'sub-dashboard',
};

const DEFAULT_ROLE_DASHBOARD_FACTORIES = {
  HEADMISTRESS: createHeadmistressDashboard,
  ADMIN: createAdminDashboard,
  MISTRESS: createMistressDashboard,
  SUB: createSubDashboard,
};

export function getDashboardRouteForRole(role = getAuthRole()) {
  const normalizedRole = role || 'SUB';

  return {
    role: normalizedRole,
    id: ROLE_ROUTE_IDS[normalizedRole] || ROLE_ROUTE_IDS.SUB,
    label: ROLE_ROUTE_LABELS[normalizedRole] || ROLE_ROUTE_LABELS.SUB,
  };
}

export function createRoleDashboardPlaceholder(route = getDashboardRouteForRole(), appElement = document.getElementById('app')) {
  const shell = document.createElement('section');
  shell.className = 'page-shell role-dashboard-placeholder';
  shell.dataset.role = route.role;
  shell.dataset.routeId = route.id;

  const title = document.createElement('h1');
  title.innerText = route.label;

  const text = document.createElement('p');
  text.innerText = `Logged in as ${route.role}. Core modules are available below while the final ${route.label} screen is wired.`;

  shell.appendChild(title);
  shell.appendChild(text);
  shell.appendChild(createDashboardModuleGrid({ role: route.role, appElement }));

  return shell;
}

export function mountDashboardForCurrentUser(appElement, routeFactories = {}) {
  requireAuthSession();

  const route = getDashboardRouteForRole();
  const factories = {
    ...DEFAULT_ROLE_DASHBOARD_FACTORIES,
    ...routeFactories,
  };
  const factory = factories[route.role];

  appElement.innerHTML = '';

  if (typeof factory === 'function') {
    appElement.appendChild(factory(appElement));
    return route;
  }

  appElement.appendChild(createRoleDashboardPlaceholder(route, appElement));
  return route;
}
