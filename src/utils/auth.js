/**
 * Reads the logged-in user from localStorage.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('userDetail');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the correct dashboard route for a user role.
 */
export function getDashboardPathForRole(role) {
  return role === 'admin' ? '/admin-dashboard' : '/dashboard';
}

/**
 * Returns the dashboard route for the currently stored user.
 */
export function getDefaultDashboardPath() {
  return getDashboardPathForRole(getStoredUser()?.role);
}
