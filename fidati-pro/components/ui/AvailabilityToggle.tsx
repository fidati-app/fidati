import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface AvailabilityToggleProps {
  available: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}

export function AvailabilityToggle({ available, onToggle, style }: AvailabilityToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.wrap,
        available ? styles.available : styles.unavailable,
        style,
      ]}
    >
      <View style={[styles.dot, available ? styles.dotOn : styles.dotOff]} />
      <AppText style={[styles.label, available ? styles.labelOn : styles.labelOff]}>
        {available ? 'Disponibile' : 'Non disponibile'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Design.radius.full,
    borderWidth: 1,
  },
  available: {
    backgroundColor: Colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  unavailable: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOn: { backgroundColor: Colors.success },
  dotOff: { backgroundColor: Colors.unavailable },
  label: { fontSize: 13, fontWeight: '700' },
  labelOn: { color: Colors.success },
  labelOff: { color: Colors.textSecondary },
});
