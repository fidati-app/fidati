import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, session } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !session?.user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
