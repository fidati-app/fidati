import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CorrectionSuccessSequence } from '@/components/change-requests/CorrectionSuccessSequence';
import { CityPicker } from '@/components/shared/CityPicker';
import { submitChangeRequestResponse } from '@/services/changeRequestResponseService';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import { syncProfessionalZonesAndBaseCity } from '@/services/professionalZonesService';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { resolveZonesFixScope, type ZonesFixScope } from '@/utils/changeRequestRouting';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Props = {
  request: AdminChangeRequest;
  professionalId: string;
  otherPendingCount: number;
  onSuccess: () => void;
  readOnly?: boolean;
};

const FOOTER_HEIGHT = 88;
const EXTRA_BOTTOM = 24;

function normalizeZones(zones: string[]): string[] {
  return zones.map((z) => z.trim()).filter(Boolean);
}

function sameCity(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function zonesEqual(a: string[], b: string[]): boolean {
  const na = normalizeZones(a).map((z) => z.toLowerCase()).sort();
  const nb = normalizeZones(b).map((z) => z.toLowerCase()).sort();
  if (na.length !== nb.length) return false;
  return na.every((z, i) => z === nb[i]);
}

function extraZonesFromAll(allZones: string[], baseCity: string): string[] {
  const base = baseCity.trim();
  if (!base) return normalizeZones(allZones);
  return normalizeZones(allZones).filter((z) => !sameCity(z, base));
}

function ZoneChip({
  label,
  badge,
  onRemove,
  disabled,
}: {
  label: string;
  badge?: string;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.zoneChip}>
      <Ionicons name="location-outline" size={14} color={Colors.navy} />
      <AppText style={styles.zoneChipText}>{label}</AppText>
      {badge ? (
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{badge}</AppText>
        </View>
      ) : null}
      {onRemove && !disabled ? (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Rimuovi ${label}`}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function ZonesFixFlow({
  request,
  professionalId,
  otherPendingCount,
  onSuccess,
  readOnly,
}: Props) {
  const { profile, refresh } = useMyProfessionalProfile();
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);

  const scope: ZonesFixScope = useMemo(() => resolveZonesFixScope(request), [request]);
  const initialBaseCity = profile?.baseCity ?? '';
  const initialAllZones = profile?.serviceZones ?? [];
  const initialExtraZones = extraZonesFromAll(initialAllZones, initialBaseCity);

  const [baseCityDraft, setBaseCityDraft] = useState(initialBaseCity);
  const [extraZones, setExtraZones] = useState<string[]>(initialExtraZones);
  const [baseCityQuery, setBaseCityQuery] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEditBase = scope === 'base_city' || scope === 'both';
  const baseCityDisplay = canEditBase ? baseCityDraft : initialBaseCity;

  useEffect(() => {
    setBaseCityDraft(initialBaseCity);
    setExtraZones(extraZonesFromAll(initialAllZones, initialBaseCity));
  }, [initialAllZones.join('|'), initialBaseCity]);

  const submitLabel = otherPendingCount > 0 ? 'Salva e continua' : 'Invia modifica';

  const excludeFromZoneSearch = useMemo(() => {
    const blocked = [...extraZones];
    if (baseCityDisplay) blocked.push(baseCityDisplay);
    return blocked;
  }, [baseCityDisplay, extraZones]);

  const scrollSearchIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, Platform.OS === 'ios' ? 100 : 60);
  };

  const handleSelectBaseCity = (city: string) => {
    setBaseCityDraft(city.trim());
    setBaseCityQuery('');
    setError(null);
  };

  const handleAddZone = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    if (baseCityDisplay && sameCity(trimmed, baseCityDisplay)) return;
    if (extraZones.some((z) => sameCity(z, trimmed))) return;
    setExtraZones((current) => [...current, trimmed]);
    setZoneQuery('');
    setError(null);
  };

  const handleRemoveZone = (city: string) => {
    setExtraZones((current) => current.filter((z) => z !== city));
    setError(null);
  };

  const buildZonesToSave = (): string[] => {
    const base = baseCityDisplay.trim();
    const extras = normalizeZones(extraZones).filter((z) => !base || !sameCity(z, base));
    return base ? [base, ...extras] : extras;
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setError(null);

    const base = baseCityDisplay.trim();
    const zonesToSave = buildZonesToSave();

    if (zonesToSave.length === 0) {
      setError('Seleziona almeno una città in cui vuoi lavorare.');
      return;
    }

    if (canEditBase && !base) {
      setError('Seleziona la città principale.');
      return;
    }

    const baseChanged = canEditBase && !sameCity(base, initialBaseCity);
    const extrasChanged = !zonesEqual(extraZones, initialExtraZones);
    const allChanged = !zonesEqual(zonesToSave, initialAllZones);

    if (!baseChanged && !extrasChanged && !allChanged) {
      setError('Modifica almeno un dettaglio prima di inviare.');
      return;
    }

    setBusy(true);
    try {
      await syncProfessionalZonesAndBaseCity(professionalId, base || zonesToSave[0], extraZones);
      await refresh();
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'updated_data',
        message: request.adminMessage ?? undefined,
        oldValue: { zones: initialAllZones, base_city: initialBaseCity },
        newValue: { zones: zonesToSave, base_city: base || zonesToSave[0] },
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare le zone.');
    } finally {
      setBusy(false);
    }
  };

  if (showSuccess) {
    return (
      <CorrectionSuccessSequence
        active
        otherPendingCount={otherPendingCount}
        onComplete={onSuccess}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: keyboardHeight + FOOTER_HEIGHT + EXTRA_BOTTOM,
        }}
      >
        <Animated.View entering={FadeInDown.duration(350)} style={styles.wrap}>
          <AppText style={styles.lead}>{request.friendlyReason}</AppText>
          {request.adminMessage ? <AppText style={styles.note}>{request.adminMessage}</AppText> : null}

          {/* Città principale */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Città principale</AppText>
            {canEditBase ? (
              <>
                <AppText style={styles.sectionHint}>
                  Da quale città parti per offrire i tuoi servizi.
                </AppText>
                {baseCityDraft ? (
                  <View style={styles.baseCityCardEditable}>
                    <Ionicons name="home-outline" size={18} color={Colors.navy} />
                    <AppText style={styles.baseCityText}>{baseCityDraft}</AppText>
                    {!readOnly ? (
                      <Pressable onPress={() => setBaseCityDraft('')} hitSlop={8}>
                        <AppText style={styles.changeLink}>Cambia</AppText>
                      </Pressable>
                    ) : null}
                  </View>
                ) : (
                  <CityPicker
                    cities={[]}
                    query={baseCityQuery}
                    onChangeQuery={setBaseCityQuery}
                    onAddCity={handleSelectBaseCity}
                    onRemoveCity={() => {}}
                    disabled={busy || readOnly}
                    placeholder="Cerca la città principale"
                    showSelectedChips={false}
                    onInputFocus={scrollSearchIntoView}
                  />
                )}
              </>
            ) : (
              <View style={styles.baseCityInfoCard}>
                <View style={styles.baseCityInfoRow}>
                  <Ionicons name="home-outline" size={18} color={Colors.navy} />
                  <AppText style={styles.baseCityInfoLabel}>
                    Città principale:{' '}
                    <AppText style={styles.baseCityInfoValue}>
                      {initialBaseCity || 'Non impostata'}
                    </AppText>
                  </AppText>
                </View>
                <AppText style={styles.supportHint}>
                  Per cambiare la città principale contatta il supporto o modifica il profilo.
                </AppText>
                {initialBaseCity ? (
                  <AppText style={styles.includedHint}>
                    Inclusa automaticamente nelle zone operative.
                  </AppText>
                ) : null}
              </View>
            )}
          </View>

          {/* Zone operative */}
          <View style={styles.section}>
            <AppText style={styles.sectionTitle}>Zone dove vuoi ricevere richieste</AppText>
            <AppText style={styles.sectionHint}>
              Aggiungi le città extra in cui lavori. Puoi rimuoverle tutte e ricominciare; per
              inviare serve almeno una zona operativa
              {baseCityDisplay ? ' (la città principale conta).' : '.'}
            </AppText>

            <View style={styles.chipsWrap}>
              {baseCityDisplay && !canEditBase ? (
                <ZoneChip label={baseCityDisplay} badge="principale" />
              ) : null}
              {baseCityDisplay && canEditBase && scope === 'both' ? (
                <ZoneChip label={baseCityDisplay} badge="principale" />
              ) : null}
              {extraZones.length > 0 ? (
                extraZones.map((zone) => (
                  <ZoneChip
                    key={zone}
                    label={zone}
                    onRemove={() => handleRemoveZone(zone)}
                    disabled={readOnly || busy}
                  />
                ))
              ) : !baseCityDisplay ? (
                <AppText style={styles.emptyZones}>Nessuna zona selezionata.</AppText>
              ) : null}
            </View>

            {!readOnly ? (
              <CityPicker
                cities={[]}
                query={zoneQuery}
                onChangeQuery={setZoneQuery}
                onAddCity={handleAddZone}
                onRemoveCity={() => {}}
                disabled={busy}
                placeholder="Cerca un comune da aggiungere"
                excludeCities={excludeFromZoneSearch}
                showSelectedChips={false}
                onInputFocus={scrollSearchIntoView}
              />
            ) : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: keyboardHeight > 0 ? 8 : 0 },
        ]}
      >
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
        {readOnly ? (
          <View style={styles.reviewBanner}>
            <AppText style={styles.reviewText}>Correzione inviata — in revisione</AppText>
          </View>
        ) : (
          <PrimaryButton
            title={busy ? 'Salvataggio…' : submitLabel}
            onPress={() => void handleSubmit()}
            disabled={busy}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 20 },
  lead: { fontSize: 16, fontWeight: '700', color: Colors.navy, lineHeight: 22 },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
  },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.navy },
  sectionHint: { fontSize: 13, lineHeight: 19, color: Colors.textSecondary },
  baseCityInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  baseCityInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  baseCityInfoLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  baseCityInfoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  supportHint: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textMuted,
  },
  includedHint: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  baseCityCardEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  baseCityText: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.navy },
  changeLink: { fontSize: 13, fontWeight: '700', color: Colors.success },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 36,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Design.radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  zoneChipText: { fontSize: 13, fontWeight: '700', color: Colors.navy },
  badge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Design.radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
    textTransform: 'uppercase',
  },
  emptyZones: { fontSize: 13, color: Colors.textMuted, paddingVertical: 4 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.card,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 12,
    gap: 8,
  },
  error: { fontSize: 13, fontWeight: '600', color: Colors.error },
  reviewBanner: {
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
  },
  reviewText: { fontSize: 13, fontWeight: '600', color: Colors.pending },
});
