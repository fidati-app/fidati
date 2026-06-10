import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { TimeSlot } from '@/types';

interface DayTimelineProps {
  slots: TimeSlot[];
}

const SLOT_COLORS = {
  free: Colors.successSoft,
  booked: 'rgba(7, 37, 74, 0.08)',
  busy: Colors.borderLight,
} as const;

const SLOT_BORDER = {
  free: 'rgba(16, 185, 129, 0.25)',
  booked: 'rgba(7, 37, 74, 0.12)',
  busy: Colors.border,
} as const;

export function DayTimeline({ slots }: DayTimelineProps) {
  return (
    <View style={styles.wrap}>
      {slots.map((slot) => (
        <View key={slot.hour} style={styles.row}>
          <AppText style={styles.hour}>{slot.hour}</AppText>
          <View
            style={[
              styles.slot,
              {
                backgroundColor: SLOT_COLORS[slot.status],
                borderColor: SLOT_BORDER[slot.status],
              },
            ]}
          >
            {slot.label ? (
              <AppText style={styles.slotLabel} numberOfLines={1}>
                {slot.label}
              </AppText>
            ) : slot.status === 'free' ? (
              <AppText style={styles.freeLabel}>Libero</AppText>
            ) : null}
            {slot.status === 'booked' ? (
              <View style={styles.confirmedDot} />
            ) : slot.status === 'busy' && !slot.label ? (
              <View style={styles.busyDot} />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hour: {
    width: 42,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  slot: {
    flex: 1,
    minHeight: 36,
    borderRadius: Design.radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  freeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  confirmedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.navy,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.unavailable,
  },
});
