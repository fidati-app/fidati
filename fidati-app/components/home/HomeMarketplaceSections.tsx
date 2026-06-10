import { StyleSheet, View } from 'react-native';

import {
  HOME_OFFERS,
  HOME_REVIEWS,
  NEW_PROFESSIONAL_IDS,
  POPULAR_SERVICES,
  URGENT_PROFESSIONALS,
} from '@/constants/homeMarketplace';
import { getProfessionalById, MOCK_PROFESSIONALS } from '@/services/mockData';

import { BookedServiceCard } from './BookedServiceCard';
import { CategoryProfessionalsSections } from './CategoryProfessionalsSections';
import { FidatiGuarantee } from './FidatiGuarantee';
import { FidatiGuaranteeTeaser } from './FidatiGuaranteeTeaser';
import { FidatiHowItWorks } from './FidatiHowItWorks';
import { HomeCarousel } from './HomeCarousel';
import { HomeSection } from './HomeSection';
import { NewProRow } from './NewProRow';
import { OfferCard } from './OfferCard';
import { ReviewCard } from './ReviewCard';
import { ServiceAreasSections } from './ServiceAreasSections';
import { TopProCard } from './TopProCard';
import { UrgentProCard } from './UrgentProCard';

const topProfessionals = [...MOCK_PROFESSIONALS]
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 4);

const newProfessionals = NEW_PROFESSIONAL_IDS.map((id) => getProfessionalById(id)).filter(
  Boolean,
) as NonNullable<ReturnType<typeof getProfessionalById>>[];

export function HomeMarketplaceSections() {
  const urgentItems = URGENT_PROFESSIONALS.map((item) => {
    const professional = getProfessionalById(item.professionalId);
    return professional ? { professional, badge: item.badge } : null;
  }).filter(Boolean) as { professional: NonNullable<ReturnType<typeof getProfessionalById>>; badge: string }[];

  return (
    <View style={styles.root}>
      <HomeSection title="🔥 Servizi più prenotati questa settimana" first>
        <HomeCarousel gap={10}>
          {POPULAR_SERVICES.map((service) => (
            <BookedServiceCard key={service.id} service={service} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <HomeSection title="Interventi urgenti" actionLabel="Vedi tutti" highlight="urgent">
        <HomeCarousel gap={10}>
          {urgentItems.map(({ professional, badge }) => (
            <UrgentProCard key={professional.id} professional={professional} badge={badge} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <CategoryProfessionalsSections />

      <HomeSection title="🏆 Top professionisti della settimana" actionLabel="Vedi tutti" highlight="top">
        <HomeCarousel gap={10}>
          {topProfessionals.map((professional) => (
            <TopProCard key={professional.id} professional={professional} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <HomeSection title="Nuovi professionisti verificati" actionLabel="Scopri">
        <View style={styles.list}>
          {newProfessionals.map((professional) => (
            <NewProRow key={professional.id} professional={professional} />
          ))}
        </View>
      </HomeSection>

      <FidatiGuaranteeTeaser />

      <ServiceAreasSections />

      <HomeSection title="Ultime recensioni">
        <HomeCarousel gap={10}>
          {HOME_REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <HomeSection title="Offerte del momento">
        <HomeCarousel gap={10}>
          {HOME_OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <FidatiHowItWorks />
      <FidatiGuarantee />
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
