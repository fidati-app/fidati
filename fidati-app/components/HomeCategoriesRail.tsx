import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { CATEGORY_COLORS } from '@/constants/categoryColors';
import { getHomeCategoryShortLabel } from '@/constants/categoryCatalog';
import { Colors } from '@/constants/colors';
import { useZoneAvailableCategories } from '@/hooks/useZoneAvailableCategories';
import { Category } from '@/types';

const RAIL_GAP = 6;
const ORB_SIZE = 50;
const ITEM_HEIGHT = 100;
const ITEM_WIDTH_MIN = 60;
const ITEM_WIDTH_MAX = 76;
const ITEM_WIDTH_FALLBACK = 74;
const LABEL_FONT_SIZE = 13;
const LABEL_LINE_HEIGHT = 17;
const BADGE_FONT_SIZE = 11;
const BADGE_LINE_HEIGHT = 14;

function resolveItemWidth(viewportWidth: number): number {
  if (viewportWidth <= 0) return ITEM_WIDTH_FALLBACK;
  const computed = Math.floor((viewportWidth - 5 * RAIL_GAP) / 5.5);
  return Math.min(ITEM_WIDTH_MAX, Math.max(ITEM_WIDTH_MIN, computed));
}

function CategoryOrb({ category }: { category: Category }) {
  const accent = CATEGORY_COLORS[category.slug];

  return (
    <View style={[styles.orb, { borderColor: accent }]}>
      <Ionicons name={category.icon} size={21} color={accent} />
    </View>
  );
}

function CategoryProBadge({ count }: { count: number }) {
  return (
    <AppText
      style={[styles.proBadge, styles.proBadgeActive]}
      numberOfLines={1}
      ellipsizeMode="tail"
      allowFontScaling={false}
    >
      {count} pro
    </AppText>
  );
}

interface CategoryItemProps {
  category: Category;
  zoneCount: number;
  itemWidth: number;
  onPress: () => void;
}

function CategoryItem({ category, zoneCount, itemWidth, onPress }: CategoryItemProps) {
  const scale = useSharedValue(1);
  const label = getHomeCategoryShortLabel(category.slug);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: 120, easing: Easing.out(Easing.cubic) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      }}
      style={[styles.item, { width: itemWidth }]}
    >
      <Animated.View style={[styles.itemInner, { width: itemWidth }, animatedStyle]}>
        <CategoryOrb category={category} />
        <View style={[styles.textGroup, { width: itemWidth }]}>
          <AppText
            style={[styles.name, { width: itemWidth }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            allowFontScaling={false}
          >
            {label}
          </AppText>
          <CategoryProBadge count={zoneCount} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function HomeCategoriesRail() {
  const router = useRouter();
  const { availableCategories, categoryCounts, hasSelectedCity } = useZoneAvailableCategories();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [showLeftFade, setShowLeftFade] = useState(false);

  const itemWidth = resolveItemWidth(viewportWidth);

  const openCategory = (slug: Category['slug']) => {
    router.push(`/categories/${slug}`);
  };

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== viewportWidth) {
      setViewportWidth(width);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setShowLeftFade(offsetX > 6);
  };

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <AppText style={styles.subtitle}>Scegli il servizio di cui hai bisogno</AppText>

      <View style={styles.scrollWrap} onLayout={handleViewportLayout}>
        <ScrollView
          horizontal
          bounces={false}
          overScrollMode="never"
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {availableCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              itemWidth={itemWidth}
              zoneCount={
                hasSelectedCity ? (categoryCounts[category.slug] ?? 0) : category.professionalCount
              }
              onPress={() => openCategory(category.slug)}
            />
          ))}
        </ScrollView>

        {showLeftFade ? (
          <LinearGradient
            pointerEvents="none"
            colors={[Colors.background, 'rgba(248,250,252,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeLeft}
          />
        ) : null}

        <LinearGradient
          pointerEvents="none"
          colors={['rgba(248,250,252,0)', Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fadeRight}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 0,
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  scrollWrap: {
    position: 'relative',
    marginHorizontal: -4,
  },
  rail: {
    gap: RAIL_GAP,
    paddingRight: 28,
    paddingLeft: 4,
    paddingBottom: 2,
  },
  fadeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 36,
    zIndex: 1,
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 36,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
  },
  itemInner: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  textGroup: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
    gap: 2,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
  },
  name: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    lineHeight: LABEL_LINE_HEIGHT,
    height: LABEL_LINE_HEIGHT,
    textAlign: 'center',
    includeFontPadding: false,
  },
  proBadge: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '600',
    lineHeight: BADGE_LINE_HEIGHT,
    height: BADGE_LINE_HEIGHT,
    textAlign: 'center',
    includeFontPadding: false,
  },
  proBadgeActive: {
    color: Colors.accent,
    opacity: 0.88,
  },
});
