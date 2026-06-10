import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface CompactStatCardProps {
  icon: IoniconName;
  label: string;
  value: string;
  accent?: 'default' | 'success' | 'pending' | 'navy';
  style?: ViewStyle;
}

export function CompactStatCard({
  icon,
  label,
  value,
  accent = 'default',
  style,
}: CompactStatCardProps) {
  const iconColor =
    accent === 'success'
      ? Colors.success
      : accent === 'pending'
        ? Colors.pending
        : accent === 'navy'
          ? Colors.navy
          : Colors.textSecondary;

  const valueColor =
    accent === 'success'
      ? Colors.success
      : accent === 'pending'
        ? Colors.pending
        : Colors.navy;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={15} color={iconColor} />
      </View>
      <AppText style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </AppText>
      <AppText style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 4,
    minWidth: 100,
    ...Design.shadowSoft,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    lineHeight: 13,
  },
});
