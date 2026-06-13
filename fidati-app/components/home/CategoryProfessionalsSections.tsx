import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ProfessionalCard } from '@/components/ProfessionalCard';
import { CATEGORY_COLORS, getCategoryTintColors } from '@/constants/categoryColors';
import {
  getCategoryBrowseBadge,
  getCategoryBrowseSubtitle,
  getCategoryDetailPath,
  HOME_CAROUSEL_PREVIEW_LIMIT,
} from '@/constants/categoryCatalog';
import { Design } from '@/constants/design';
import { Colors } from '@/constants/colors';
import { useZoneAvailableCategories } from '@/hooks/useZoneAvailableCategories';
import { getTopProfessionalsByCategoryFromList } from '@/services/homeService';
import { Category, Professional } from '@/types';

import { CategoryBrowseCard } from './CategoryBrowseCard';
import { HomeCarousel } from './HomeCarousel';
import { HomeCategoriesExpandButton } from './HomeCategoriesExpandButton';
import { HomeSection } from './HomeSection';

interface CategoryProfessionalsSectionsProps {
  filteredProfessionals: Professional[];
}

interface CategorySectionBlockProps {
  category: Category;
  professionals: Professional[];
}

function CategorySectionBlock({ category, professionals }: CategorySectionBlockProps) {
  const router = useRouter();

  const categoryProfessionals = getTopProfessionalsByCategoryFromList(
    professionals,
    category.slug,
    HOME_CAROUSEL_PREVIEW_LIMIT,
  );

  if (categoryProfessionals.length === 0) return null;

  const totalInCategory = professionals.filter(
    (professional) => professional.categorySlug === category.slug,
  ).length;

  const accent = CATEGORY_COLORS[category.slug];
  const tint = getCategoryTintColors(category.slug);

  return (
    <HomeSection
      title={category.name}
      titleLeading={
        <View style={[styles.categoryIcon, { backgroundColor: tint.backgroundColor }]}>
          <Ionicons name={category.icon} size={16} color={accent} />
        </View>
      }
      actionLabel="Vedi tutti"
      onAction={() => router.push(getCategoryDetailPath(category.slug))}
    >
      <HomeCarousel gap={10}>
        {categoryProfessionals.map((professional) => (
          <View key={professional.id} style={styles.card}>
            <ProfessionalCard professional={professional} />
          </View>
        ))}
        <CategoryBrowseCard
          category={category}
          subtitle={getCategoryBrowseSubtitle(category)}
          badge={getCategoryBrowseBadge(category, categoryProfessionals.length, totalInCategory)}
          onPress={() => router.push(getCategoryDetailPath(category.slug))}
        />
      </HomeCarousel>
    </HomeSection>
  );
}

const HOME_CATEGORY_SECTION_FALLBACK_HEIGHT = 196;
const HOME_CATEGORY_PEEK_RATIO = 0.5;

interface CategorySectionPeekProps {
  category: Category;
  professionals: Professional[];
  peekHeight: number;
}

function CategorySectionPeek({ category, professionals, peekHeight }: CategorySectionPeekProps) {
  const fadeHeight = Math.min(52, Math.max(36, peekHeight * 0.42));

  return (
    <View style={styles.peekShell} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.peekClip, { maxHeight: peekHeight }]}>
        <CategorySectionBlock category={category} professionals={professionals} />
      </View>
      <LinearGradient
        colors={['rgba(248, 250, 252, 0)', 'rgba(248, 250, 252, 0.55)', Colors.background]}
        locations={[0, 0.45, 1]}
        style={[styles.peekFade, { height: fadeHeight }]}
        pointerEvents="none"
      />
    </View>
  );
}

export function CategoryProfessionalsSections({
  filteredProfessionals,
}: CategoryProfessionalsSectionsProps) {
  const {
    availablePrimaryCategories,
    availableSecondaryCategories,
  } = useZoneAvailableCategories();
  const [showAllHomeCategories, setShowAllHomeCategories] = useState(false);
  const [sectionHeight, setSectionHeight] = useState(0);

  const primaryCategories = availablePrimaryCategories;
  const extraCategories = availableSecondaryCategories;

  const peekCategory = extraCategories[0] ?? null;

  const peekHeight =
    (sectionHeight > 0 ? sectionHeight : HOME_CATEGORY_SECTION_FALLBACK_HEIGHT) *
    HOME_CATEGORY_PEEK_RATIO;

  const handleSectionLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && measuredHeight !== sectionHeight) {
      setSectionHeight(measuredHeight);
    }
  };

  const toggleCategories = () => setShowAllHomeCategories((prev) => !prev);

  return (
    <>
      {primaryCategories.map((category) => {
        const section = (
          <CategorySectionBlock category={category} professionals={filteredProfessionals} />
        );

        return (
          <View
            key={category.slug}
            onLayout={sectionHeight === 0 ? handleSectionLayout : undefined}
          >
            {section}
          </View>
        );
      })}

      {!showAllHomeCategories && peekCategory ? (
        <CategorySectionPeek
          category={peekCategory}
          professionals={filteredProfessionals}
          peekHeight={peekHeight}
        />
      ) : null}

      {!showAllHomeCategories && extraCategories.length > 0 ? (
        <HomeCategoriesExpandButton
          embedded
          expanded={false}
          extraCount={extraCategories.length}
          onPress={toggleCategories}
        />
      ) : null}

      {showAllHomeCategories
        ? extraCategories.map((category) => (
            <Animated.View
              key={category.slug}
              entering={FadeInDown.duration(280).springify().damping(22)}
            >
              <CategorySectionBlock category={category} professionals={filteredProfessionals} />
            </Animated.View>
          ))
        : null}

      {showAllHomeCategories && extraCategories.length > 0 ? (
        <HomeCategoriesExpandButton
          embedded
          expanded
          extraCount={extraCategories.length}
          onPress={toggleCategories}
        />
      ) : null}
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
  peekShell: {
    position: 'relative',
    overflow: 'hidden',
  },
  peekClip: {
    overflow: 'hidden',
  },
  peekFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
