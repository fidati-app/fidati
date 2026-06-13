import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { devLog } from '@/lib/devLog';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, user, session } = useAuth();

  if (isLoading) {
    devLog('route decision: auth-loading (index)');
    return null;
  }

  if (!isAuthenticated || !session?.user) {
    devLog('route decision: login', {
      isAuthenticated,
      userId: user?.id ?? null,
      sessionPresent: Boolean(session),
    });
    return <Redirect href="/login" />;
  }

  devLog('route decision: tabs', { userId: user?.id ?? null });
  return <Redirect href="/(tabs)" />;
}
