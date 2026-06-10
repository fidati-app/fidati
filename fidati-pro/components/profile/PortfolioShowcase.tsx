import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { ProPortfolioItem } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - Design.spacing.screen * 2;

interface PortfolioShowcaseProps {
  items: ProPortfolioItem[];
}

function PortfolioCard({ item }: { item: ProPortfolioItem }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  const hasBeforeAfter = Boolean(item.beforeImage && item.afterImage);

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {item.images.map((uri, index) => (
          <View key={`${item.id}-${index}`} style={styles.slide}>
            <Image source={{ uri }} style={styles.heroImage} contentFit="cover" transition={200} />
            <View style={styles.imageOverlay} />
            <View style={styles.categoryPill}>
              <AppText style={styles.categoryText}>{item.category}</AppText>
            </View>
          </View>
        ))}
      </ScrollView>

      {item.images.length > 1 ? (
        <View style={styles.dots}>
          {item.images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.copy}>
        <AppText style={styles.title}>{item.title}</AppText>
        <AppText style={styles.subtitle}>{item.subtitle}</AppText>
      </View>

      {hasBeforeAfter ? (
        <View style={styles.beforeAfter}>
          <View style={styles.baCol}>
            <AppText style={styles.baLabel}>Prima</AppText>
            <Image
              source={{ uri: item.beforeImage }}
              style={styles.baImage}
              contentFit="cover"
              transition={200}
            />
          </View>
          <View style={styles.baArrow}>
            <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
          </View>
          <View style={styles.baCol}>
            <AppText style={styles.baLabel}>Dopo</AppText>
            <Image
              source={{ uri: item.afterImage }}
              style={styles.baImage}
              contentFit="cover"
              transition={200}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function PortfolioShowcase({ items }: PortfolioShowcaseProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <PortfolioCard key={item.id} item={item} />
      ))}
      <Pressable style={styles.addBtn}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.navy} />
        <AppText style={styles.addText}>Aggiungi lavoro al portfolio</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadow,
  },
  carousel: { width: CARD_WIDTH },
  slide: {
    width: CARD_WIDTH,
    height: 220,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 37, 74, 0.15)',
  },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Design.radius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.navy,
  },
  copy: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  beforeAfter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  baCol: { flex: 1, gap: 6 },
  baLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  baImage: {
    width: '100%',
    height: 90,
    borderRadius: Design.radius.md,
    backgroundColor: Colors.borderLight,
  },
  baArrow: {
    paddingTop: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Design.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.background,
  },
  addText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
});
