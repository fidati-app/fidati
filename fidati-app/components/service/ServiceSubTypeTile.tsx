import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { CATEGORY_COLORS } from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { CategorySubService } from '@/constants/categoryServices';
import { CategorySlug } from '@/types';

interface ServiceSubTypeTileProps {
  service: CategorySubService;
  categorySlug: CategorySlug;
}

export function ServiceSubTypeTile({ service, categorySlug }: ServiceSubTypeTileProps) {
  const accent = CATEGORY_COLORS[categorySlug];

  return (
    <Pressable style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Ionicons name={service.icon} size={11} color={accent} />
      <AppText style={styles.label} numberOfLines={1}>
        {service.title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 152,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
    lineHeight: 13,
    flexShrink: 1,
  },
});
