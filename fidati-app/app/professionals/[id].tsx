import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { ProfileImage } from '@/components/ProfileImage';
import { RatingStars } from '@/components/RatingStars';
import { ProfessionalBookingBar } from '@/components/professionals/ProfessionalBookingBar';
import { ProfessionalHeroCarousel } from '@/components/professionals/ProfessionalHeroCarousel';
import { ProfessionalServiceCard } from '@/components/professionals/ProfessionalServiceCard';
import { ServiceCategoryOfferCard } from '@/components/service/ServiceCategoryOfferCard';
import { Colors } from '@/constants/colors';
import {
  findServicePackage,
  getProfessionalServices,
} from '@/constants/professionalServices';
import { Design } from '@/constants/design';
import { Spacing } from '@/constants/theme';
import { useProfessional } from '@/hooks/useProfessionals';
import { getProfessionalGalleryImages } from '@/utils/professionalGallery';
import { getProfessionalOffers } from '@/utils/professionalOffers';

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const professional = useProfessional(id ?? '');
  const services = useMemo(
    () => (professional ? getProfessionalServices(professional.categorySlug) : []),
    [professional],
  );
  const galleryImages = useMemo(
    () => (professional ? getProfessionalGalleryImages(professional) : []),
    [professional],
  );
  const offers = useMemo(
    () => (professional ? getProfessionalOffers(professional) : []),
    [professional],
  );

  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  useEffect(() => {
    if (services.length > 0 && expandedServiceId === null) {
      setExpandedServiceId(services[0].id);
      setSelectedPackageId(services[0].packages[0]?.id ?? null);
    }
  }, [services, expandedServiceId]);

  if (!professional) {
    return (
      <View style={styles.notFound}>
        <AppText variant="subtitle">Professionista non trovato</AppText>
      </View>
    );
  }

  const activePackage =
    findServicePackage(professional.categorySlug, selectedPackageId ?? '') ??
    services[0]?.packages[0];

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleToggleService = (serviceId: string) => {
    if (expandedServiceId === serviceId) {
      setExpandedServiceId(null);
      return;
    }
    setExpandedServiceId(serviceId);
    const service = services.find((item) => item.id === serviceId);
    if (service?.packages[0]) {
      setSelectedPackageId(service.packages[0].id);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
      >
        <View style={styles.heroContainer}>
          <ProfessionalHeroCarousel images={galleryImages} />

          <View style={[styles.heroActions, { top: insets.top + 8 }]}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="heart-outline" size={20} color={Colors.white} />
            </Pressable>
          </View>

          {professional.verified && (
            <View style={styles.verifiedBadge}>
              <Badge label="Verificato" variant="verified" icon="checkmark-circle" />
            </View>
          )}
          <View style={styles.distanceBadge}>
            <Ionicons name="location-outline" size={11} color={Colors.textSecondary} />
            <AppText style={styles.distanceText}>
              {professional.distanceKm} km da te
            </AppText>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.nameRow}>
            <ProfileImage
              name={professional.name}
              imageUrl={professional.imageUrl}
              fallbackColor={professional.avatarColor}
              size={52}
              faceCrop={{ width: 52, height: 52 }}
              contentPosition="top"
            />
            <View style={styles.nameCopy}>
              <AppText style={styles.name}>{professional.name}</AppText>
              <AppText style={styles.category}>{professional.category}</AppText>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <RatingStars rating={professional.rating} size={13} />
              <AppText style={styles.statMeta} numberOfLines={1}>
                {professional.rating.toFixed(1)} · {professional.reviewCount} recensioni
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={[styles.statBlock, styles.statInline]}>
              <Ionicons name="briefcase-outline" size={13} color={Colors.textSecondary} />
              <AppText style={styles.jobsLine} numberOfLines={1}>
                {professional.jobsCompleted} lavori completati
              </AppText>
            </View>
          </View>

          <View style={styles.verificationRow}>
            {professional.badges.document && (
              <Badge label="Documento verificato" variant="verified" icon="document-text" />
            )}
            {professional.badges.phone && (
              <Badge label="Telefono verificato" variant="verified" icon="call" />
            )}
            {professional.badges.professional && (
              <Badge label="Professionista verificato" variant="verified" icon="ribbon" />
            )}
          </View>

          {offers.length > 0 ? (
            <>
              <AppText style={styles.sectionTitle}>Offerte attive</AppText>
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
            </>
          ) : null}

          <AppText style={styles.sectionTitle}>Perché sceglierlo</AppText>
          {professional.whyChoose.map((point) => (
            <View key={point} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
              <AppText style={styles.bulletText}>{point}</AppText>
            </View>
          ))}

          <AppText style={[styles.sectionTitle, styles.packagesTitle]}>
            Servizi e prezzi
          </AppText>
          {services.map((service) => (
            <ProfessionalServiceCard
              key={service.id}
              service={service}
              categorySlug={professional.categorySlug}
              expanded={expandedServiceId === service.id}
              selectedPackageId={selectedPackageId}
              onToggle={() => handleToggleService(service.id)}
              onSelectPackage={handleSelectPackage}
            />
          ))}
        </View>
      </ScrollView>

      <ProfessionalBookingBar
        professional={professional}
        selectedPackage={activePackage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  heroContainer: {
    position: 'relative',
  },
  heroActions: {
    position: 'absolute',
    left: Design.spacing.screen,
    right: Design.spacing.screen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(1,13,32,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 36,
    left: Design.spacing.screen,
    zIndex: 2,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 36,
    right: Design.spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 2,
  },
  distanceText: {
    fontSize: Design.font.micro,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sheet: {
    marginTop: -20,
    backgroundColor: Colors.card,
    borderTopLeftRadius: Design.radius.sheet,
    borderTopRightRadius: Design.radius.sheet,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 20,
    paddingBottom: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  nameCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  category: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  statInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  jobsLine: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    flexShrink: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
    flexShrink: 0,
  },
  verificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Design.font.display,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  offers: {
    gap: 8,
    paddingRight: 4,
    marginBottom: 20,
  },
  packagesTitle: {
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: Design.font.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
