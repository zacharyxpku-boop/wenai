/**
 * Role-Based Access Control for wenai
 *
 * Roles: admin > editor > viewer
 * - admin: full access, settings, user management
 * - editor: use all modules, export, but no settings
 * - viewer: read-only, can try modules but no export/config
 */

export type Role = 'admin' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function hasMinRole(userRole: string, required: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[required];
  return userLevel >= requiredLevel;
}

// Route-level permission mapping
const ROUTE_PERMISSIONS: Record<string, Role> = {
  '/api/config': 'admin',
  '/api/auth/register': 'admin',
  '/settings': 'admin',
  '/api/usage': 'editor',
  '/api/feedback': 'viewer',
  '/api/ai': 'viewer',
  '/api/trademark': 'viewer',
  '/api/datasource': 'viewer',
  '/api/ocr': 'viewer',
  '/api/trends': 'viewer',
};

export function getRequiredRole(pathname: string): Role {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  // Prefix match
  for (const [route, role] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) return role;
  }
  return 'viewer';
}

export function checkRouteAccess(pathname: string, userRole: string): boolean {
  const required = getRequiredRole(pathname);
  return hasMinRole(userRole, required);
}
