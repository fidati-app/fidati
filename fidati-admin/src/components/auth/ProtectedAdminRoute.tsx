import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { AccessDeniedPage } from '@/pages/LoginPage';

export function ProtectedAdminRoute() {
  const { session, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="login-screen">Caricamento sessione…</div>;
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <AccessDeniedPage />;

  return <Outlet />;
}
