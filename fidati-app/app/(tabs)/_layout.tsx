import { Tabs } from 'expo-router';

import { CustomTabBar } from '@/components/CustomTabBar';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          shadowOpacity: 0,
          shadowRadius: 0,
        },
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorie' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Prenotazioni' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messaggi' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profilo' }} />
    </Tabs>
  );
}
