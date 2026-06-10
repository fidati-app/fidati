import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface RatingStarsProps {
  rating: number;
  size?: number;
}

export function RatingStars({ rating, size = 16 }: RatingStarsProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={rating >= star ? 'star' : rating >= star - 0.5 ? 'star-half' : 'star-outline'}
          size={size}
          color={Colors.star}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
  },
});
