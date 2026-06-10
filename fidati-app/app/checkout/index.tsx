import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ProfileImage } from '@/components/ProfileImage';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/theme';
import { findServicePackage } from '@/constants/professionalServices';
import { useProfessional } from '@/hooks/useProfessionals';

export default function CheckoutScreen() {
  const { professionalId, packageId } = useLocalSearchParams<{
    professionalId: string;
    packageId: string;
  }>();
  const router = useRouter();
  const professional = useProfessional(professionalId ?? '');
  const [date, setDate] = useState('12 Giugno 2026');
  const [time, setTime] = useState('10:00');

  const selectedPackage =
    professional && packageId
      ? findServicePackage(professional.categorySlug, packageId) ??
        professional.packages.find((p) => p.id === packageId)
      : undefined;

  if (!professional || !selectedPackage) {
    return (
      <Screen>
        <AppText variant="subtitle">Dati non disponibili</AppText>
      </Screen>
    );
  }

  const handleConfirm = () => {
    Alert.alert(
      'Richiesta inviata',
      `La tua richiesta per "${selectedPackage.title}" con ${professional.name} è stata inviata.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/bookings') }],
    );
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.proRow}>
          <ProfileImage
            name={professional.name}
            imageUrl={professional.imageUrl}
            fallbackColor={professional.avatarColor}
            size={56}
            shape="rounded"
          />
          <View>
            <AppText variant="subtitle" style={styles.proName}>
              {professional.name}
            </AppText>
            <AppText variant="caption">{professional.category}</AppText>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.packageRow}>
          <AppText variant="label" style={styles.tierLabel}>
            {selectedPackage.tier.toUpperCase()}
          </AppText>
          <AppText variant="subtitle">{selectedPackage.description}</AppText>
          <AppText variant="caption">Durata stimata: {selectedPackage.duration}</AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title" style={styles.sectionTitle}>
          Data e ora
        </AppText>
        <AppText variant="label" style={styles.label}>Data</AppText>
        <SearchBar value={date} onChangeText={setDate} placeholder="Seleziona data" />
        <AppText variant="label" style={[styles.label, styles.labelSpacing]}>Ora</AppText>
        <SearchBar value={time} onChangeText={setTime} placeholder="Seleziona ora" />
      </View>

      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <AppText variant="body" color={Colors.white}>Prezzo stimato</AppText>
          <AppText style={styles.totalPrice}>{selectedPackage.price}€</AppText>
        </View>
        <AppText variant="caption" color="rgba(255,255,255,0.65)">
          Il prezzo finale potrebbe variare in base alla complessità del lavoro.
        </AppText>
      </View>

      <PrimaryButton title="Conferma richiesta" onPress={handleConfirm} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  proName: {
    fontSize: 17,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  packageRow: {
    gap: 4,
  },
  tierLabel: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  labelSpacing: {
    marginTop: Spacing.sm,
  },
  priceCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.elevated,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -1,
  },
});
