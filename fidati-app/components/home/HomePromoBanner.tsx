import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { HomePromoBanner as HomePromoBannerData, HOME_PROMO_BANNERS } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const AUTO_SCROLL_MS = 4500;
/** Angoli morbidi stile premium per le card promo Hero. */
const BANNER_RADIUS = 26;

function BannerVisual({ banner }: { banner: HomePromoBannerData }) {
  return (
    <View style={[styles.iconCircle, { backgroundColor: banner.iconBg }]}>
      {banner.imageSource ? (
        <Image source={banner.imageSource} style={styles.brandIcon} contentFit="contain" />
      ) : (
        <Ionicons name={banner.icon!} size={18} color={banner.iconColor!} />
      )}
    </View>
  );
}

export function HomePromoBanner() {
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = screenWidth - Design.spacing.screen * 2;
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      scrollRef.current?.scrollTo({ x: index * bannerWidth, animated });
      activeIndexRef.current = index;
      setActiveIndex(index);
    },
    [bannerWidth],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndexRef.current + 1) % HOME_PROMO_BANNERS.length;
      scrollToIndex(next);
    }, AUTO_SCROLL_MS);

    return () => clearInterval(timer);
  }, [scrollToIndex]);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
      >
        {HOME_PROMO_BANNERS.map((banner) => (
          <View key={banner.id} style={[styles.banner, { width: bannerWidth }]}>
            <BannerVisual banner={banner} />
            <View style={styles.copy}>
              <AppText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {banner.title}
              </AppText>
              <AppText style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
                {banner.subtitle}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {HOME_PROMO_BANNERS.map((banner, index) => (
          <View
            key={banner.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 0,
    marginBottom: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: BANNER_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 52,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  brandIcon: {
    width: 20,
    height: 20,
  },
  copy: {
    flex: 1,
    gap: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.25,
    lineHeight: 17,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 14,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    width: 16,
    backgroundColor: Colors.accent,
  },
});
