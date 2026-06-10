import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { AgendaDayMeta, DayAvailability } from '@/types';

const AVAIL_COLOR: Record<DayAvailability, string> = {
  free: Colors.success,
  partial: Colors.pending,
  full: Colors.navy,
  off: Colors.unavailable,
};

interface WeekStripProps {
  days: AgendaDayMeta[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function WeekStrip({ days, selectedKey, onSelect }: WeekStripProps) {
  return (
    <View style={styles.strip}>
      {days.map((day) => {
        const selected = day.key === selectedKey;
        const availColor = AVAIL_COLOR[day.availability];
        return (
          <Pressable
            key={day.key}
            onPress={() => onSelect(day.key)}
            style={[styles.day, selected && styles.daySelected]}
          >
            <AppText style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
              {day.label}
            </AppText>
            <AppText style={[styles.dayNum, selected && styles.dayNumSelected]}>{day.day}</AppText>
            <View
              style={[
                styles.availBar,
                { backgroundColor: selected ? 'rgba(255,255,255,0.35)' : availColor },
              ]}
            />
            {day.appointmentCount > 0 ? (
              <View style={[styles.countDot, selected && styles.countDotSelected]}>
                <AppText style={[styles.countText, selected && styles.countTextSelected]}>
                  {day.appointmentCount}
                </AppText>
              </View>
            ) : (
              <View style={styles.countSpacer} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Design.spacing.screen,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Design.radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  daySelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  dayLabelSelected: { color: 'rgba(255,255,255,0.75)' },
  dayNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  dayNumSelected: { color: Colors.white },
  availBar: {
    width: '70%',
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  countDot: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.pendingSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  countDotSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  countText: { fontSize: 9, fontWeight: '800', color: Colors.pending },
  countTextSelected: { color: Colors.white },
  countSpacer: { height: 18, marginTop: 2 },
});
