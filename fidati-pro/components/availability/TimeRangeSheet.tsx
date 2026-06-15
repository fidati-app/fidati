import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TIME_OPTIONS } from '@/constants/availability';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { compareTimes } from '@/utils/availabilityValidation';

interface TimeRangeSheetProps {
  visible: boolean;
  dayLabel: string;
  startTime: string;
  endTime: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function TimeChipRow({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (time: string) => void;
}) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionLabel}>{label}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {options.map((time) => {
          const active = time === value;
          return (
            <Pressable
              key={time}
              onPress={() => onSelect(time)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <AppText style={[styles.chipText, active && styles.chipTextActive]}>{time}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function TimeRangeSheet({
  visible,
  dayLabel,
  startTime,
  endTime,
  onChangeStart,
  onChangeEnd,
  onConfirm,
  onClose,
}: TimeRangeSheetProps) {
  const endOptions = TIME_OPTIONS.filter((time) => compareTimes(time, startTime) > 0);
  const rangeError =
    compareTimes(endTime, startTime) <= 0
      ? 'L\'orario di fine deve essere dopo l\'inizio.'
      : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <AppText style={styles.title}>Orario · {dayLabel}</AppText>
          <AppText style={styles.subtitle}>Seleziona inizio e fine con un tap.</AppText>

          <TimeChipRow
            label="Inizio"
            value={startTime}
            options={TIME_OPTIONS.slice(0, -1)}
            onSelect={(time) => {
              onChangeStart(time);
              if (compareTimes(endTime, time) <= 0) {
                const nextEnd = TIME_OPTIONS.find((candidate) => compareTimes(candidate, time) > 0);
                if (nextEnd) onChangeEnd(nextEnd);
              }
            }}
          />

          <TimeChipRow
            label="Fine"
            value={endTime}
            options={endOptions.length > 0 ? endOptions : TIME_OPTIONS.slice(-1)}
            onSelect={onChangeEnd}
          />

          <View style={styles.preview}>
            <AppText style={styles.previewLabel}>Anteprima</AppText>
            <AppText style={styles.previewValue}>
              {startTime} — {endTime}
            </AppText>
          </View>

          {rangeError ? <AppText style={styles.error}>{rangeError}</AppText> : null}

          <PrimaryButton
            title="Conferma orario"
            onPress={onConfirm}
            disabled={Boolean(rangeError)}
          />
          <PrimaryButton title="Annulla" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Design.radius.xl,
    borderTopRightRadius: Design.radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
    maxHeight: '84%',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Design.radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.45)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
  chipTextActive: {
    fontWeight: '800',
    color: Colors.navy,
  },
  preview: {
    backgroundColor: Colors.background,
    borderRadius: Design.radius.lg,
    padding: 14,
    gap: 4,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  previewValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
});
