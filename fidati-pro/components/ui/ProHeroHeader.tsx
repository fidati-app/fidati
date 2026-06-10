import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ProHeroHeaderProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function ProHeroHeader({ title, subtitle, icon, style }: ProHeroHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...Colors.heroGradient]}
      locations={[0, 0.55, 1]}
      style={[styles.hero, { paddingTop: insets.top + 18 }, style]}
    >
      <View style={styles.glow} />
      <View style={styles.titleRow}>
        <View style={styles.titleIcon}>
          <Ionicons name={icon} size={22} color={Colors.accent} />
        </View>
        <AppText style={styles.title}>{title}</AppText>
      </View>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    lineHeight: 34,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontSize: Design.font.caption,
    color: 'rgba(255, 255, 255, 0.68)',
    lineHeight: 20,
  },
});
