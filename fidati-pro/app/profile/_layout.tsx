import { Stack } from 'expo-router';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfessional } from '@/contexts/MyProfessionalContext';

export default function ProfileStackLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isReady, status } = useMyProfessional();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isReady && (status === 'idle' || status === 'loading')) {
    return <AuthLoadingScreen caption="Caricamento profilo professionista…" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="complete" />
      <Stack.Screen name="services" />
      <Stack.Screen name="portfolio" />
      <Stack.Screen name="zones" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}
