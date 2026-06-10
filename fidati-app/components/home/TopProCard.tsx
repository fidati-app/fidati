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

interface TopProCardProps {
  professional: Professional;
}

const CARD_WIDTH = 220;
const PHOTO_HEIGHT = 128;

export function TopProCard({ professional }: TopProCardProps) {
  const router = useRouter();
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
      <View style={styles.media}>
        <ProfileImage
          name={professional.name}
          imageUrl={professional.imageUrl}
          fallbackColor={professional.avatarColor}
          fill
          faceCrop={{ width: CARD_WIDTH, height: PHOTO_HEIGHT }}
          contentPosition="top"
        />
        <View style={styles.topBadge}>
          <Ionicons name="trophy-outline" size={11} color={Colors.white} />
          <AppText style={styles.topBadgeText}>Top</AppText>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <AppText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {professional.name}
          </AppText>
          {professional.verified && (
            <Badge variant="verified" icon="checkmark-circle" iconOnly />
          )}
        </View>

        <View style={styles.trustRow}>
          <Ionicons name="star" size={11} color={Colors.star} />
          <AppText style={styles.trustText} numberOfLines={1} ellipsizeMode="tail">
            {professional.rating.toFixed(1)} · {professional.reviewCount} recensioni ·{' '}
            {professional.jobsCompleted} lavori
          </AppText>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.distanceWrap}>
            <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
            <AppText style={styles.distance}>{professional.distanceKm} km</AppText>
          </View>
          <AppText style={styles.price}>da {professional.pricePerHour}€/h</AppText>
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
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.92,
  },
  media: {
    height: PHOTO_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  topBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  trustText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  distanceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  distance: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    flexShrink: 0,
  },
  categoryFooter: {
    alignSelf: 'stretch',
  },
});
