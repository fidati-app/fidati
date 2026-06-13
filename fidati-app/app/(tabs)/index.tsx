import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { DataSourceBadge } from '@/components/debug/DataSourceBadge';
import { HomeCategoriesRail } from '@/components/HomeCategoriesRail';
import { HomeHero } from '@/components/HomeHero';
import { HomeMarketplaceSections } from '@/components/home/HomeMarketplaceSections';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useServiceZone } from '@/context/ServiceZoneContext';

export default function HomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { hasSelectedCity, totalInZone, registerHomeScrollToTop } = useServiceZone();

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useEffect(() => {
    registerHomeScrollToTop(scrollToTop);
    return () => registerHomeScrollToTop(null);
  }, [registerHomeScrollToTop, scrollToTop]);

  const showCategories = hasSelectedCity && totalInZone > 0;

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        ref={scrollRef}
        style={[styles.screen, Platform.OS === 'web' && styles.screenWeb]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <HomeHero />

        <View style={styles.body}>
          <DataSourceBadge />

          {showCategories ? (
            <>
              <SectionHeader
                title="Categorie"
                actionLabel="Vedi tutte"
                compact
                onAction={() => router.push('/(tabs)/categories')}
              />
              <HomeCategoriesRail />
            </>
          ) : null}

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
    paddingBottom: 32,
    flexGrow: 1,
  },
  body: {
    position: 'relative',
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 12,
  },
});
