import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { HomeReview } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ReviewCardProps {
  review: HomeReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < Math.floor(review.rating) ? 'star' : 'star-outline'}
            size={12}
            color={Colors.star}
          />
        ))}
      </View>
      <AppText style={styles.text}>"{review.text}"</AppText>
      <AppText style={styles.client}>{review.clientName}</AppText>
      <AppText style={styles.service}>{review.service}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
    ...Design.shadow,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  client: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  service: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
