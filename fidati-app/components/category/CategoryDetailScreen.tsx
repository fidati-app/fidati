import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryZoneEmptyState } from '@/components/category/CategoryZoneEmptyState';
import { AppText } from '@/components/AppText';
import { ServiceCategoryHero } from '@/components/service/ServiceCategoryHero';
import { ServiceCategorySections } from '@/components/service/ServiceCategorySections';
import { resolveCategorySlug } from '@/constants/categoryCatalog';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryZoneProfessionals } from '@/hooks/useCategoryZoneProfessionals';
import { CategorySlug } from '@/types';

export default function CategoryDetailScreen() {
  const { slug: rawSlug } = useLocalSearchParams<{ slug: string }>();
  const slug = resolveCategorySlug(rawSlug) as CategorySlug;
  const categories = useCategories();
  const category = categories.find((item) => item.slug === slug);
  const { categoryProfessionals, selectedCity, hasSelectedCity, openCityPicker, openChangeZone } =
    useCategoryZoneProfessionals(slug);

  if (!category) {
    return (
      <View style={styles.notFound}>
        <AppText variant="subtitle">Categoria non trovata</AppText>
      </View>
    );
  }

  const zoneTitle = selectedCity ? `${category.name} a ${selectedCity}` : category.name;

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
        <ServiceCategoryHero
          category={category}
          professionals={hasSelectedCity ? categoryProfessionals : []}
          title={zoneTitle}
        />

        <View style={styles.sheet}>
          <ServiceCategorySections
            category={category}
            professionals={categoryProfessionals}
            emptyState={
              !hasSelectedCity ? (
                <CategoryZoneEmptyState
                  variant="no-city"
                  onChangeZone={() => openCityPicker({ required: true })}
                />
              ) : (
                <CategoryZoneEmptyState onChangeZone={() => openChangeZone()} />
              )
            }
          />
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
