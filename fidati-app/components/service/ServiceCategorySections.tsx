import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import {
  CATEGORY_OFFERS,
  CATEGORY_SEARCH_PLACEHOLDERS,
  CATEGORY_SUB_SERVICES,
} from '@/constants/categoryServices';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Category, Professional } from '@/types';

import { ServiceCategoryOfferCard } from './ServiceCategoryOfferCard';
import { ServiceSubTypeTile } from './ServiceSubTypeTile';

interface ServiceCategorySectionsProps {
  category: Category;
  professionals: Professional[];
}

function CompactSectionTitle({ children }: { children: ReactNode }) {
  return <AppText style={styles.sectionTitle}>{children}</AppText>;
}

export function ServiceCategorySections({
  category,
  professionals,
}: ServiceCategorySectionsProps) {
  const subServices = CATEGORY_SUB_SERVICES[category.slug];
  const offers = CATEGORY_OFFERS[category.slug];
  const categoryLabel = category.name.toLowerCase();

  return (
    <View style={styles.root}>
      <SearchBar
        size="slim"
        placeholder={CATEGORY_SEARCH_PLACEHOLDERS[category.slug]}
        iconPosition="left"
        style={styles.search}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        bounces={false}
      >
        {subServices.map((service) => (
          <ServiceSubTypeTile
            key={service.id}
            service={service}
            categorySlug={category.slug}
          />
        ))}
      </ScrollView>

      <CompactSectionTitle>Offerte</CompactSectionTitle>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.offers}
        bounces={false}
      >
        {offers.map((offer) => (
          <ServiceCategoryOfferCard key={offer.id} offer={offer} />
        ))}
      </ScrollView>

      <View style={styles.listSection}>
        <SectionHeader
          title={`Professionisti ${categoryLabel}`}
          actionLabel="Ordina"
          onAction={() => {}}
          compact
        />
        <View style={styles.list}>
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              fullWidth
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 0,
  },
  search: {
    marginBottom: 6,
  },
  chips: {
    gap: 5,
    paddingRight: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: Design.font.caption,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 12,
  },
  offers: {
    gap: 8,
    paddingRight: 4,
  },
  listSection: {
    marginTop: 16,
  },
  list: {
    gap: 10,
    marginTop: 4,
  },
});
