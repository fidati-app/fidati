import { Tabs } from 'expo-router';

import { ProTabBar } from '@/components/ProTabBar';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
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
