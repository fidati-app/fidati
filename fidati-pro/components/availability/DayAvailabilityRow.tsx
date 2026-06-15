import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { formatTimeRangeLabel } from '@/constants/availability';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { WeeklyScheduleDay } from '@/types';

interface DayAvailabilityRowProps {
  day: WeeklyScheduleDay;
  disabled?: boolean;
  onToggleAvailable: (isAvailable: boolean) => void;
  onPressTime: () => void;
}

export function DayAvailabilityRow({
  day,
  disabled,
  onToggleAvailable,
  onPressTime,
}: DayAvailabilityRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <AppText style={styles.dayLabel}>{day.dayLabel}</AppText>
          <AppText style={styles.statusLabel}>
            {day.isAvailable ? 'Disponibile' : 'Non disponibile'}
          </AppText>
        </View>
        <Switch
          value={day.isAvailable}
          onValueChange={onToggleAvailable}
          disabled={disabled}
          trackColor={{ false: Colors.border, true: 'rgba(16, 185, 129, 0.45)' }}
          thumbColor={day.isAvailable ? Colors.success : Colors.white}
        />
      </View>

      {day.isAvailable ? (
        <Pressable
          style={({ pressed }) => [styles.timeButton, pressed && styles.timeButtonPressed]}
          onPress={onPressTime}
          disabled={disabled}
        >
          <View style={styles.timeCopy}>
            <Ionicons name="time-outline" size={18} color={Colors.navy} />
            <AppText style={styles.timeText}>
              {formatTimeRangeLabel(day.startTime, day.endTime)}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    ...Design.shadowSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Design.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timeButtonPressed: {
    opacity: 0.92,
  },
  timeCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
  },
});
