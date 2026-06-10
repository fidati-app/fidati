import { StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: 'default' | 'success' | 'pending';
  style?: ViewStyle;
}

export function MetricCard({ label, value, hint, accent = 'default', style }: MetricCardProps) {
  const valueColor =
    accent === 'success' ? Colors.success : accent === 'pending' ? Colors.pending : Colors.navy;

  return (
    <View style={[styles.card, style]}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={[styles.value, { color: valueColor }]}>{value}</AppText>
      {hint ? <AppText style={styles.hint}>{hint}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
    ...Design.shadowSoft,
  },
  label: {
    fontSize: Design.font.micro,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: Design.font.micro,
    color: Colors.textMuted,
  },
});
