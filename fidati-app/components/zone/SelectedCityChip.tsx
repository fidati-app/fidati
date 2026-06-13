import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';

interface SelectedCityChipProps {
  city: string;
  onClear: () => void;
  variant?: 'dark' | 'light';
  /** Chip compatto, adattato al testo — senza icona interna. */
  compact?: boolean;
}

export function SelectedCityChip({
  city,
  onClear,
  variant = 'dark',
  compact = false,
}: SelectedCityChipProps) {
  const isDark = variant === 'dark';

  return (
    <View
      style={[
        styles.chip,
        compact && styles.chipCompact,
        isDark ? styles.chipDark : styles.chipLight,
      ]}
    >
      <AppText
        style={[
          styles.label,
          compact && styles.labelCompact,
          isDark ? styles.labelDark : styles.labelLight,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {city}
      </AppText>
      <Pressable
        onPress={onClear}
        hitSlop={6}
        style={({ pressed }) => [
          styles.clearBtn,
          compact && styles.clearBtnCompact,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Rimuovi ${city}`}
      >
        <AppText style={[styles.clearGlyph, isDark ? styles.clearGlyphDark : styles.clearGlyphLight]}>
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

interface SelectedCityZoneRowProps {
  city: string;
  onClear: () => void;
  variant?: 'dark' | 'light';
}

/** Filtro città integrato nella ricerca: «Cerca professionisti a:» + chip. */
export function SelectedCityZoneRow({ city, onClear, variant = 'dark' }: SelectedCityZoneRowProps) {
  const isDark = variant === 'dark';

  return (
    <View style={styles.row}>
      <AppText
        style={[styles.prefixLabel, isDark ? styles.prefixLabelDark : styles.prefixLabelLight]}
      >
        Cerca professionisti a:
      </AppText>
      <SelectedCityChip city={city} onClear={onClear} variant={variant} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 6,
    rowGap: 4,
  },
  prefixLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.12,
    lineHeight: 14,
    flexShrink: 0,
  },
  prefixLabelDark: {
    color: 'rgba(255,255,255,0.52)',
  },
  prefixLabelLight: {
    color: Colors.textSecondary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipCompact: {
    gap: 0,
    paddingLeft: 7,
    paddingRight: 1,
    paddingVertical: 2,
    borderRadius: 9,
    minHeight: 22,
    maxWidth: '100%',
  },
  chipDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipLight: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: -0.1,
    flexShrink: 1,
    maxWidth: 160,
  },
  labelDark: {
    color: 'rgba(255,255,255,0.94)',
  },
  labelLight: {
    color: Colors.primary,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnCompact: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 1,
  },
  clearGlyph: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    includeFontPadding: false,
  },
  clearGlyphDark: {
    color: 'rgba(255,255,255,0.68)',
  },
  clearGlyphLight: {
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});
