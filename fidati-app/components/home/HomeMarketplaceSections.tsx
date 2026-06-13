import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { HomeOffer, HomeReview } from '@/constants/homeMarketplace';

import { useHomeFilteredSections } from '@/hooks/useHomeFilteredSections';
import { getNewVerifiedSectionTitle } from '@/services/homeZoneSections';

import { BookedServiceCard } from './BookedServiceCard';
import { CategoryProfessionalsSections } from './CategoryProfessionalsSections';
import { FidatiGuarantee } from './FidatiGuarantee';
import { FidatiGuaranteeTeaser } from './FidatiGuaranteeTeaser';
import { FidatiHowItWorks } from './FidatiHowItWorks';
import { HomeCarousel } from './HomeCarousel';
import { HomeSection } from './HomeSection';
import { HomeZoneEmptyState } from './HomeZoneEmptyState';
import { NewProRow } from './NewProRow';
import { OfferCard } from './OfferCard';
import { ReviewCard } from './ReviewCard';
import { ServiceAreasSections } from './ServiceAreasSections';
import { TopProCard } from './TopProCard';
import { UrgentProCard } from './UrgentProCard';

interface HomeEditorialSectionsProps {
  reviews: HomeReview[];
  offers: HomeOffer[];
  /** Mostra il blocco servizi casa/azienda (solo se ha senso in zona). */
  showServiceAreas?: boolean;
}

/** Sezioni fiducia/editoriali indipendenti dai professionisti in zona. */
function HomeEditorialSections({ reviews, offers, showServiceAreas = false }: HomeEditorialSectionsProps) {
  return (
    <>
      <FidatiGuaranteeTeaser />

      {showServiceAreas ? <ServiceAreasSections /> : null}

      {reviews.length > 0 ? (
        <HomeSection title="Ultime recensioni">
          <HomeCarousel gap={10}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </HomeCarousel>
        </HomeSection>
      ) : null}

      {offers.length > 0 ? (
        <HomeSection title="Offerte del momento">
          <HomeCarousel gap={10}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </HomeCarousel>
        </HomeSection>
      ) : null}

      <FidatiHowItWorks />
      <FidatiGuarantee />
    </>
  );
}

export function HomeMarketplaceSections() {
  const router = useRouter();

  const {
    filteredProfessionals,
    filteredPopularServices,
    filteredUrgentItems,
    filteredTopProfessionals,
    filteredNewProfessionals,
    hasSelectedCity,
    hasFilteredProfessionals,
    selectedCity,
    offers,
    reviews,
  } = useHomeFilteredSections();

  if (!hasSelectedCity) {
    return (
      <View style={styles.root}>
        <HomeZoneEmptyState variant="no-city" />
        <HomeEditorialSections reviews={reviews} offers={offers} showServiceAreas />
      </View>
    );
  }

  if (!hasFilteredProfessionals) {
    return (
      <View style={styles.root}>
        <HomeZoneEmptyState />
        <HomeEditorialSections reviews={reviews} offers={offers} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {filteredPopularServices.length > 0 ? (
        <HomeSection title="🔥 Servizi più prenotati questa settimana" first>
          <HomeCarousel gap={10}>
            {filteredPopularServices.map((service) => (
              <BookedServiceCard key={service.id} service={service} />
            ))}
          </HomeCarousel>
        </HomeSection>
      ) : null}

      {filteredUrgentItems.length > 0 ? (
        <HomeSection
          title="Interventi urgenti"
          actionLabel="Vedi tutti >"
          onAction={() => router.push('/(tabs)/categories')}
          highlight="urgent"
        >
          <HomeCarousel gap={10}>
            {filteredUrgentItems.map(({ professional, badge }) => (
              <UrgentProCard key={professional.id} professional={professional} badge={badge} />
            ))}
          </HomeCarousel>
        </HomeSection>
      ) : null}

      <CategoryProfessionalsSections filteredProfessionals={filteredProfessionals} />

      {filteredTopProfessionals.length > 0 ? (
        <HomeSection
          title="🏆 Top professionisti della settimana"
          actionLabel="Vedi tutti >"
          onAction={() => router.push('/(tabs)/categories')}
          highlight="top"
        >
          <HomeCarousel gap={10}>
            {filteredTopProfessionals.map((professional) => (
              <TopProCard key={professional.id} professional={professional} />
            ))}
          </HomeCarousel>
        </HomeSection>
      ) : null}

      {filteredNewProfessionals.length > 0 && selectedCity ? (
        <HomeSection
          title={getNewVerifiedSectionTitle(selectedCity)}
          actionLabel="Scopri"
        >
          <View style={styles.list}>
            {filteredNewProfessionals.map((professional) => (
              <NewProRow key={professional.id} professional={professional} />
            ))}
          </View>
        </HomeSection>
      ) : null}

      <HomeEditorialSections reviews={reviews} offers={offers} showServiceAreas />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 18,
  },
  list: {
    gap: 8,
  },
});
