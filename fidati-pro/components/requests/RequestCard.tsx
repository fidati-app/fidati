import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { formatMinutesAgo, formatResponseCountdown } from '@/services/mockData';
import { ProRequest } from '@/types';

interface RequestCardProps {
  request: ProRequest;
  onPress?: () => void;
  compact?: boolean;
}

export function RequestCard({ request, onPress, compact = false }: RequestCardProps) {
  const isPending = request.status === 'pending';
  const isUrgent = isPending && request.responseDeadlineMinutes > 0 && request.responseDeadlineMinutes <= 30;

  const handleAction = (action: 'accept' | 'decline') => {
    Alert.alert(
      action === 'accept' ? 'Richiesta accettata' : 'Richiesta rifiutata',
      'Azione simulata — il backend verrà collegato in seguito.',
    );
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {isPending ? <View style={[styles.pendingStripe, isUrgent && styles.urgentStripe]} /> : null}

      {isPending ? (
        <View style={styles.urgencyRow}>
          <View style={styles.newBadge}>
            <Ionicons name="flash" size={11} color={Colors.pending} />
            <AppText style={styles.newBadgeText}>
              Nuova · {formatMinutesAgo(request.minutesAgo)}
            </AppText>
          </View>
          {request.responseDeadlineMinutes > 0 ? (
            <View style={[styles.countdownBadge, isUrgent && styles.countdownUrgent]}>
              <Ionicons
                name="timer-outline"
                size={12}
                color={isUrgent ? Colors.white : Colors.pending}
              />
              <AppText style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
                {formatResponseCountdown(request.responseDeadlineMinutes)}
              </AppText>
            </View>
          ) : (
            <View style={styles.expiredBadge}>
              <AppText style={styles.expiredText}>Scaduto</AppText>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.topRow}>
        <View style={styles.serviceCopy}>
          <AppText style={styles.service} numberOfLines={2}>
            {request.serviceTitle}
          </AppText>
          <View style={styles.clientRow}>
            <AppText style={styles.client}>{request.clientName}</AppText>
            {request.clientVerified ? (
              <View style={styles.verifiedChip}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                <AppText style={styles.verifiedText}>Verificato</AppText>
              </View>
            ) : null}
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={11} color={Colors.star} />
              <AppText style={styles.ratingText}>{request.clientRating.toFixed(1)}</AppText>
            </View>
          </View>
        </View>
        <View style={styles.priceCol}>
          <AppText style={styles.price}>{request.price}€</AppText>
          {isPending ? (
            <View style={styles.pendingPill}>
              <AppText style={styles.pendingPillText}>In attesa</AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.metaGrid}>
        <MetaChip icon="navigate-outline" label={`${request.distanceKm} km`} />
        <MetaChip icon="location-outline" label={request.zone} />
        <MetaChip icon="time-outline" label={`${request.date} · ${request.time}`} />
      </View>

      {request.onlinePaymentAvailable ? (
        <View style={styles.paymentBadge}>
          <Ionicons name="card-outline" size={13} color={Colors.success} />
          <AppText style={styles.paymentText}>Pagamento online disponibile</AppText>
        </View>
      ) : null}

      {!compact && isPending ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.declineBtn]}
            onPress={() => handleAction('decline')}
          >
            <AppText style={styles.declineText}>Rifiuta</AppText>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleAction('accept')}
          >
            <AppText style={styles.acceptText}>Accetta</AppText>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={13} color={Colors.textSecondary} />
      <AppText style={styles.chipText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    ...Design.shadow,
  },
  pressed: { opacity: 0.96 },
  pendingStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.pending,
  },
  urgentStripe: { backgroundColor: Colors.error },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.pendingSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.pending,
    textTransform: 'uppercase',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.pendingSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
  },
  countdownUrgent: { backgroundColor: Colors.error },
  countdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.pending,
    fontVariant: ['tabular-nums'],
  },
  countdownTextUrgent: { color: Colors.white },
  expiredBadge: {
    backgroundColor: Colors.errorSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Design.radius.full,
  },
  expiredText: { fontSize: 10, fontWeight: '800', color: Colors.error },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  serviceCopy: { flex: 1, gap: 6 },
  service: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.navy,
    lineHeight: 23,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  client: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: Colors.success },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 10, fontWeight: '700', color: Colors.navy },
  priceCol: { alignItems: 'flex-end', gap: 6 },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  pendingPill: {
    backgroundColor: Colors.pendingSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Design.radius.full,
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.pending,
    textTransform: 'uppercase',
  },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Design.radius.full,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: Design.font.micro,
    fontWeight: '600',
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  paymentText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  actions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Design.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  acceptBtn: { backgroundColor: Colors.success },
  declineText: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  acceptText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
