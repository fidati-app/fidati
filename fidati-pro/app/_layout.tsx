import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { ProfessionalGate } from '@/components/auth/ProfessionalGate';
import { SupabaseConfigErrorScreen } from '@/components/auth/SupabaseConfigErrorScreen';
import { Colors } from '@/constants/colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AdminChangeRequestsProvider } from '@/contexts/AdminChangeRequestsContext';
import { MyProfessionalProvider } from '@/contexts/MyProfessionalContext';
import { ProfileProgressProvider } from '@/contexts/ProfileProgressContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthenticatedNavigationFix() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    const onPublicAuthRoute =
      pathname === '/login' ||
      pathname === '/register' ||
      segments[0] === 'login' ||
      segments[0] === 'register';

    if (onPublicAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [pathname, router, segments]);

  return null;
}

function AuthenticatedShell() {
  return (
    <ProfileProgressProvider>
      <AdminChangeRequestsProvider>
        <AuthenticatedNavigationFix />
        <View style={styles.shell}>
          <ProfessionalGate />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Colors.background },
              headerTintColor: Colors.primary,
              headerTitleStyle: { fontWeight: '700', fontSize: 17 },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: Colors.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen
              name="change-requests"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="requests/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="messages/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
          </Stack>
        </View>
      </AdminChangeRequestsProvider>
    </ProfileProgressProvider>
  );
}

function PublicNavigationFix() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    const onAuthenticatedRoute =
      segments[0] === '(tabs)' ||
      segments[0] === 'profile' ||
      pathname.startsWith('/requests') ||
      pathname.startsWith('/messages');

    if (onAuthenticatedRoute) {
      router.replace('/login');
    }
  }, [pathname, router, segments]);

  return null;
}

function PublicShell() {
  return (
    <>
      <PublicNavigationFix />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </>
  );
}

function AppBootstrap() {
  const { isAuthenticated, isLoading, configError, session, isRegistrationLocked } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (configError) {
    return <SupabaseConfigErrorScreen message={configError} />;
  }

  if (!isAuthenticated || !session?.user) {
    return <PublicShell />;
  }

  if (isRegistrationLocked) {
    return <PublicShell />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AuthenticatedShell />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <MyProfessionalProvider>
          <AppBootstrap />
        </MyProfessionalProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
});
