/**
 * Builds a full API URL for hosted environments.
 * Relative paths only work locally via the Vite dev proxy.
 */
export function getApiUrl(endpoint) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
}
