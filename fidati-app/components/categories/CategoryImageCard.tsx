import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import {
  CATEGORY_COLORS,
  getCategoryBorderColor,
  getCategoryTintColors,
} from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { CATEGORY_COVER_IMAGES } from '@/constants/images';
import { Category } from '@/types';

interface CategoryImageCardProps {
  category: Category;
  zoneProCount?: number;
}

const CARD_HEIGHT = 156;

export function CategoryImageCard({ category, zoneProCount }: CategoryImageCardProps) {
  const router = useRouter();
  const accent = CATEGORY_COLORS[category.slug];
  const tint = getCategoryTintColors(category.slug);
  const coverUri = CATEGORY_COVER_IMAGES[category.slug];
  const proCount = zoneProCount ?? category.professionalCount;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/service/${category.slug}`)}
    >
      <Image source={{ uri: coverUri }} style={styles.image} contentFit="cover" />
      <View style={styles.scrim} />
      <LinearGradient
        colors={[
          'rgba(1, 13, 32, 0.18)',
          'rgba(1, 13, 32, 0.48)',
          'rgba(1, 13, 32, 0.94)',
        ]}
        locations={[0.15, 0.5, 1]}
        style={styles.gradient}
      />
      <View style={[styles.tint, { backgroundColor: tint.backgroundColor }]} />

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBadge, { borderColor: getCategoryBorderColor(category.slug) }]}>
            <Ionicons name={category.icon} size={16} color={accent} />
          </View>
          <AppText style={styles.name} numberOfLines={1}>
            {category.name}
          </AppText>
        </View>
        <AppText style={styles.description} numberOfLines={2}>
          {category.description}
        </AppText>
        <View style={styles.countRow}>
          <AppText style={styles.count}>
            {proCount} professionisti verificati
          </AppText>
          <Ionicons name="arrow-forward" size={20} color={Colors.accent} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: Design.radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.border,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 13, 32, 0.22)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.65,
  },
  copy: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  count: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.1,
  },
});
