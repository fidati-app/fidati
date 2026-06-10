import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';
import { AppText } from './AppText';

type BadgeVariant = 'verified' | 'available' | 'confirmed' | 'incoming' | 'completed' | 'neutral';

interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Solo icona, senza testo */
  iconOnly?: boolean;
  iconSize?: number;
  style?: ViewStyle;
}

const VARIANTS: Record<BadgeVariant, { bg: string; text: string; iconColor: string }> = {
  verified: { bg: '#D1FAE5', text: Colors.accent, iconColor: Colors.accent },
  available: { bg: '#ECFDF5', text: Colors.accent, iconColor: Colors.accent },
  confirmed: { bg: '#D1FAE5', text: Colors.accent, iconColor: Colors.accent },
  incoming: { bg: '#DBEAFE', text: '#2563EB', iconColor: '#2563EB' },
  completed: { bg: '#F1F5F9', text: Colors.textSecondary, iconColor: Colors.textSecondary },
  neutral: { bg: '#F1F5F9', text: Colors.textSecondary, iconColor: Colors.textSecondary },
};

export function Badge({
  label,
  variant = 'neutral',
  icon,
  iconOnly = false,
  iconSize,
  style,
}: BadgeProps) {
  const colors = VARIANTS[variant];
  const resolvedIconSize = iconSize ?? (iconOnly ? 13 : 11);

  return (
    <View
      style={[
        styles.badge,
        iconOnly && styles.badgeIconOnly,
        { backgroundColor: colors.bg },
        style,
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={resolvedIconSize} color={colors.iconColor} />
      )}
      {!iconOnly && label ? (
        <AppText style={[styles.text, { color: colors.text }]}>{label}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeIconOnly: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
