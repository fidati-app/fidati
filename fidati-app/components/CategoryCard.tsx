import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Category } from '@/types';
import { AppText } from './AppText';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/service/${category.slug}`)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={category.icon} size={24} color={Colors.accent} />
      </View>
      <View style={styles.textBlock}>
        <AppText style={styles.name}>{category.name}</AppText>
        <AppText style={styles.count}>
          {category.professionalCount} professionisti
        </AppText>
      </View>
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
    gap: 14,
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.text,
  },
  count: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
  },
});
