import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/colors';
import { ProfileProgressProvider } from '@/contexts/ProfileProgressContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProgressProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="requests/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="messages/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
      </ProfileProgressProvider>
    </GestureHandlerRootView>
  );
}
