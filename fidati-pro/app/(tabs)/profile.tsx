import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PortfolioShowcase } from '@/components/profile/PortfolioShowcase';
import { ProfileBlock, ProfileRow, ReviewCard } from '@/components/profile/ProfileSections';
import { ProfileStatsBar } from '@/components/profile/ProfileStatsBar';
import { Screen } from '@/components/Screen';
import { VerifiedBadge } from '@/components/ui/ProScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { myProfessionalToProProfile } from '@/services/professionalsMeService';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const SETTINGS = [
  { icon: 'construct-outline' as const, label: 'Servizi e prezzi', route: '/profile/services' },
  { icon: 'map-outline' as const, label: 'Zone servite', route: '/profile/zones' },
  { icon: 'wallet-outline' as const, label: 'Guadagni e fatture', route: '/profile/earnings' },
  { icon: 'notifications-outline' as const, label: 'Notifiche', route: '/profile/notifications' },
  { icon: 'settings-outline' as const, label: 'Impostazioni account', route: '/profile/settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const { profile: myProfessional } = useMyProfessionalProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!myProfessional) {
    return null;
  }

  const profile = myProfessionalToProProfile(myProfessional);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    router.replace('/login');
  };

  const displayEmail = user?.email ?? profile.email;

  return (
    <Screen padded={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{profile.name.charAt(0)}</AppText>
        </View>
        <AppText style={styles.name}>{profile.name}</AppText>
        <AppText style={styles.category}>{profile.category}</AppText>
        <View style={styles.heroMeta}>
          <VerifiedBadge verified={profile.verified} />
        </View>
      </View>

      <ProfileStatsBar stats={profile.stats} memberSince={profile.memberSince} />

      <View style={styles.body}>
        <ProfileBlock title="Descrizione">
          <AppText style={styles.bio}>{profile.bio}</AppText>
        </ProfileBlock>

        <ProfileBlock title="Servizi offerti">
          {profile.services.map((service, index) => (
            <View
              key={service.id}
              style={[styles.serviceRow, index > 0 && styles.serviceBorder]}
            >
              <View style={styles.serviceCopy}>
                <AppText style={styles.serviceTitle}>{service.title}</AppText>
                <AppText style={styles.serviceDuration}>{service.duration}</AppText>
              </View>
              <AppText style={styles.servicePrice}>da {service.priceFrom}€</AppText>
            </View>
          ))}
        </ProfileBlock>

        <ProfileBlock title="Zone servite">
          <View style={styles.zones}>
            {profile.baseCity ? (
              <View style={styles.zonePill}>
                <Ionicons name="business-outline" size={12} color={Colors.navy} />
                <AppText style={styles.zoneText}>Base: {profile.baseCity}</AppText>
              </View>
            ) : null}
            {profile.serviceZones.map((zone) => (
              <View key={zone} style={styles.zonePill}>
                <Ionicons name="location-outline" size={12} color={Colors.navy} />
                <AppText style={styles.zoneText}>{zone}</AppText>
              </View>
            ))}
          </View>
        </ProfileBlock>

        <ProfileBlock title="Portfolio lavori">
          {profile.portfolio.length > 0 ? (
            <PortfolioShowcase items={profile.portfolio} />
          ) : (
            <AppText style={styles.bio}>Nessun lavoro in portfolio per ora.</AppText>
          )}
        </ProfileBlock>

        <ProfileBlock title="Recensioni">
          {profile.reviews.length > 0 ? (
            profile.reviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))
          ) : (
            <AppText style={styles.bio}>Nessuna recensione ancora disponibile.</AppText>
          )}
        </ProfileBlock>

        <ProfileBlock title="Contatti">
          <ProfileRow icon="mail-outline" label="Email" value={displayEmail} />
          <ProfileRow icon="call-outline" label="Telefono" value={profile.phone} />
        </ProfileBlock>

        <View style={styles.menu}>
          {SETTINGS.map((item, index) => (
            <Pressable
              key={item.label}
              style={[styles.menuItem, index < SETTINGS.length - 1 && styles.menuBorder]}
              onPress={() => router.push(item.route as '/profile/services')}
            >
              <Ionicons name={item.icon} size={18} color={Colors.navy} />
              <AppText style={styles.menuLabel}>{item.label}</AppText>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.logout, isSigningOut && styles.logoutDisabled]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <AppText style={styles.logoutText}>{isSigningOut ? 'Uscita…' : 'Esci'}</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.navy,
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: Design.spacing.screen,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 3,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: Colors.white },
  name: { fontSize: 22, fontWeight: '700', color: Colors.white },
  category: { fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 4, textAlign: 'center' },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 24,
    gap: 14,
  },
  bio: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  serviceBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
    marginTop: 8,
  },
  serviceCopy: { flex: 1, gap: 2 },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  serviceDuration: { fontSize: 11, color: Colors.textMuted },
  servicePrice: { fontSize: 14, fontWeight: '800', color: Colors.navy },
  zones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Design.radius.full,
  },
  zoneText: { fontSize: 12, fontWeight: '600', color: Colors.navy },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.navy },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    backgroundColor: Colors.card,
  },
  logoutDisabled: {
    opacity: 0.6,
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: Colors.error },
});
