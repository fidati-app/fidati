import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_PRO_PROFILE } from '@/services/mockData';

const INVOICES = [
  { id: 'inv-1', label: 'Maggio 2026', amount: 2640, status: 'Pagata' },
  { id: 'inv-2', label: 'Aprile 2026', amount: 2310, status: 'Pagata' },
  { id: 'inv-3', label: 'Marzo 2026', amount: 1980, status: 'Pagata' },
];

export default function ProfileEarningsScreen() {
  const stats = MOCK_PRO_PROFILE.stats;

  return (
    <ProfilePageShell title="Guadagni e fatture" subtitle="Riepilogo incassi e documenti">
      <View style={styles.heroCard}>
        <AppText style={styles.heroLabel}>Guadagni questo mese</AppText>
        <AppText style={styles.heroValue}>{stats.earningsThisMonth.toLocaleString('it-IT')} €</AppText>
        <AppText style={styles.heroSub}>
          Settimana: {stats.earningsThisWeek.toLocaleString('it-IT')} €
        </AppText>
      </View>
      <View style={styles.card}>
        {INVOICES.map((invoice, index) => (
          <View key={invoice.id} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View>
              <AppText style={styles.rowTitle}>{invoice.label}</AppText>
              <AppText style={styles.rowStatus}>{invoice.status}</AppText>
            </View>
            <AppText style={styles.rowAmount}>{invoice.amount.toLocaleString('it-IT')} €</AppText>
          </View>
        ))}
      </View>
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.navy,
    borderRadius: Design.radius.lg,
    padding: 18,
    gap: 4,
  },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
  heroValue: { fontSize: 28, fontWeight: '800', color: Colors.white, letterSpacing: -0.8 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadowSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  rowTitle: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  rowStatus: { fontSize: 11, color: Colors.success, fontWeight: '600', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '800', color: Colors.navy },
});
