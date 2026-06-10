import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CategoryOffer } from '@/constants/categoryServices';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ServiceCategoryOfferCardProps {
  offer: CategoryOffer;
}

export function ServiceCategoryOfferCard({ offer }: ServiceCategoryOfferCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <AppText style={styles.highlight}>{offer.highlight}</AppText>
        <AppText style={styles.title} numberOfLines={1}>
          {offer.title}
        </AppText>
      </View>
      <AppText style={styles.subtitle} numberOfLines={1}>
        {offer.subtitle}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  highlight: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.4,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
});
