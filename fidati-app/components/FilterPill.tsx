import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { AppText } from './AppText';

interface FilterPillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'light' | 'dark';
  onPress?: () => void;
}

export function FilterPill({ label, icon, variant = 'light', onPress }: FilterPillProps) {
  const isDark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        isDark ? styles.pillDark : styles.pillLight,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={12}
        color={isDark ? Colors.accent : Colors.accent}
      />
      <AppText
        style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillLight: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  pillDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelLight: {
    color: Colors.textSecondary,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.92)',
  },
  pressed: {
    opacity: 0.88,
  },
});
