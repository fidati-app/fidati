import { Tabs } from 'expo-router';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { ProTabBar } from '@/components/ProTabBar';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfessional } from '@/contexts/MyProfessionalContext';

export default function TabLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isReady, status } = useMyProfessional();

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthLoadingScreen caption="Reindirizzamento al login…" />;
  }

  if (!isReady && (status === 'idle' || status === 'loading')) {
    return <AuthLoadingScreen caption="Caricamento profilo professionista…" />;
  }

  if (!isReady) {
    return null;
  }

  return (
    <Tabs
      tabBar={(props) => <ProTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="requests" options={{ title: 'Richieste' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messaggi' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
    </Tabs>
  );
}
