import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BookingCalendarPicker } from '@/components/professionals/BookingCalendarPicker';
import { BookingSection } from '@/components/professionals/BookingSection';
import { BookingTimePicker } from '@/components/professionals/BookingTimePicker';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface BookingDateTimeFieldsProps {
  value: Date;
  onChange: (date: Date) => void;
  hasPickedDate: boolean;
  hasPickedTime: boolean;
  showErrors?: boolean;
  onDatePicked?: () => void;
  onTimePicked?: () => void;
}

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

function formatDate(date: Date) {
  const today = startOfDay(new Date());
  if (isSameDay(date, today)) return 'Oggi';
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function BookingDateTimeFields({
  value,
  onChange,
  hasPickedDate,
  hasPickedTime,
  showErrors = false,
  onDatePicked,
  onTimePicked,
}: BookingDateTimeFieldsProps) {
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const dateError = showErrors && !hasPickedDate;
  const timeError = showErrors && !hasPickedTime;

  const handleDateChange = (date: Date) => {
    onChange(date);
    onDatePicked?.();
    setPickerMode(null);
  };

  const handleTimeChange = (date: Date) => {
    onChange(date);
    onTimePicked?.();
    setPickerMode(null);
  };

  const openDatePicker = () => {
    setPickerMode((current) => (current === 'date' ? null : 'date'));
  };

  const openTimePicker = () => {
    setPickerMode((current) => (current === 'time' ? null : 'time'));
  };

  return (
    <BookingSection title="Quando" badge="required">
      <View style={styles.fields}>
        <View style={styles.fieldBlock}>
          <Pressable
            style={({ pressed }) => [
              styles.field,
              pickerMode === 'date' && styles.fieldActive,
              dateError && styles.fieldError,
              pressed && styles.fieldPressed,
            ]}
            onPress={openDatePicker}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={dateError ? Colors.error : Colors.accent}
            />
            <AppText
              style={[
                styles.fieldText,
                !hasPickedDate && styles.fieldPlaceholder,
                dateError && styles.fieldTextError,
              ]}
              numberOfLines={1}
            >
              {hasPickedDate ? formatDate(value) : 'Seleziona la data'}
            </AppText>
            <Ionicons
              name={pickerMode === 'date' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textSecondary}
            />
          </Pressable>
          {dateError ? <AppText style={styles.errorHint}>Seleziona una data</AppText> : null}

          {pickerMode === 'date' ? (
            <BookingCalendarPicker embedded value={value} onChange={handleDateChange} />
          ) : null}
        </View>

        <View style={styles.fieldBlock}>
          <Pressable
            style={({ pressed }) => [
              styles.field,
              pickerMode === 'time' && styles.fieldActive,
              timeError && styles.fieldError,
              pressed && styles.fieldPressed,
            ]}
            onPress={openTimePicker}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={timeError ? Colors.error : Colors.accent}
            />
            <AppText
              style={[
                styles.fieldText,
                !hasPickedTime && styles.fieldPlaceholder,
                timeError && styles.fieldTextError,
              ]}
            >
              {hasPickedTime ? formatTime(value) : 'Seleziona l\'orario'}
            </AppText>
            <Ionicons
              name={pickerMode === 'time' ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textSecondary}
            />
          </Pressable>
          {timeError ? <AppText style={styles.errorHint}>Seleziona un orario</AppText> : null}

          {pickerMode === 'time' ? (
            <BookingTimePicker embedded value={value} onChange={handleTimeChange} />
          ) : null}
        </View>
      </View>
    </BookingSection>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 10,
  },
  fieldBlock: {
    gap: 4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  fieldActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  fieldError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  fieldPressed: {
    opacity: 0.92,
  },
  fieldText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  fieldPlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  fieldTextError: {
    color: Colors.error,
  },
  errorHint: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 2,
  },
});
