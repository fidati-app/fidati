import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PopularService } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface BookedServiceCardProps {
  service: PopularService;
}

const CARD_WIDTH = 272;
const CARD_HEIGHT = 118;
const IMAGE_WIDTH = 96;

export function BookedServiceCard({ service }: BookedServiceCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/service/${service.slug}`)}
    >
      <Image source={{ uri: service.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <AppText style={styles.title} numberOfLines={2}>
          {service.title}
        </AppText>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <AppText style={styles.rating}>{service.rating.toFixed(1)}</AppText>
        </View>
        <AppText style={styles.jobs} numberOfLines={1}>
          {service.completedJobs.toLocaleString('it-IT')} interventi
        </AppText>
        <AppText style={styles.price}>da {service.avgPrice}€</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: IMAGE_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.border,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.25,
    lineHeight: 17,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 15,
  },
  jobs: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 14,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.2,
    lineHeight: 16,
    marginTop: 4,
  },
});
