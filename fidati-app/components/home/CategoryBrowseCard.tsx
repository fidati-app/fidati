import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  CATEGORY_COLORS,
  getCategoryBorderColor,
  getCategoryTintColors,
} from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Category, CategoryIcon } from '@/types';

interface CategoryBrowseCardProps {
  category: Category;
  subtitle: string;
  badge: string;
  onPress: () => void;
}

export function CategoryBrowseCard({
  category,
  subtitle,
  badge,
  onPress,
}: CategoryBrowseCardProps) {
  const accent = CATEGORY_COLORS[category.slug];
  const borderColor = getCategoryBorderColor(category.slug);
  const tint = getCategoryTintColors(category.slug);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Guarda tutti, ${subtitle}`}
    >
      <LinearGradient
        colors={[tint.backgroundColor, 'rgba(255,255,255,0.96)', Colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.row}>
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { borderColor: getCategoryBorderColor(category.slug, 0.35) }]}>
              <Ionicons name={category.icon as CategoryIcon} size={15} color={accent} />
            </View>
            <AppText style={styles.title}>Guarda tutti</AppText>
          </View>
          <AppText style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </AppText>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: getCategoryBorderColor(category.slug, 0.22),
              },
            ]}
          >
            <AppText style={[styles.badgeText, { color: accent }]} numberOfLines={1}>
              {badge}
            </AppText>
          </View>
        </View>

        <View style={styles.arrowWrap}>
          <Ionicons name="arrow-forward" size={16} color={accent} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: Design.homeCard.browseProWidth,
    height: Design.homeCard.proHeight,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.94,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingRight: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    alignSelf: 'center',
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.35,
    lineHeight: 20,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 14,
    letterSpacing: -0.1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.05,
    textAlign: 'center',
    includeFontPadding: false,
  },
  arrowWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
