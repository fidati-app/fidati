import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Category, Professional } from '@/types';

interface ServiceHeroStatsProps {
  category: Category;
  professionals: Professional[];
}

export function ServiceHeroStats({ category, professionals }: ServiceHeroStatsProps) {
  const avgRating =
    professionals.length > 0
      ? professionals.reduce((sum, p) => sum + p.rating, 0) / professionals.length
      : 0;
  const minPrice =
    professionals.length > 0
      ? Math.min(...professionals.map((p) => p.pricePerHour))
      : 0;

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Ionicons name="shield-checkmark-outline" size={11} color={Colors.accent} />
        <AppText style={styles.value}>{category.professionalCount}</AppText>
        <AppText style={styles.label}>verificati</AppText>
      </View>
      <View style={styles.pill}>
        <Ionicons name="star" size={11} color={Colors.star} />
        <AppText style={styles.value}>
          {avgRating > 0 ? avgRating.toFixed(1) : '—'}
        </AppText>
        <AppText style={styles.label}>media</AppText>
      </View>
      <View style={styles.pill}>
        <Ionicons name="pricetag-outline" size={11} color={Colors.accent} />
        <AppText style={styles.label}>da</AppText>
        <AppText style={styles.value}>{minPrice > 0 ? `${minPrice}€` : '—'}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
  },
});
