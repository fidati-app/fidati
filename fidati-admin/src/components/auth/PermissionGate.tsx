import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { usePermissions, type Permission } from '@/hooks/usePermissions';

export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can, permissionsLoading } = usePermissions();

  if (permissionsLoading) {
    return <div className="empty-state">Verifica permessi…</div>;
  }

  if (!can(permission)) {
    return (
      fallback ?? (
        <div className="card review-panel">
          <h3>Accesso negato</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Non hai i permessi necessari per accedere a questa sezione.
          </p>
        </div>
      )
    );
  }

  return children;
}

export function PermissionRoute({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can, permissionsLoading } = usePermissions();

  if (permissionsLoading) {
    return <div className="login-screen">Verifica permessi…</div>;
  }

  if (!can(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
