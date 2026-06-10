import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { CategoryTag } from '@/components/CategoryTag';
import { ProfileImage } from '@/components/ProfileImage';
import { getCategoryBorderColor } from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Professional } from '@/types';

interface UrgentProCardProps {
  professional: Professional;
  badge: string;
}

const PHOTO_WIDTH = 148;
const PHOTO_HEIGHT = 88;

export function UrgentProCard({ professional, badge }: UrgentProCardProps) {
  const router = useRouter();
  const isSoon = badge.includes('ora');
  const categoryBorder = getCategoryBorderColor(professional.categorySlug);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor: categoryBorder },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/professionals/${professional.id}`)}
    >
      <View style={styles.photoWrap}>
        <ProfileImage
          name={professional.name}
          imageUrl={professional.imageUrl}
          fallbackColor={professional.avatarColor}
          fill
          faceCrop={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
          contentPosition="top"
        />
        <View style={styles.badgeWrap}>
          <Badge
            label={badge}
            variant={isSoon ? 'incoming' : 'available'}
            icon="time-outline"
            style={styles.badge}
          />
        </View>
      </View>
      <View style={styles.body}>
        <AppText style={styles.name} numberOfLines={1}>
          {professional.name}
        </AppText>
        <View style={styles.meta}>
          <Ionicons name="star" size={11} color={Colors.star} />
          <AppText style={styles.rating}>{professional.rating.toFixed(1)}</AppText>
          <AppText style={styles.reviews}>({professional.reviewCount})</AppText>
          <AppText style={styles.price}>· da {professional.pricePerHour}€/h</AppText>
        </View>
      </View>
      <CategoryTag
        label={professional.category}
        categorySlug={professional.categorySlug}
        overlay
        style={styles.categoryFooter}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: Design.homeCard.urgentWidth,
    height: Design.homeCard.urgentHeight,
    flexDirection: 'column',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.9,
  },
  photoWrap: {
    width: '100%',
    height: PHOTO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  badgeWrap: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 52,
  },
  categoryFooter: {
    alignSelf: 'stretch',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  reviews: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
