import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { BookingCard } from '@/components/BookingCard';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_BOOKINGS } from '@/services/mockData';
import { Booking, BookingStatus } from '@/types';

type BookingsTab = 'active' | 'past';

const ACTIVE_STATUSES: BookingStatus[] = ['confirmed', 'incoming'];
const PAST_STATUSES: BookingStatus[] = ['completed', 'cancelled'];

function matchesQuery(booking: Booking, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    booking.serviceTitle.toLowerCase().includes(normalized) ||
    booking.professionalName.toLowerCase().includes(normalized) ||
    booking.category.toLowerCase().includes(normalized)
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statChip}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<BookingsTab>('active');
  const [query, setQuery] = useState('');

  const activeBookings = useMemo(
    () => MOCK_BOOKINGS.filter((booking) => ACTIVE_STATUSES.includes(booking.status)),
    [],
  );
  const pastBookings = useMemo(
    () => MOCK_BOOKINGS.filter((booking) => PAST_STATUSES.includes(booking.status)),
    [],
  );

  const bookings = useMemo(() => {
    const source = tab === 'active' ? activeBookings : pastBookings;
    return source.filter((booking) => matchesQuery(booking, query));
  }, [activeBookings, pastBookings, query, tab]);

  return (
    <>
      <StatusBar style="light" />
      <Screen padded={false} contentContainerStyle={styles.screenContent}>
        <LinearGradient
          colors={[...Colors.heroGradient]}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { paddingTop: insets.top + 18 }]}
        >
          <View style={styles.glow} />
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="calendar" size={22} color={Colors.accent} />
            </View>
            <AppText style={styles.title}>Prenotazioni</AppText>
          </View>
          <AppText style={styles.subtitle}>Gestisci le tue richieste e i lavori programmati</AppText>
        </LinearGradient>

        <View style={styles.body}>
          <SearchBar
            size="slim"
            placeholder="Cerca per servizio o professionista..."
            showChevron
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />

          <View style={styles.statsCard}>
            <StatChip label="Attive" value={activeBookings.length} />
            <View style={styles.statDivider} />
            <StatChip label="Completate" value={pastBookings.length} />
            <View style={styles.statDivider} />
            <StatChip label="Totale" value={MOCK_BOOKINGS.length} />
          </View>

          <View style={styles.filters}>
            {(
              [
                { key: 'active' as const, label: 'In corso' },
                { key: 'past' as const, label: 'Passate' },
              ] as const
            ).map((option) => {
              const isActive = tab === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setTab(option.key)}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                >
                  <AppText style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {bookings.length > 0 ? (
            <View style={styles.list}>
              {bookings.map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  variant="list"
                  showBorder={index < bookings.length - 1}
                  onPress={() => router.push(`/bookings/${booking.id}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-clear-outline" size={28} color={Colors.accent} />
              </View>
              <AppText style={styles.emptyTitle}>Nessuna prenotazione</AppText>
              <AppText style={styles.emptyText}>
                {query.trim()
                  ? 'Prova con un altro termine di ricerca.'
                  : tab === 'active'
                    ? 'Le tue prenotazioni attive compariranno qui.'
                    : 'Qui troverai lo storico delle prenotazioni completate.'}
              </AppText>
            </View>
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Design.font.hero,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    lineHeight: 34,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontSize: Design.font.caption,
    color: 'rgba(255, 255, 255, 0.68)',
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
  },
  search: {
    marginBottom: 14,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    marginBottom: 14,
    ...Design.shadow,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Design.font.micro,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: Design.radius.button,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: Design.font.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.white,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadow,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Design.shadow,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyText: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
