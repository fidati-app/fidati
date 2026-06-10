import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export function CategoriesHero() {
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
        <AppText style={styles.title}>
          Tutte le <AppText style={styles.titleAccent}>categorie</AppText>
        </AppText>
      </View>

      <SearchBar
        size="large"
        iconPosition="right"
        placeholder="Cerca pulizie, idraulico, elettricista..."
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 16,
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
    bottom: 20,
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
    marginBottom: 10,
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
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    lineHeight: 32,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.8,
    lineHeight: 32,
    textAlign: 'center',
  },
});
