import { StyleSheet, View, ViewStyle } from 'react-native';

import { getCategoryOverlayColor, getCategoryTintColors } from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { CategorySlug } from '@/types';
import { AppText } from './AppText';

interface CategoryTagProps {
  label: string;
  categorySlug: CategorySlug;
  overlay?: boolean;
  /** Su foto piccole: padding ridotto */
  compact?: boolean;
  style?: ViewStyle;
}

export function CategoryTag({
  label,
  categorySlug,
  overlay = false,
  compact = false,
  style,
}: CategoryTagProps) {
  const overlayBg = overlay ? getCategoryOverlayColor(categorySlug, compact) : undefined;
  const tint = !overlay ? getCategoryTintColors(categorySlug) : undefined;

  return (
    <View
      style={[
        styles.tag,
        overlay && styles.tagOverlay,
        overlay && compact && styles.tagOverlayCompact,
        overlay && overlayBg ? { backgroundColor: overlayBg, borderColor: overlayBg } : null,
        tint
          ? {
              backgroundColor: tint.backgroundColor,
              borderColor: tint.borderColor,
            }
          : null,
        style,
      ]}
    >
      <AppText
        style={[
          styles.text,
          overlay && styles.textOverlay,
          overlay && compact && styles.textOverlayCompact,
          tint ? { color: tint.textColor } : null,
        ]}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tagOverlay: {
    alignSelf: 'stretch',
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  textOverlay: {
    fontSize: 9,
    lineHeight: 12,
    color: Colors.white,
    fontWeight: '700',
  },
  tagOverlayCompact: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  textOverlayCompact: {
    fontSize: 7,
    lineHeight: 10,
    fontWeight: '800',
  },
});
