import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { devLog } from '@/lib/devLog';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    devLog('route decision: login');
    return <Redirect href="/login" />;
  }

  devLog('route decision: tabs');
  return <Redirect href="/(tabs)" />;
}
