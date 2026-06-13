import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuth } from '@/contexts/AuthContext';

/** Blocca route protette finché la sessione non è verificata. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
