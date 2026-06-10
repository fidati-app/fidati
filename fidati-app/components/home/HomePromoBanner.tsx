import { Ionicons } from '@expo/vector-icons';
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
import { HOME_PROMO_BANNERS } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const AUTO_SCROLL_MS = 4500;

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
            <View style={[styles.iconCircle, { backgroundColor: banner.iconBg }]}>
              <Ionicons name={banner.icon} size={20} color={banner.iconColor} />
            </View>
            <View style={styles.copy}>
              <AppText style={styles.title}>{banner.title}</AppText>
              <AppText style={styles.subtitle}>{banner.subtitle}</AppText>
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
    marginBottom: 10,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.accent,
  },
});
