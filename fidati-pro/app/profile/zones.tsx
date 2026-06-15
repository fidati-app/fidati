import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ConfirmDialog } from '@/components/profile/ConfirmDialog';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { CityPicker } from '@/components/shared/CityPicker';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import {
  addProfessionalZone,
  removeProfessionalZone,
} from '@/services/professionalZonesService';

export default function ProfileZonesScreen() {
  const router = useRouter();
  const { profile, profileId, refresh } = useMyProfessionalProfile();

  const [localZones, setLocalZones] = useState<string[] | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [pendingRemoveCity, setPendingRemoveCity] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zones = localZones ?? profile?.serviceZones ?? [];

  const handleAddCity = useCallback(
    async (city: string) => {
      if (!profileId || isSaving) return;
      setError(null);
      setIsSaving(true);
      try {
        const next = await addProfessionalZone(profileId, zones, city);
        setLocalZones(next);
        setCityQuery('');
        setAddModalOpen(false);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossibile aggiungere la città.');
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, profileId, refresh, zones],
  );

  const handleConfirmRemove = useCallback(async () => {
    if (!profileId || !pendingRemoveCity || isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      const next = await removeProfessionalZone(profileId, zones, pendingRemoveCity);
      setLocalZones(next);
      setPendingRemoveCity(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile rimuovere la zona.');
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, pendingRemoveCity, profileId, refresh, zones]);

  if (!profile || !profileId) {
    return null;
  }

  return (
    <ProfilePageShell
      title="Zone servite"
      subtitle="Aree in cui sei disponibile a lavorare. I clienti ti troveranno in queste città."
    >
      <View style={styles.card}>
        {profile.baseCity ? (
          <AppText style={styles.baseCity}>Città base: {profile.baseCity}</AppText>
        ) : null}

        <View style={styles.zones}>
          {zones.length > 0 ? (
            zones.map((zone) => (
              <Pressable
                key={zone}
                style={styles.zonePill}
                onPress={() => setPendingRemoveCity(zone)}
                disabled={isSaving}
              >
                <Ionicons name="location-outline" size={14} color={Colors.navy} />
                <AppText style={styles.zoneText}>{zone}</AppText>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </Pressable>
            ))
          ) : (
            <AppText style={styles.empty}>Nessuna zona configurata.</AppText>
          )}
        </View>

        <PrimaryButton
          title="Aggiungi città"
          variant="outline"
          onPress={() => setAddModalOpen(true)}
          disabled={isSaving}
          style={styles.addBtn}
        />

        {error ? <AppText style={styles.error}>{error}</AppText> : null}
      </View>

      <AppText style={styles.tip}>
        Tocca una zona per rimuoverla. Devi avere almeno una città attiva.
      </AppText>

      <PrimaryButton
        title="Torna al profilo"
        variant="outline"
        onPress={() => router.back()}
        disabled={isSaving}
      />

      <Modal visible={addModalOpen} transparent animationType="slide" onRequestClose={() => setAddModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddModalOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <AppText style={styles.modalTitle}>Aggiungi una città</AppText>
            <AppText style={styles.modalSubtitle}>
              Usa la stessa ricerca dell’onboarding per trovare le zone servite.
            </AppText>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <CityPicker
                cities={zones}
                query={cityQuery}
                onChangeQuery={setCityQuery}
                onAddCity={(city) => void handleAddCity(city)}
                onRemoveCity={() => {}}
                disabled={isSaving}
              />
            </ScrollView>
            <PrimaryButton
              title="Chiudi"
              variant="outline"
              onPress={() => setAddModalOpen(false)}
              disabled={isSaving}
            />
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={pendingRemoveCity != null}
        title="Vuoi rimuovere questa zona?"
        message="Non riceverai più richieste da questa città."
        confirmLabel="Rimuovi"
        cancelLabel="Annulla"
        loading={isSaving}
        onCancel={() => setPendingRemoveCity(null)}
        onConfirm={() => void handleConfirmRemove()}
      />
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    ...Design.shadowSoft,
  },
  zones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baseCity: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 10,
  },
  empty: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Design.radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  zoneText: { fontSize: 13, fontWeight: '600', color: Colors.navy },
  addBtn: {
    marginTop: 14,
    minHeight: 46,
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  tip: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Design.radius.xl,
    borderTopRightRadius: Design.radius.xl,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 10,
    maxHeight: '82%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
});
