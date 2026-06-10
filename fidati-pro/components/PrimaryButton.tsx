import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { BorderRadius } from '@/constants/theme';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'accent' | 'outline' | 'danger';
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'accent',
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'accent' && styles.accent,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText
        style={[
          styles.label,
          variant === 'outline' && styles.outlineLabel,
          variant === 'danger' && styles.dangerLabel,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  accent: { backgroundColor: Colors.success },
  outline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  pressed: { opacity: 0.92 },
  label: { fontSize: 15, fontWeight: '700', color: Colors.white },
  outlineLabel: { color: Colors.navy },
  dangerLabel: { color: Colors.error },
});
