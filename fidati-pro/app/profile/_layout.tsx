import { Stack } from 'expo-router';

import { Colors } from '@/constants/colors';

export default function ProfileStackLayout() {
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
