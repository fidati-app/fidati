import { StyleSheet, View } from 'react-native';

import { useHomeMarketplace } from '@/hooks/useHomeMarketplace';

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

export function HomeMarketplaceSections() {
  const {
    popularServices,
    offers,
    reviews,
    topProfessionals,
    urgentItems,
    newProfessionals,
    professionals,
  } = useHomeMarketplace();

  return (
    <View style={styles.root}>
      <HomeSection title="🔥 Servizi più prenotati questa settimana" first>
        <HomeCarousel gap={10}>
          {popularServices.map((service) => (
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

      <CategoryProfessionalsSections professionals={professionals} />

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
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </HomeCarousel>
      </HomeSection>

      <HomeSection title="Offerte del momento">
        <HomeCarousel gap={10}>
          {offers.map((offer) => (
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
