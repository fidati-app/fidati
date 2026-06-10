import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfessionalCard } from '@/components/ProfessionalCard';
import { CATEGORY_COLORS, getCategoryTintColors } from '@/constants/categoryColors';
import { Design } from '@/constants/design';
import { useCategories } from '@/hooks/useCategories';
import { getTopProfessionalsByCategoryFromList } from '@/services/homeService';
import { Professional } from '@/types';

import { HomeCarousel } from './HomeCarousel';
import { HomeSection } from './HomeSection';

interface CategoryProfessionalsSectionsProps {
  professionals: Professional[];
}

export function CategoryProfessionalsSections({ professionals }: CategoryProfessionalsSectionsProps) {
  const router = useRouter();
  const categories = useCategories();

  return (
    <>
      {categories.map((category) => {
        const categoryProfessionals = getTopProfessionalsByCategoryFromList(
          professionals,
          category.slug,
          3,
        );
        if (categoryProfessionals.length === 0) return null;

        const accent = CATEGORY_COLORS[category.slug];
        const tint = getCategoryTintColors(category.slug);

        return (
          <HomeSection
            key={category.slug}
            title={category.name}
            titleLeading={
              <View style={[styles.categoryIcon, { backgroundColor: tint.backgroundColor }]}>
                <Ionicons name={category.icon} size={16} color={accent} />
              </View>
            }
            actionLabel="Vedi tutti"
            onAction={() => router.push(`/service/${category.slug}`)}
          >
            <HomeCarousel gap={10}>
              {categoryProfessionals.map((professional) => (
                <View key={professional.id} style={styles.card}>
                  <ProfessionalCard professional={professional} />
                </View>
              ))}
            </HomeCarousel>
          </HomeSection>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: Design.homeCard.proWidth,
    height: Design.homeCard.proHeight,
  },
});
