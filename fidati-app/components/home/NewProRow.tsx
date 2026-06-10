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

interface NewProRowProps {
  professional: Professional;
}

const PHOTO_WIDTH = 84;
const PHOTO_MIN_HEIGHT = 76;

export function NewProRow({ professional }: NewProRowProps) {
  const router = useRouter();
  const categoryBorder = getCategoryBorderColor(professional.categorySlug);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
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
          faceCrop={{ width: PHOTO_WIDTH, height: PHOTO_MIN_HEIGHT }}
          contentPosition="top"
        />
        <CategoryTag
          label={professional.category}
          categorySlug={professional.categorySlug}
          overlay
          style={styles.photoTag}
        />
      </View>

      <View style={styles.content}>
        <AppText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {professional.name}
        </AppText>

        <View style={styles.metaRow}>
          <AppText style={styles.newLabel}>Nuovo</AppText>
          <AppText style={styles.metaDot}>·</AppText>
          <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
          <AppText style={styles.metaText}>{professional.distanceKm} km</AppText>
          <AppText style={styles.metaDot}>·</AppText>
          <AppText style={styles.price}>da {professional.pricePerHour}€/h</AppText>
        </View>
      </View>

      <View style={styles.trailing}>
        {professional.verified && (
          <Badge
            variant="verified"
            icon="checkmark-circle"
            iconOnly
            iconSize={16}
            style={styles.verifiedBadge}
          />
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: PHOTO_MIN_HEIGHT,
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.92,
  },
  photoWrap: {
    width: PHOTO_WIDTH,
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
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 4,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    flexWrap: 'wrap',
  },
  newLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingRight: 12,
    flexShrink: 0,
  },
  verifiedBadge: {
    width: 26,
    height: 26,
  },
});
