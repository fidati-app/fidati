import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProfessionalCard } from '@/components/ProfessionalCard';
import { CATEGORIES } from '@/constants/categories';
import { CATEGORY_COLORS, getCategoryTintColors } from '@/constants/categoryColors';
import { Design } from '@/constants/design';
import { getTopProfessionalsByCategory } from '@/services/mockData';

import { HomeCarousel } from './HomeCarousel';
import { HomeSection } from './HomeSection';

export function CategoryProfessionalsSections() {
  const router = useRouter();

  return (
    <>
      {CATEGORIES.map((category) => {
        const professionals = getTopProfessionalsByCategory(category.slug, 3);
        if (professionals.length === 0) return null;

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
              {professionals.map((professional) => (
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
