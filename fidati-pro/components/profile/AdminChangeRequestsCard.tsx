import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAdminChangeRequests } from '@/contexts/AdminChangeRequestsContext';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import {
  AREA_ICONS,
  formatChangeRequestDate,
  PROFILE_FIXES_SUBTITLE,
  PROFILE_FIXES_TITLE,
} from '@/services/professionalInternalNotificationsService';

type Props = {
  variant?: 'home' | 'profile';
};

const CARD_RADIUS = 22;

export function AdminChangeRequestsCard({ variant = 'home' }: Props) {
  const router = useRouter();
  const { requests, isLoading, refresh } = useAdminChangeRequests();

  const actionable = requests.filter((r) => !r.isInReview);
  const inReview = requests.filter((r) => r.isInReview);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (isLoading && requests.length === 0) {
    return (
      <View style={[styles.card, styles.cardLoading]}>
        <ActivityIndicator color={Colors.success} />
      </View>
    );
  }

  if (requests.length === 0) {
    if (variant === 'profile') {
      return (
        <View style={styles.emptyWrap}>
          <AppText style={styles.emptyText}>Per ora non c&apos;è nulla da sistemare. Ottimo lavoro!</AppText>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={20} color={Colors.success} />
        </View>
        <View style={styles.headerCopy}>
          <AppText style={styles.title}>{PROFILE_FIXES_TITLE}</AppText>
          <AppText style={styles.subtitle}>{PROFILE_FIXES_SUBTITLE}</AppText>
        </View>
        {actionable.length > 0 ? (
          <View style={styles.countBadge}>
            <AppText style={styles.countBadgeText}>{actionable.length}</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.list}>
        {[...actionable, ...inReview].map((item, index) => (
          <Pressable
            key={item.id}
            style={[styles.item, index > 0 && styles.itemBorder]}
            onPress={() => router.push({ pathname: '/change-requests/[id]', params: { id: item.id } })}
          >
            <View style={styles.itemRow}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name={AREA_ICONS[item.areaIcon] ?? 'help-circle-outline'}
                  size={18}
                  color={item.isInReview ? Colors.textMuted : Colors.success}
                />
              </View>
              <View style={styles.itemBody}>
                <View style={styles.itemTop}>
                  <AppText style={styles.itemArea}>{item.areaLabel}</AppText>
                  {item.isInReview ? (
                    <View style={styles.reviewPill}>
                      <AppText style={styles.reviewPillText}>In revisione</AppText>
                    </View>
                  ) : (
                    <View style={styles.actionDot} />
                  )}
                </View>
                <AppText style={styles.itemReason} numberOfLines={2}>
                  {item.friendlyReason}
                </AppText>
                <AppText style={styles.date}>{formatChangeRequestDate(item.created_at)}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 18,
    ...Design.shadowSoft,
  },
  cardLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: '800', color: Colors.navy },
  subtitle: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  list: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  item: { paddingTop: 12, paddingBottom: 4 },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1, gap: 4 },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  itemArea: { fontSize: 13, fontWeight: '800', color: Colors.navy },
  reviewPill: {
    backgroundColor: Colors.pendingSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Design.radius.full,
  },
  reviewPillText: { fontSize: 10, fontWeight: '700', color: Colors.pending },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  itemReason: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary },
  date: { fontSize: 11, color: Colors.textMuted },
  emptyWrap: { paddingVertical: 8, paddingHorizontal: 4 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
