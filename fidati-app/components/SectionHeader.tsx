import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string | ReactNode;
  leading?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function SectionHeader({
  title,
  leading,
  actionLabel,
  onAction,
  compact,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.titleRow}>
        {leading}
        <AppText style={styles.title}>{title}</AppText>
      </View>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText style={styles.action}>{actionLabel}</AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  containerCompact: {
    marginBottom: 4,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 12,
  },
  title: {
    fontSize: Design.font.display,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  action: {
    fontSize: Design.font.caption,
    fontWeight: '600',
    color: Colors.accent,
  },
});
