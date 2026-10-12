import type { User } from '../features/auth/types';

export function can(permission: string, user: User | null): boolean {
  if (!user) return false;

  const role = user.roleId as { permissions?: string[] } | string;

  if (typeof role === 'string') {
    return false;
  }

  if (!role.permissions || !Array.isArray(role.permissions)) {
    return false;
  }

  // The backend grants the "*" wildcard to company owners (see requiresPermission).
  return role.permissions.includes('*') || role.permissions.includes(permission);
}

export function hasPermission(user: User | null, permission: string): boolean {
  return can(permission, user);
}

export function getUserPermissions(user: User | null): string[] {
  if (!user) return [];

  const role = user.roleId as { permissions?: string[] } | string;

  if (typeof role === 'string') {
    return [];
  }

  return role.permissions || [];
}

export function isOwner(user: User | null): boolean {
  if (!user) return false;
  const role = user.roleId as { slug?: string } | string;
  if (typeof role === 'string') return false;
  return role.slug === 'owner';
}

export function isEmployee(user: User | null): boolean {
  if (!user) return false;
  const role = user.roleId as { slug?: string } | string;
  if (typeof role === 'string') return false;
  return role.slug === 'employee';
}