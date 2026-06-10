import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppointmentRow } from '@/components/agenda/AppointmentRow';
import { DayTimeline } from '@/components/agenda/DayTimeline';
import { WeekStrip } from '@/components/agenda/WeekStrip';
import { WeeklyAvailabilityGrid } from '@/components/agenda/WeeklyAvailabilityGrid';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { ProHeroHeader } from '@/components/ui/ProHeroHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import {
  AGENDA_DAYS,
  getAppointmentsForDay,
  getTimeSlotsForDay,
  WEEKLY_AVAILABILITY,
} from '@/services/mockData';
import { DayAvailability } from '@/types';

const STATUS_CONFIG: Record<
  DayAvailability,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  free: { label: 'Giornata libera', color: Colors.success, icon: 'checkmark-circle-outline' },
  partial: { label: 'Parzialmente occupato', color: Colors.pending, icon: 'time-outline' },
  full: { label: 'Agenda piena', color: Colors.navy, icon: 'calendar' },
  off: { label: 'Non disponibile', color: Colors.unavailable, icon: 'close-circle-outline' },
};

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState('2026-06-09');

  const appointments = getAppointmentsForDay(selectedDay);
  const timeSlots = useMemo(() => getTimeSlotsForDay(selectedDay), [selectedDay]);
  const selectedMeta = AGENDA_DAYS.find((d) => d.key === selectedDay);
  const dayStatus = selectedMeta?.availability ?? 'free';
  const statusConfig = STATUS_CONFIG[dayStatus];

  return (
    <>
      <StatusBar style="light" />
      <Screen padded={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <ProHeroHeader
          title="Agenda"
          subtitle="Giugno 2026 · Disponibilità e appuntamenti"
          icon="calendar"
        />

      <View style={styles.monthBar}>
        <Ionicons name="chevron-back" size={18} color={Colors.textMuted} />
        <AppText style={styles.monthLabel}>Giugno 2026</AppText>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>

      <WeekStrip days={AGENDA_DAYS} selectedKey={selectedDay} onSelect={setSelectedDay} />

      <View style={[styles.statusBanner, { borderColor: `${statusConfig.color}33` }]}>
        <View style={[styles.statusIcon, { backgroundColor: `${statusConfig.color}18` }]}>
          <Ionicons name={statusConfig.icon} size={20} color={statusConfig.color} />
        </View>
        <View style={styles.statusCopy}>
          <AppText style={styles.statusTitle}>{statusConfig.label}</AppText>
          <AppText style={styles.statusMeta}>
            {appointments.length} appuntament{appointments.length === 1 ? 'o' : 'i'} confermat
            {appointments.length === 1 ? 'o' : 'i'}
            {selectedMeta?.isToday ? ' · Oggi' : ''}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Fasce orarie</AppText>
        <View style={styles.timelineCard}>
          <DayTimeline slots={timeSlots} />
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>
          Appuntamenti · {selectedMeta?.isToday ? 'Oggi' : `${selectedMeta?.label} ${selectedMeta?.day}`}
        </AppText>
        <View style={styles.listCard}>
          {appointments.length > 0 ? (
            appointments.map((apt, index) => (
              <AppointmentRow
                key={apt.id}
                appointment={apt}
                showBorder={index < appointments.length - 1}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="sunny-outline" size={28} color={Colors.textMuted} />
              <AppText style={styles.emptyTitle}>Giornata libera</AppText>
              <AppText style={styles.emptyText}>
                Nessun appuntamento programmato. Puoi accettare nuove richieste.
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Disponibilità settimanale</AppText>
        <View style={styles.availabilityCard}>
          <WeeklyAvailabilityGrid slots={WEEKLY_AVAILABILITY} />
          <View style={styles.legend}>
            <LegendDot color={Colors.success} label="Libero" />
            <LegendDot color={Colors.pending} label="Parziale" />
            <LegendDot color={Colors.navy} label="Pieno" />
            <LegendDot color={Colors.unavailable} label="Off" />
          </View>
        </View>
      </View>
      </Screen>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText style={styles.legendLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Design.spacing.screen,
    marginTop: 16,
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Design.spacing.screen,
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    ...Design.shadowSoft,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: { flex: 1, gap: 2 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  statusMeta: { fontSize: 12, color: Colors.textSecondary },
  section: {
    paddingHorizontal: Design.spacing.screen,
    marginTop: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.navy,
  },
  timelineCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Design.shadowSoft,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  empty: { padding: 28, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.navy },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },
  availabilityCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    ...Design.shadowSoft,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
});
