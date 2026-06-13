import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { AvailabilityMenu } from '@/components/ui/AvailabilityMenu';
import { TransientToast } from '@/components/ui/TransientToast';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { MOCK_REQUESTS } from '@/services/mockData';

const LOGO = require('@/components/logo-fidatipro.png');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useMyProfessionalProfile();
  const [available, setAvailable] = useState(profile?.availableToday ?? true);
  const [showAvailableToast, setShowAvailableToast] = useState(false);

  if (!profile) {
    return null;
  }

  const handleAvailabilityChange = useCallback((value: boolean) => {
    if (!value) {
      setShowAvailableToast(false);
    } else if (!available) {
      setShowAvailableToast(true);
    }
    setAvailable(value);
  }, [available]);

  const pendingRequests = useMemo(
    () => MOCK_REQUESTS.filter((r) => r.status === 'pending').length,
    [],
  );

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <LinearGradient
          colors={[...Colors.heroGradient]}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.glow} />
          <View style={styles.headerTop}>
            <AvailabilityMenu available={available} onChange={handleAvailabilityChange} />
            <View style={styles.logoWrap}>
              <Image source={LOGO} style={styles.logo} contentFit="contain" />
            </View>
            <Pressable style={styles.notifBtn} hitSlop={8}>
              <Ionicons name="notifications-outline" size={21} color={Colors.white} />
              {pendingRequests > 0 ? (
                <View style={styles.notifDot}>
                  <AppText style={styles.notifDotText}>{pendingRequests}</AppText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </LinearGradient>

        {!available ? (
          <Animated.View
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(160)}
            style={styles.unavailableBanner}
          >
            <Ionicons name="notifications-off-outline" size={14} color={Colors.error} />
            <AppText style={styles.unavailableText} numberOfLines={2}>
              <AppText style={styles.unavailableTitle}>Non disponibile. </AppText>
              Non riceverai nuove richieste finché non torni disponibile.
            </AppText>
          </Animated.View>
        ) : null}

        <TransientToast
          visible={showAvailableToast}
          title="Ora sei disponibile."
          message="Potrai ricevere nuove richieste."
          onHidden={() => setShowAvailableToast(false)}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 112 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          <HomeDashboard />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Design.spacing.screen,
    marginTop: 8,
    marginBottom: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Design.radius.md,
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  unavailableTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.error,
  },
  unavailableText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 48,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pending,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#031f42',
  },
  notifDotText: { fontSize: 9, fontWeight: '800', color: Colors.white },
});
