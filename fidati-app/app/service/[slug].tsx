import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ServiceCategoryHero } from '@/components/service/ServiceCategoryHero';
import { ServiceCategorySections } from '@/components/service/ServiceCategorySections';
import { CATEGORIES } from '@/constants/categories';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfessionalsByCategory } from '@/hooks/useProfessionals';

export default function ServiceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);
  const professionals = useProfessionalsByCategory(slug ?? '');

  if (!category) {
    return (
      <View style={styles.notFound}>
        <AppText variant="subtitle">Categoria non trovata</AppText>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <ServiceCategoryHero category={category} professionals={professionals} />

        <View style={styles.sheet}>
          <ServiceCategorySections category={category} professionals={professionals} />
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
  content: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  sheet: {
    marginTop: -20,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Design.radius.sheet,
    borderTopRightRadius: Design.radius.sheet,
    paddingTop: 14,
    paddingHorizontal: Design.spacing.screen,
  },
});
