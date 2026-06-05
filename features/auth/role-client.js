export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    return null;
  }
}

export function getUserRole() {
  const user = getStoredUser();
  return user?.role || null;
}

export function isMistress() {
  return getUserRole() === 'Mistress';
}

export function isSub() {
  return getUserRole() === 'Sub';
}

export function isAdmin() {
  const role = getUserRole();
  return role === 'Admin' || role === 'Headmistress';
}

export const PERMISSIONS = {
  Mistress: ['view_subs', 'manage_ppv', 'go_live', 'assign_positions', 'manage_rolodex'],
  Sub: ['view_mistress', 'send_gift', 'chat', 'purchase_ppv', 'view_black_book'],
  Admin: ['view_all', 'moderate', 'manage_users', 'manage_plugins', 'view_command_centre'],
  Headmistress: ['view_all', 'moderate', 'manage_users', 'manage_plugins', 'view_command_centre', 'platform_override'],
};

export function hasPermission(permission) {
  const role = getUserRole();
  return Boolean(role && PERMISSIONS[role]?.includes(permission));
}
