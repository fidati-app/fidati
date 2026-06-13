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
import { MyProfessionalProvider } from '@/contexts/MyProfessionalContext';
import { ProfileProgressProvider } from '@/contexts/ProfileProgressContext';
import { devLog } from '@/lib/devLog';

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
      devLog('route decision: authenticated user on public route → tabs', {
        pathname,
        segments,
      });
      router.replace('/(tabs)');
    }
  }, [pathname, router, segments]);

  return null;
}

function AuthenticatedShell() {
  return (
    <MyProfessionalProvider>
      <ProfileProgressProvider>
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
              name="requests/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="messages/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
          </Stack>
        </View>
      </ProfileProgressProvider>
    </MyProfessionalProvider>
  );
}

function PublicShell() {
  return (
    <>
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
  const { isAuthenticated, isLoading, configError, user, session } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
        .then(() => {
          devLog('splash hidden');
        })
        .catch(() => {
          devLog('splash hidden (with error)');
        });
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      devLog('route decision: auth-loading');
      return;
    }

    if (configError) {
      devLog('route decision: config-error');
      return;
    }

    if (!isAuthenticated || !session?.user) {
      devLog('route decision: public-shell/login', {
        isAuthenticated,
        userId: user?.id ?? null,
        sessionPresent: Boolean(session),
        currentRoute: pathname,
        segments,
      });
      return;
    }

    devLog('route decision: authenticated-shell/app', {
      userId: user?.id ?? null,
      sessionPresent: Boolean(session),
      currentRoute: pathname,
      segments,
    });
  }, [
    configError,
    isAuthenticated,
    isLoading,
    pathname,
    segments,
    session,
    user?.id,
  ]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (configError) {
    return <SupabaseConfigErrorScreen message={configError} />;
  }

  if (!isAuthenticated || !session?.user) {
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
        <AppBootstrap />
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
