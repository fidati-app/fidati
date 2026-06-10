import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { ProDashboardStats } from '@/types';

interface ProfileStatsBarProps {
  stats: ProDashboardStats;
  memberSince: string;
}

export function ProfileStatsBar({ stats, memberSince }: ProfileStatsBarProps) {
  return (
    <View style={styles.wrap}>
      <StatItem
        icon="star"
        iconColor={Colors.star}
        value={stats.rating.toFixed(2)}
        label="Valutazione"
      />
      <View style={styles.divider} />
      <StatItem
        icon="chatbubble-ellipses-outline"
        value={String(stats.reviewCount)}
        label="Recensioni"
      />
      <View style={styles.divider} />
      <StatItem
        icon="checkmark-done-outline"
        value={String(stats.jobsCompleted)}
        label="Lavori"
      />
      <View style={styles.divider} />
      <StatItem icon="flash-outline" value={`${stats.responseRate}%`} label="Risposta" accent />
      <View style={styles.divider} />
      <StatItem icon="calendar-outline" value={memberSince.split(' ')[0]} label="Membro da" />
    </View>
  );
}

function StatItem({
  icon,
  iconColor = Colors.navy,
  value,
  label,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.item}>
      <Ionicons name={icon} size={14} color={accent ? Colors.success : iconColor} />
      <AppText style={[styles.value, accent && styles.valueAccent]}>{value}</AppText>
      <AppText style={styles.label}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: -20,
    marginHorizontal: Design.spacing.screen,
    ...Design.shadow,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  valueAccent: { color: Colors.success },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
