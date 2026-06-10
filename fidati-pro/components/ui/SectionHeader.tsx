import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <AppText style={styles.title}>{title}</AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText style={styles.action}>{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  action: {
    fontSize: Design.font.caption,
    fontWeight: '700',
    color: Colors.navy,
  },
});
