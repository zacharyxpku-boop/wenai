import { describe, it, expect } from 'vitest';
import { hasMinRole, getRequiredRole, checkRouteAccess } from '@/lib/rbac';

describe('hasMinRole', () => {
  it('admin has all roles', () => {
    expect(hasMinRole('admin', 'admin')).toBe(true);
    expect(hasMinRole('admin', 'editor')).toBe(true);
    expect(hasMinRole('admin', 'viewer')).toBe(true);
  });

  it('editor has editor and viewer', () => {
    expect(hasMinRole('editor', 'admin')).toBe(false);
    expect(hasMinRole('editor', 'editor')).toBe(true);
    expect(hasMinRole('editor', 'viewer')).toBe(true);
  });

  it('viewer only has viewer', () => {
    expect(hasMinRole('viewer', 'admin')).toBe(false);
    expect(hasMinRole('viewer', 'editor')).toBe(false);
    expect(hasMinRole('viewer', 'viewer')).toBe(true);
  });

  it('unknown role has nothing', () => {
    expect(hasMinRole('unknown', 'viewer')).toBe(false);
  });
});

describe('getRequiredRole', () => {
  it('config routes require admin', () => {
    expect(getRequiredRole('/api/config')).toBe('admin');
    expect(getRequiredRole('/settings')).toBe('admin');
  });

  it('usage route requires editor', () => {
    expect(getRequiredRole('/api/usage')).toBe('editor');
  });

  it('AI routes require viewer', () => {
    expect(getRequiredRole('/api/ai')).toBe('viewer');
    expect(getRequiredRole('/api/trademark')).toBe('viewer');
  });

  it('unknown routes default to viewer', () => {
    expect(getRequiredRole('/some/random/path')).toBe('viewer');
  });
});

describe('checkRouteAccess', () => {
  it('admin can access settings', () => {
    expect(checkRouteAccess('/settings', 'admin')).toBe(true);
  });

  it('editor cannot access settings', () => {
    expect(checkRouteAccess('/settings', 'editor')).toBe(false);
  });

  it('viewer can use AI modules', () => {
    expect(checkRouteAccess('/api/ai', 'viewer')).toBe(true);
  });

  it('viewer cannot access usage stats', () => {
    expect(checkRouteAccess('/api/usage', 'viewer')).toBe(false);
  });
});
