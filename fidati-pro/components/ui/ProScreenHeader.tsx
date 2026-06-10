import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ProScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}

export function ProScreenHeader({
  title,
  subtitle,
  right,
  dark = false,
  style,
}: ProScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        dark ? styles.headerDark : styles.headerLight,
        { paddingTop: insets.top + 12 },
        style,
      ]}
    >
      <View style={styles.copy}>
        <AppText style={[styles.title, dark && styles.titleDark]}>{title}</AppText>
        {subtitle ? (
          <AppText style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <View style={[styles.badge, verified ? styles.badgeVerified : styles.badgeUnverified]}>
      <Ionicons
        name={verified ? 'shield-checkmark' : 'shield-outline'}
        size={13}
        color={verified ? Colors.success : Colors.textMuted}
      />
      <AppText style={[styles.badgeText, verified ? styles.badgeTextVerified : styles.badgeTextMuted]}>
        {verified ? 'Verificato' : 'Non verificato'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 16,
    gap: 12,
  },
  headerLight: {
    backgroundColor: Colors.background,
  },
  headerDark: {
    backgroundColor: Colors.navy,
  },
  copy: { flex: 1, gap: 4 },
  title: {
    fontSize: Design.font.display,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  titleDark: { color: Colors.white },
  subtitle: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  subtitleDark: { color: 'rgba(255,255,255,0.72)' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Design.radius.full,
  },
  badgeVerified: {
    backgroundColor: Colors.successSoft,
  },
  badgeUnverified: {
    backgroundColor: Colors.borderLight,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextVerified: { color: Colors.success },
  badgeTextMuted: { color: Colors.textMuted },
});
