import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';

interface ProfessionalHeroCarouselProps {
  images: string[];
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ProfessionalHeroCarousel({
  images,
  height = 260,
}: ProfessionalHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.wrap, { height }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {images.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={[styles.image, { width: SCREEN_WIDTH, height }]}
            contentFit="cover"
            transition={300}
          />
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: Colors.border,
  },
  image: {
    backgroundColor: Colors.border,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.white,
  },
});
