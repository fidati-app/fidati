import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { HomeOffer } from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface OfferCardProps {
  offer: HomeOffer;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <AppText style={styles.title}>{offer.title}</AppText>
      <AppText style={styles.highlight}>{offer.highlight}</AppText>
      <AppText style={styles.subtitle}>{offer.subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.9,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
  highlight: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
  },
});
