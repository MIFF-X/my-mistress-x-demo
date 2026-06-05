import { isAdmin, isMistress, isSub } from '../auth/role-client.js';

export function createDashboardRoleLayout({
  createMistressDashboard,
  createSubDashboard,
  createAdminDashboard,
  createFallbackDashboard,
} = {}) {
  const container = document.createElement('div');
  container.className = 'dashboard-role-layout';

  if (isAdmin() && createAdminDashboard) {
    container.appendChild(createAdminDashboard());
    return container;
  }

  if (isMistress() && createMistressDashboard) {
    container.appendChild(createMistressDashboard());
    return container;
  }

  if (isSub() && createSubDashboard) {
    container.appendChild(createSubDashboard());
    return container;
  }

  if (createFallbackDashboard) {
    container.appendChild(createFallbackDashboard());
    return container;
  }

  container.innerHTML = `
    <section class="panel">
      <h2>Role required</h2>
      <p>Your account role could not be resolved. Please log in again or ask the Headmistress/Admin to check your account role.</p>
    </section>
  `;

  return container;
}
