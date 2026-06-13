import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeNotificationsBell } from '@/components/notifications/HomeNotificationsBell';
import { HomeSearchBar } from '@/components/search/HomeSearchBar';
import { SelectedCityZoneRow } from '@/components/zone/SelectedCityChip';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useServiceZone } from '@/context/ServiceZoneContext';
import { HomePromoBanner } from './home/HomePromoBanner';
import { AppText } from './AppText';
import { Logo } from './Logo';

export function HomeHero() {
  const insets = useSafeAreaInsets();
  const { selectedCity, hasSelectedCity, clearSelectedCity } = useServiceZone();

  return (
    <LinearGradient
      colors={['#010D20', '#031f42', '#042a55']}
      locations={[0, 0.55, 1]}
      style={[styles.hero, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.glow} />
      <View style={styles.glowAccent} />

      <View style={styles.topBar}>
        <Logo size="lg" />
        <HomeNotificationsBell />
      </View>

      <View style={styles.copy}>
        <AppText style={styles.title}>Di chi hai bisogno oggi?</AppText>
        <AppText style={styles.subtitle}>
          Confronta, Prenota e{' '}
          <AppText style={styles.subtitleAccent}>Fidati</AppText>
          {' '}dei migliori.
        </AppText>
      </View>

      <View style={styles.searchCard}>
        <HomeSearchBar />
      </View>

      {hasSelectedCity && selectedCity ? (
        <View style={styles.chipRow}>
          <SelectedCityZoneRow city={selectedCity} onClear={clearSelectedCity} variant="dark" />
        </View>
      ) : null}

      <View style={hasSelectedCity ? styles.promoBanner : undefined}>
        <HomePromoBanner />
      </View>

      <View style={styles.trust}>
        <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
        <AppText style={styles.trustText}>
          Oltre 2.400 professionisti verificati in Italia
        </AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 8,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  glowAccent: {
    position: 'absolute',
    bottom: 40,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  copy: {
    gap: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 22,
  },
  subtitleAccent: {
    color: Colors.accent,
    fontWeight: '700',
  },
  searchCard: {
    marginBottom: 4,
  },
  chipRow: {
    marginBottom: 10,
  },
  promoBanner: {
    marginTop: 4,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 14,
  },
});
