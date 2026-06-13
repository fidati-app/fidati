import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PRO_REGISTRATION_CATEGORIES } from '@/constants/proCategories';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface CategoryPickerProps {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({ value, onChange, disabled = false }: CategoryPickerProps) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>Categoria principale</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {PRO_REGISTRATION_CATEGORIES.map((category) => {
          const active = category.slug === value;
          return (
            <Pressable
              key={category.slug}
              disabled={disabled}
              onPress={() => onChange(category.slug)}
              style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
            >
              <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                {category.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginLeft: 2,
  },
  rail: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Design.radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.navy,
  },
});
