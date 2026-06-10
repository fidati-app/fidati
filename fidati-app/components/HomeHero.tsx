import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { QUICK_FILTERS } from '@/constants/categories';
import { Design } from '@/constants/design';
import { HomePromoBanner } from './home/HomePromoBanner';
import { AppText } from './AppText';
import { FilterPill } from './FilterPill';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';

export function HomeHero() {
  const insets = useSafeAreaInsets();

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
        <Pressable style={styles.bell} hitSlop={8}>
          <Ionicons name="notifications-outline" size={21} color={Colors.white} />
        </Pressable>
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
        <SearchBar
          size="large"
          iconPosition="right"
          placeholder="Cerca pulizie, idraulico, giardiniere..."
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {QUICK_FILTERS.map((filter) => (
          <FilterPill
            key={filter.id}
            label={filter.label}
            icon={filter.icon}
            variant="dark"
          />
        ))}
      </ScrollView>

      <HomePromoBanner />

      <View style={styles.trust}>
        <Ionicons name="shield-checkmark" size={15} color={Colors.accent} />
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
    paddingBottom: 12,
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
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    paddingRight: Design.spacing.screen,
  },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
  },
});
