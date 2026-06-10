import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/theme';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'accent',
  loading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'accent' && styles.accent,
        variant === 'outline' && styles.outline,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.accent : Colors.white} />
      ) : (
        <AppText style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
    ...Shadow.card,
  },
  accent: {
    backgroundColor: Colors.accent,
    ...Shadow.card,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  outlineText: {
    color: Colors.text,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
