import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getCategoryBorderColor } from '@/constants/categoryColors';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Professional } from '@/types';
import { AppText } from './AppText';
import { Badge } from './Badge';
import { CategoryTag } from './CategoryTag';
import { ProfileImage } from './ProfileImage';

interface ProfessionalCardProps {
  professional: Professional;
  fullWidth?: boolean;
}

export function ProfessionalCard({ professional, fullWidth }: ProfessionalCardProps) {
  const router = useRouter();
  const categoryBorder = getCategoryBorderColor(professional.categorySlug);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        fullWidth ? styles.cardFullWidth : styles.cardCarousel,
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
        />
        <CategoryTag
          label={professional.category}
          categorySlug={professional.categorySlug}
          overlay
          style={styles.photoTag}
        />
      </View>

      <View style={styles.content}>
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
            {professional.rating.toFixed(1)} ({professional.reviewCount}) ·{' '}
            {professional.distanceKm} km
          </AppText>
        </View>

        <View style={styles.availableSlot}>
          {professional.availableToday ? (
            <AppText style={styles.available}>Disponibile oggi</AppText>
          ) : null}
        </View>

        <AppText style={styles.price}>da {professional.pricePerHour}€/h</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: Design.homeCard.proHeight,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...Design.shadow,
  },
  cardCarousel: {
    width: Design.homeCard.proWidth,
  },
  cardFullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  media: {
    width: 84,
    height: '100%',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  photoTag: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    minHeight: 20,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
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
  availableSlot: {
    minHeight: 15,
    justifyContent: 'center',
  },
  available: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    lineHeight: 15,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
});
