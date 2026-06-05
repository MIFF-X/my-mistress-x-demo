export const siteIntegrationPermissions = [
  {
    id: 'manage-third-party-links',
    label: 'Manage Third-Party Links',
    roles: ['HEADMISTRESS', 'ADMIN'],
  },
  {
    id: 'configure-ad-revenue',
    label: 'Configure Ad Revenue',
    roles: ['HEADMISTRESS'],
  },
  {
    id: 'review-integration-health',
    label: 'Review Integration Health',
    roles: ['HEADMISTRESS', 'ADMIN', 'MODERATOR'],
  },
];

export function listSiteIntegrationPermissions(role) {
  return siteIntegrationPermissions.filter((permission) =>
    permission.roles.includes(String(role ?? '').toUpperCase())
  );
}

export function canManageSiteIntegration(role, permissionId) {
  return listSiteIntegrationPermissions(role).some(
    (permission) => permission.id === permissionId
  );
}
