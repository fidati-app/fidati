import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { DayAvailability, WeeklyAvailabilitySlot } from '@/types';

const STATUS_LABEL: Record<DayAvailability, string> = {
  free: 'Libero',
  partial: 'Parziale',
  full: 'Pieno',
  off: 'Off',
};

const STATUS_COLOR: Record<DayAvailability, string> = {
  free: Colors.success,
  partial: Colors.pending,
  full: Colors.navy,
  off: Colors.unavailable,
};

interface WeeklyAvailabilityGridProps {
  slots: WeeklyAvailabilitySlot[];
}

export function WeeklyAvailabilityGrid({ slots }: WeeklyAvailabilityGridProps) {
  return (
    <View style={styles.grid}>
      {slots.map((slot) => (
        <View key={slot.day} style={styles.row}>
          <View style={styles.dayCol}>
            <AppText style={styles.dayShort}>{slot.shortLabel}</AppText>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[slot.status] }]} />
          </View>
          <View style={styles.rangesCol}>
            {slot.ranges.length > 0 ? (
              slot.ranges.map((range) => (
                <AppText key={range} style={styles.range}>
                  {range}
                </AppText>
              ))
            ) : (
              <AppText style={styles.offText}>Non disponibile</AppText>
            )}
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLOR[slot.status]}18` }]}>
            <AppText style={[styles.statusText, { color: STATUS_COLOR[slot.status] }]}>
              {STATUS_LABEL[slot.status]}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayCol: { width: 36, alignItems: 'center', gap: 4 },
  dayShort: { fontSize: 11, fontWeight: '800', color: Colors.navy },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  rangesCol: { flex: 1, gap: 2 },
  range: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  offText: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});
