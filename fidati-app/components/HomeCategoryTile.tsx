import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Category } from '@/types';
import { AppText } from './AppText';

interface HomeCategoryTileProps {
  category: Category;
}

export function HomeCategoryTile({ category }: HomeCategoryTileProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      onPress={() => router.push(`/service/${category.slug}`)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={category.icon} size={20} color={Colors.accent} />
      </View>
      <AppText style={styles.name} numberOfLines={1}>
        {category.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 88,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
