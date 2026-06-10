import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface BookingCalendarPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  embedded?: boolean;
}

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'] as const;
const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
] as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function BookingCalendarPicker({
  value,
  onChange,
  embedded = false,
}: BookingCalendarPickerProps) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const cells = buildMonthGrid(viewMonth);
  const isTodaySelected = isSameDay(value, today);

  useEffect(() => {
    setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value]);

  const shiftMonth = (delta: number) => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const selectDay = (day: Date) => {
    if (startOfDay(day) < today) return;
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
  };

  const selectToday = () => {
    const next = new Date(value);
    const now = new Date();
    next.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    onChange(next);
  };

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <View style={styles.quickRow}>
        <Pressable
          onPress={selectToday}
          style={({ pressed }) => [
            styles.todayChip,
            isTodaySelected && styles.todayChipActive,
            pressed && styles.todayChipPressed,
          ]}
        >
          <AppText style={[styles.todayChipText, isTodaySelected && styles.todayChipTextActive]}>
            Oggi
          </AppText>
        </Pressable>
      </View>

      <View style={styles.header}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={8} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        </Pressable>
        <AppText style={styles.monthLabel}>
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </AppText>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={8} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((label, index) => (
          <AppText key={`${label}-${index}`} style={styles.weekday}>
            {label}
          </AppText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const disabled = startOfDay(day) < today;
          const selected = isSameDay(day, value);
          const isToday = isSameDay(day, today);

          return (
            <Pressable
              key={day.toISOString()}
              disabled={disabled}
              onPress={() => selectDay(day)}
              style={({ pressed }) => [
                styles.dayCell,
                selected && styles.daySelected,
                isToday && !selected && styles.dayToday,
                disabled && styles.dayDisabled,
                pressed && !disabled && styles.dayPressed,
              ]}
            >
              <AppText
                style={[
                  styles.dayText,
                  selected && styles.dayTextSelected,
                  disabled && styles.dayTextDisabled,
                ]}
              >
                {day.getDate()}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 8,
  },
  wrapEmbedded: {
    backgroundColor: Colors.background,
    borderWidth: 0,
    borderRadius: Design.radius.button,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  quickRow: {
    flexDirection: 'row',
  },
  todayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  todayChipActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  todayChipPressed: {
    opacity: 0.9,
  },
  todayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  todayChipTextActive: {
    color: Colors.accent,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  daySelected: {
    backgroundColor: Colors.accent,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayPressed: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: Colors.textSecondary,
  },
});
