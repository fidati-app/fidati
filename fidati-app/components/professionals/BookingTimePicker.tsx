import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface BookingTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  embedded?: boolean;
}

const TIME_SLOTS = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

function formatTimeValue(date: Date) {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function BookingTimePicker({ value, onChange, embedded = false }: BookingTimePickerProps) {
  const activeTime = formatTimeValue(value);

  const selectTime = (slot: string) => {
    const [hours, minutes] = slot.split(':').map(Number);
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onChange(next);
  };

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        bounces={false}
      >
        {TIME_SLOTS.map((slot) => {
          const selected = slot === activeTime;
          return (
            <Pressable
              key={slot}
              onPress={() => selectTime(slot)}
              style={({ pressed }) => [
                styles.slot,
                selected && styles.slotSelected,
                pressed && styles.slotPressed,
              ]}
            >
              <AppText style={[styles.slotText, selected && styles.slotTextSelected]}>
                {slot}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  wrapEmbedded: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingVertical: 4,
  },
  row: {
    gap: 8,
  },
  slot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  slotSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  slotPressed: {
    opacity: 0.9,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  slotTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
});
