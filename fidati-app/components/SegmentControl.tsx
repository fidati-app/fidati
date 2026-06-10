import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Spacing } from '@/constants/theme';
import { AppText } from './AppText';

interface SegmentControlProps {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}

export function SegmentControl({ options, selected, onSelect }: SegmentControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.key === selected;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={styles.segment}
          >
            <AppText style={[styles.label, isActive && styles.activeLabel]}>
              {option.label}
            </AppText>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Design.font.body,
    fontWeight: '500',
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
});
