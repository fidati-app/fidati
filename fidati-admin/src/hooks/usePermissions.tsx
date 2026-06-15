import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminPermissions } from '@/services/permissionsService';
import type { AdminRole } from '@/types';

export type Permission =
  | 'dashboard.view'
  | 'professionals.view'
  | 'professionals.edit'
  | 'professionals.ban'
  | 'verifications.view'
  | 'verifications.approve'
  | 'verifications.reject'
  | 'verifications.request_changes'
  | 'customers.view'
  | 'customers.edit'
  | 'customers.ban'
  | 'requests.view'
  | 'requests.edit'
  | 'chats.view'
  | 'reports.view'
  | 'reports.edit'
  | 'accounting.view'
  | 'accounting.edit'
  | 'staff.view'
  | 'staff.create'
  | 'staff.edit'
  | 'settings.view'
  | 'settings.edit'
  | 'audit.view';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard.view', 'professionals.view', 'professionals.edit', 'professionals.ban',
    'verifications.view', 'verifications.approve', 'verifications.reject', 'verifications.request_changes',
    'customers.view', 'customers.edit', 'customers.ban',
    'requests.view', 'requests.edit', 'chats.view',
    'reports.view', 'reports.edit',
    'accounting.view', 'accounting.edit',
    'staff.view', 'staff.create', 'staff.edit',
    'settings.view', 'settings.edit', 'audit.view',
  ],
  review_team: [
    'dashboard.view', 'professionals.view', 'professionals.edit',
    'verifications.view', 'verifications.approve', 'verifications.reject', 'verifications.request_changes',
    'audit.view',
  ],
  accounting_team: ['dashboard.view', 'accounting.view', 'accounting.edit', 'audit.view'],
  support_team: [
    'dashboard.view', 'customers.view', 'customers.edit',
    'requests.view', 'requests.edit', 'chats.view',
    'reports.view', 'reports.edit', 'audit.view',
  ],
  operator: ['dashboard.view', 'requests.view', 'customers.view', 'chats.view'],
};

const PermissionContext = createContext<{
  can: (p: Permission) => boolean;
  role: AdminRole | null;
  customPermissions: Permission[];
  permissionsLoading: boolean;
} | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const role = admin?.role ?? null;
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  useEffect(() => {
    if (!admin?.id) {
      setCustomPermissions([]);
      return;
    }
    setPermissionsLoading(true);
    void fetchAdminPermissions(admin.id)
      .then(setCustomPermissions)
      .catch(() => setCustomPermissions([]))
      .finally(() => setPermissionsLoading(false));
  }, [admin?.id]);

  const effectivePermissions = useMemo(() => {
    if (!role) return new Set<Permission>();
    if (role === 'super_admin') return new Set(ROLE_PERMISSIONS.super_admin);
    if (customPermissions.length > 0) return new Set(customPermissions);
    return new Set(ROLE_PERMISSIONS[role] ?? []);
  }, [role, customPermissions]);

  const can = useCallback(
    (permission: Permission) => effectivePermissions.has(permission),
    [effectivePermissions],
  );

  const value = useMemo(
    () => ({ can, role, customPermissions, permissionsLoading }),
    [can, role, customPermissions, permissionsLoading],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions requires PermissionProvider');
  return ctx;
}

export { ROLE_PERMISSIONS };
