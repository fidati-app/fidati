import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { HomeCategoriesRail } from '@/components/HomeCategoriesRail';
import { HomeHero } from '@/components/HomeHero';
import { HomeMarketplaceSections } from '@/components/home/HomeMarketplaceSections';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={[styles.screen, Platform.OS === 'web' && styles.screenWeb]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <HomeHero />

        <View style={styles.body}>
          <SectionHeader
            title="Categorie"
            actionLabel="Vedi tutte"
            compact
            onAction={() => router.push('/(tabs)/categories')}
          />

          <HomeCategoriesRail />

          <HomeMarketplaceSections />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenWeb: {
    overscrollBehavior: 'none',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
  },
});
