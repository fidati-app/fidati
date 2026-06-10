import { StyleSheet, Text, TextProps } from 'react-native';

import { Colors } from '@/constants/colors';

interface AppTextProps extends TextProps {
  color?: string;
}

export function AppText({ style, color, ...props }: AppTextProps) {
  return <Text style={[styles.base, color ? { color } : undefined, style]} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
  },
});
