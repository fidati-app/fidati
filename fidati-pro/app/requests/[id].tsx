import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { getRequestById } from '@/services/mockData';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const request = getRequestById(id ?? '');

  if (!request) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 12 }]}>
        <AppText style={styles.fallbackText}>Richiesta non trovata</AppText>
      </View>
    );
  }

  const isPending = request.status === 'pending';

  const handleAction = (action: 'accept' | 'decline') => {
    Alert.alert(
      action === 'accept' ? 'Richiesta accettata' : 'Richiesta rifiutata',
      'Azione simulata — il backend verrà collegato in seguito.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.navy} />
        </Pressable>
        <AppText style={styles.headerTitle}>Dettaglio richiesta</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
        <View style={[styles.hero, isPending && styles.heroPending]}>
          {isPending ? (
            <View style={styles.pendingBadge}>
              <AppText style={styles.pendingBadgeText}>In attesa</AppText>
            </View>
          ) : null}
          <AppText style={styles.price}>{request.price}€</AppText>
          <AppText style={styles.title}>{request.serviceTitle}</AppText>
          <AppText style={styles.client}>{request.clientName}</AppText>
        </View>

        <View style={styles.card}>
          <InfoRow icon="navigate-outline" label="Distanza" value={`${request.distanceKm} km da te`} />
          <InfoRow icon="location-outline" label="Zona" value={request.zone} />
          <InfoRow icon="map-outline" label="Indirizzo" value={request.address} />
          <InfoRow icon="calendar-outline" label="Data" value={request.date} />
          <InfoRow icon="time-outline" label="Orario" value={request.time} />
        </View>

        {request.note ? (
          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Nota del cliente</AppText>
            <AppText style={styles.note}>{request.note}</AppText>
          </View>
        ) : null}
      </ScrollView>

      {isPending ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <PrimaryButton title="Accetta richiesta" onPress={() => handleAction('accept')} />
          <PrimaryButton title="Rifiuta" variant="outline" onPress={() => handleAction('decline')} />
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={Colors.navy} />
      </View>
      <View style={styles.infoCopy}>
        <AppText style={styles.infoLabel}>{label}</AppText>
        <AppText style={styles.infoValue}>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: Colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: Colors.navy },
  spacer: { width: 36 },
  content: { padding: Design.spacing.screen, gap: 12 },
  hero: {
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 6,
    ...Design.shadow,
  },
  heroPending: { borderLeftWidth: 4, borderLeftColor: Colors.pending },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.pendingSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
    marginBottom: 4,
  },
  pendingBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.pending, textTransform: 'uppercase' },
  price: { fontSize: 32, fontWeight: '800', color: Colors.navy, letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.navy, lineHeight: 26 },
  client: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    ...Design.shadowSoft,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: Colors.navy, textTransform: 'uppercase' },
  note: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  infoRow: { flexDirection: 'row', gap: 10 },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.navy, lineHeight: 20 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
});
