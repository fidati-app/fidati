import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import {
  CATEGORY_COLORS,
  getCategoryBorderColor,
  getCategoryTintColors,
} from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { CATEGORY_COVER_IMAGES } from '@/constants/images';
import { Category, Professional } from '@/types';

import { ServiceHeroStats } from './ServiceHeroStats';

interface ServiceCategoryHeroProps {
  category: Category;
  professionals: Professional[];
}

const HERO_HEIGHT = 248;

export function ServiceCategoryHero({ category, professionals }: ServiceCategoryHeroProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accent = CATEGORY_COLORS[category.slug];
  const tint = getCategoryTintColors(category.slug);
  const coverUri = CATEGORY_COVER_IMAGES[category.slug];

  return (
    <View style={styles.hero}>
      <Image source={{ uri: coverUri }} style={styles.image} contentFit="cover" />
      <View style={styles.scrim} />
      <LinearGradient
        colors={[
          'rgba(1, 13, 32, 0.35)',
          'rgba(1, 13, 32, 0.55)',
          'rgba(1, 13, 32, 0.96)',
        ]}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />
      <View style={[styles.tint, { backgroundColor: tint.backgroundColor }]} />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBadge, { borderColor: getCategoryBorderColor(category.slug) }]}>
            <Ionicons name={category.icon} size={18} color={accent} />
          </View>
          <AppText style={styles.name} numberOfLines={1}>
            {category.name}
          </AppText>
        </View>
        <AppText style={styles.description} numberOfLines={2}>
          {category.description}
        </AppText>
        <View style={styles.statsWrap}>
          <ServiceHeroStats category={category} professionals={professionals} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Design.spacing.screen,
    zIndex: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(1, 13, 32, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    position: 'absolute',
    left: Design.spacing.screen,
    right: Design.spacing.screen,
    bottom: 28,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.6,
    lineHeight: 30,
    textAlign: 'center',
    flexShrink: 1,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    textAlign: 'center',
  },
  statsWrap: {
    alignItems: 'center',
  },
});
