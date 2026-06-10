import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { CategoriesHero } from '@/components/categories/CategoriesHero';
import { CategoryImageCard } from '@/components/categories/CategoryImageCard';
import { CATEGORIES } from '@/constants/categories';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export default function CategoriesScreen() {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <CategoriesHero />

        <View style={styles.body}>
          {CATEGORIES.map((category) => (
            <CategoryImageCard key={category.id} category={category} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' ? { overscrollBehavior: 'none' as const } : null),
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 20,
    gap: 14,
  },
});
