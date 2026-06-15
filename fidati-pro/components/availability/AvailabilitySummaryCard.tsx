import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface AvailabilitySummaryCardProps {
  availableDaysCount: number;
  totalDays?: number;
  acceptsUrgentJobs: boolean;
  isLoading?: boolean;
  onPress: () => void;
}

export function AvailabilitySummaryCard({
  availableDaysCount,
  totalDays = 7,
  acceptsUrgentJobs,
  isLoading,
  onPress,
}: AvailabilitySummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={18} color={Colors.success} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>Disponibilità</AppText>
          <AppText style={styles.line}>
            {isLoading
              ? 'Caricamento…'
              : `Disponibile ${availableDaysCount} giorni su ${totalDays}`}
          </AppText>
          <AppText style={styles.line}>
            Lavori urgenti: {acceptsUrgentJobs ? 'Attivi' : 'Non attivi'}
          </AppText>
        </View>
      </View>
      <PrimaryButton title="Modifica disponibilità" variant="outline" onPress={onPress} />
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  line: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});