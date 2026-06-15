import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const REASSURANCE = [
  'Nessuna azione richiesta',
  'Ti avviseremo appena sarà tutto pronto',
  'Potrai ricevere clienti subito dopo la verifica',
] as const;

export function ProfileVerificationReviewCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={20} color={Colors.pending} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>Il tuo profilo è in revisione</AppText>
          <AppText style={styles.body}>
            Stiamo controllando i tuoi dati. Di solito la verifica richiede meno di 24 ore.
          </AppText>
        </View>
      </View>
      <View style={styles.list}>
        {REASSURANCE.map((item) => (
          <View key={item} style={styles.row}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <AppText style={styles.rowText}>{item}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.24)',
    padding: 18,
    gap: 14,
    ...Design.shadowSoft,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.pendingSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  list: {
    gap: 10,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.navy,
    fontWeight: '600',
  },
});
