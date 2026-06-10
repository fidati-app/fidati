import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/theme';

type TextVariant = 'hero' | 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  hero: { ...Typography.hero, color: Colors.text },
  display: { ...Typography.display, color: Colors.text },
  title: { ...Typography.title, color: Colors.text },
  subtitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  body: { ...Typography.body, color: Colors.text },
  caption: { ...Typography.caption, color: Colors.textSecondary },
  label: { ...Typography.label, color: Colors.textSecondary },
};

export function AppText({ variant = 'body', color, style, ...props }: AppTextProps) {
  return (
    <Text
      style={[variantStyles[variant], color ? { color } : undefined, style]}
      {...props}
    />
  );
}
