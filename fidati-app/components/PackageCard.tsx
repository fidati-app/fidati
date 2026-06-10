import { Pressable, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Spacing } from '@/constants/theme';
import { ServicePackage } from '@/types';
import { AppText } from './AppText';

interface PackageCardProps {
  pkg: ServicePackage;
  selected?: boolean;
  onPress: () => void;
}

export function PackageCard({ pkg, selected = false, onPress }: PackageCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        <AppText style={styles.title}>{pkg.title}</AppText>
        <AppText style={styles.description}>{pkg.description}</AppText>
        <AppText style={styles.duration}>Durata stimata: {pkg.duration}</AppText>
      </View>
      <AppText style={styles.price}>{pkg.price}€</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    padding: Design.spacing.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    ...Design.shadow,
  },
  selected: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
    backgroundColor: '#F0FDF9',
  },
  pressed: {
    opacity: 0.92,
  },
  left: {
    flex: 1,
    gap: 4,
    paddingRight: Spacing.md,
  },
  title: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  duration: {
    fontSize: Design.font.micro,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.5,
  },
});
