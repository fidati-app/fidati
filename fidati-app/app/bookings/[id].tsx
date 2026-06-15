import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfileImage } from '@/components/ProfileImage';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfessional } from '@/hooks/useProfessionals';
import { getBookingById } from '@/services/mockData';
import { BookingStatus } from '@/types';

const STATUS_META: Record<
  BookingStatus,
  { label: string; variant: 'confirmed' | 'incoming' | 'completed' | 'neutral'; tint: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  confirmed: {
    label: 'Confermata',
    variant: 'confirmed',
    tint: 'rgba(16, 185, 129, 0.1)',
    icon: 'checkmark-circle-outline',
  },
  incoming: {
    label: 'In arrivo',
    variant: 'incoming',
    tint: 'rgba(37, 99, 235, 0.1)',
    icon: 'navigate-outline',
  },
  completed: {
    label: 'Completata',
    variant: 'completed',
    tint: 'rgba(100, 116, 139, 0.12)',
    icon: 'ribbon-outline',
  },
  cancelled: {
    label: 'Annullata',
    variant: 'neutral',
    tint: 'rgba(100, 116, 139, 0.12)',
    icon: 'close-circle-outline',
  },
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={Colors.accent} />
      </View>
      <View style={styles.detailCopy}>
        <AppText style={styles.detailLabel}>{label}</AppText>
        <AppText style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const booking = getBookingById(id ?? '');
  const { professional } = useProfessional(booking?.professionalId ?? '');

  if (!booking) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 12 }]}>
        <AppText style={styles.fallbackText}>Prenotazione non trovata</AppText>
      </View>
    );
  }

  const status = STATUS_META[booking.status];
  const isActive = booking.status === 'confirmed' || booking.status === 'incoming';

  const handleReportProfessional = () => {
    Alert.alert(
      'Segnala professionista',
      `Vuoi segnalare ${booking.professionalName}? Il team Fidati esaminerà la segnalazione entro 24 ore.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Segnala',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Segnalazione inviata',
              'Grazie. Ti contatteremo se avremo bisogno di altre informazioni.',
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/bookings');
            }
          }}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </Pressable>
        <AppText style={styles.headerTitle}>Dettaglio prenotazione</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 130 }]}
      >
        <View style={[styles.statusHero, { backgroundColor: status.tint }]}>
          <Badge label={status.label} variant={status.variant} icon={status.icon} />
          <View style={styles.priceBlock}>
            <AppText style={styles.priceLabel}>Prezzo pagato</AppText>
            <AppText style={styles.statusPrice}>{booking.price}€</AppText>
          </View>
          <AppText style={styles.serviceTitle}>{booking.serviceTitle}</AppText>
          <AppText style={styles.serviceCategory}>{booking.category}</AppText>
        </View>

        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Professionista</AppText>
          <Pressable
            onPress={() => router.push(`/professionals/${booking.professionalId}`)}
            style={({ pressed }) => [styles.proRow, pressed && styles.proRowPressed]}
          >
            <ProfileImage
              name={booking.professionalName}
              imageUrl={booking.professionalImageUrl}
              fallbackColor={professional?.avatarColor}
              size={52}
              shape="circle"
            />
            <View style={styles.proCopy}>
              <AppText style={styles.proName}>{booking.professionalName}</AppText>
              <AppText style={styles.proMeta}>
                {professional?.rating.toFixed(1) ?? '—'} · {professional?.reviewCount ?? 0} recensioni
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <AppText style={styles.cardTitle}>Quando e dove</AppText>
          <DetailRow icon="calendar-outline" label="Data" value={booking.date} />
          <DetailRow icon="time-outline" label="Orario" value={booking.time} />
          {booking.address ? (
            <DetailRow icon="location-outline" label="Indirizzo" value={booking.address} />
          ) : null}
        </View>

        {booking.note ? (
          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Note per il professionista</AppText>
            <AppText style={styles.noteText}>{booking.note}</AppText>
          </View>
        ) : null}

        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.accent} />
          <View style={styles.guaranteeCopy}>
            <AppText style={styles.guaranteeTitle}>Coperta da Garanzia Fidati</AppText>
            <AppText style={styles.guaranteeText}>
              Pagamento protetto e assistenza dedicata per ogni prenotazione.
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={handleReportProfessional}
          style={({ pressed }) => [styles.reportBtn, pressed && styles.reportBtnPressed]}
        >
          <Ionicons name="flag-outline" size={16} color={Colors.error} />
          <AppText style={styles.reportText}>Segnala professionista</AppText>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {isActive ? (
          <>
            <PrimaryButton
              title="Apri chat"
              onPress={() => router.push(`/messages/${booking.professionalId}`)}
              style={styles.footerBtn}
            />
            <PrimaryButton
              title="Vedi professionista"
              variant="outline"
              onPress={() => router.push(`/professionals/${booking.professionalId}`)}
              style={styles.footerBtn}
            />
          </>
        ) : (
          <PrimaryButton
            title="Prenota di nuovo"
            onPress={() => router.push(`/professionals/${booking.professionalId}`)}
            style={styles.footerBtnFull}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  fallbackText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    ...Design.shadow,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: 14,
    gap: 12,
  },
  statusHero: {
    borderRadius: Design.radius.card,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceBlock: {
    alignSelf: 'flex-start',
    gap: 2,
    paddingTop: 2,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
  statusPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
    lineHeight: 32,
    includeFontPadding: false,
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  serviceCategory: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Design.shadow,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proRowPressed: {
    opacity: 0.85,
  },
  proCopy: {
    flex: 1,
    gap: 2,
  },
  proName: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.primary,
  },
  proMeta: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 21,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: Design.radius.card,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
  },
  guaranteeCopy: {
    flex: 1,
    gap: 2,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  guaranteeText: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: Design.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    backgroundColor: Colors.card,
  },
  reportBtnPressed: {
    opacity: 0.85,
  },
  reportText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    gap: 8,
    ...Design.shadow,
  },
  footerBtn: {
    width: '100%',
  },
  footerBtnFull: {
    width: '100%',
  },
});
