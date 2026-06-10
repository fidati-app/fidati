import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORIES } from '@/constants/categories';
import { CATEGORY_COLORS } from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Category } from '@/types';
import { AppText } from './AppText';

function CategoryOrb({ category }: { category: Category }) {
  const accent = CATEGORY_COLORS[category.slug];

  return (
    <View style={[styles.orb, { borderColor: accent }]}>
      <Ionicons name={category.icon} size={22} color={accent} />
    </View>
  );
}

interface CategoryItemProps {
  category: Category;
  onPress: () => void;
}

function CategoryItem({ category, onPress }: CategoryItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 180 });
      }}
      style={styles.item}
    >
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        <CategoryOrb category={category} />
        <View style={styles.textGroup}>
          <AppText style={styles.name} numberOfLines={1}>
            {category.name}
          </AppText>
          <AppText style={styles.count}>
            {category.homeCount.toLocaleString('it-IT')}+
          </AppText>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function HomeCategoriesRail() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <AppText style={styles.subtitle}>Scegli il servizio di cui hai bisogno</AppText>

      <View style={styles.scrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          decelerationRate="fast"
        >
          {CATEGORIES.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onPress={() => router.push(`/service/${category.slug}`)}
            />
          ))}
        </ScrollView>

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
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 0,
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  scrollWrap: {
    position: 'relative',
  },
  rail: {
    gap: 7,
    paddingRight: 24,
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 28,
  },
  item: {
    width: 64,
  },
  itemInner: {
    alignItems: 'center',
    gap: 2,
  },
  textGroup: {
    alignItems: 'center',
    gap: 0,
  },
  orb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    lineHeight: 14,
    textAlign: 'center',
  },
  count: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.accent,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 1,
  },
});
