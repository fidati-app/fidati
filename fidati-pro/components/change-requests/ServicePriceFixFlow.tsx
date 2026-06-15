import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CorrectionSuccessSequence } from '@/components/change-requests/CorrectionSuccessSequence';
import { submitChangeRequestResponse } from '@/services/changeRequestResponseService';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import {
  fetchProfessionalServiceById,
  updateProfessionalServicePrices,
} from '@/services/professionalServicesUpdateService';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Props = {
  request: AdminChangeRequest;
  professionalId: string;
  otherPendingCount: number;
  onSuccess: () => void;
  readOnly?: boolean;
};

export function ServicePriceFixFlow({
  request,
  professionalId,
  otherPendingCount,
  onSuccess,
  readOnly,
}: Props) {
  const [title, setTitle] = useState('');
  const [minRaw, setMinRaw] = useState('');
  const [maxRaw, setMaxRaw] = useState('');
  const [quoteOnRequest, setQuoteOnRequest] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldPrices, setOldPrices] = useState<{ from: number; max: number | null } | null>(null);

  useEffect(() => {
    void (async () => {
      if (!request.related_entity_id) {
        setLoading(false);
        return;
      }
      try {
        const svc = await fetchProfessionalServiceById(request.related_entity_id, professionalId);
        if (svc) {
          setTitle(svc.title);
          setMinRaw(svc.price_from > 0 ? String(svc.price_from) : '');
          setMaxRaw(svc.price_max != null ? String(svc.price_max) : '');
          setQuoteOnRequest(svc.price_from === 0 && svc.price_max == null);
          setOldPrices({ from: Number(svc.price_from), max: svc.price_max != null ? Number(svc.price_max) : null });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [request.related_entity_id, professionalId]);

  const handleSavePrice = async () => {
    if (readOnly || !request.related_entity_id) return;
    setError(null);
    const priceFrom = quoteOnRequest ? 0 : Number(minRaw.replace(',', '.'));
    const priceMax = quoteOnRequest ? null : maxRaw ? Number(maxRaw.replace(',', '.')) : null;

    if (!quoteOnRequest && (!Number.isFinite(priceFrom) || priceFrom <= 0)) {
      setError('Inserisci un prezzo minimo valido oppure attiva "Preventivo su richiesta".');
      return;
    }

    setBusy(true);
    try {
      const unchanged =
        oldPrices &&
        oldPrices.from === priceFrom &&
        oldPrices.max === priceMax &&
        quoteOnRequest === (oldPrices.from === 0 && oldPrices.max == null);

      if (unchanged) {
        if (__DEV__) {
          console.log('[CHANGE_REQUEST] submit blocked reason', 'price unchanged');
        }
        setError('Devi completare questa modifica prima di inviarla.');
        return;
      }

      const updated = await updateProfessionalServicePrices({
        serviceId: request.related_entity_id,
        professionalId,
        priceFrom: quoteOnRequest ? 0 : priceFrom,
        priceMax: quoteOnRequest ? null : priceMax,
        quoteOnRequest,
      });
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'updated_data',
        oldValue: oldPrices ? { price_from: oldPrices.from, price_max: oldPrices.max } : undefined,
        newValue: {
          price_from: updated.price_from,
          price_max: updated.price_max,
          title: updated.title,
        },
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare il prezzo.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendExplanation = async () => {
    if (readOnly || explanation.trim().length < 5) {
      setError('Scrivi almeno qualche parola per spiegarci il prezzo.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'explanation',
        message: explanation.trim(),
        oldValue: oldPrices ? { price_from: oldPrices.from, price_max: oldPrices.max, title } : { title },
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile inviare la spiegazione.');
    } finally {
      setBusy(false);
    }
  };

  if (showSuccess) {
    return (
      <CorrectionSuccessSequence active otherPendingCount={otherPendingCount} onComplete={onSuccess} />
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.wrap}>
      <AppText style={styles.lead}>Controlliamo questo prezzo</AppText>
      <AppText style={styles.hint}>{request.friendlyHint}</AppText>

      {title ? (
        <View style={styles.serviceCard}>
          <AppText style={styles.serviceTitle}>{title}</AppText>
          {oldPrices ? (
            <AppText style={styles.serviceMeta}>
              Attuale: {oldPrices.from > 0 ? `da ${oldPrices.from}€` : 'Preventivo su richiesta'}
              {oldPrices.max ? ` – ${oldPrices.max}€` : ''}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {loading ? null : readOnly ? (
        <View style={styles.reviewBanner}>
          <AppText style={styles.reviewText}>La tua risposta è in revisione dal team Fidati.</AppText>
        </View>
      ) : (
        <>
          <AuthFormField
            label="Prezzo minimo (€)"
            value={minRaw}
            onChangeText={setMinRaw}
            keyboardType="decimal-pad"
            editable={!quoteOnRequest}
          />
          <AuthFormField
            label="Prezzo massimo (€)"
            value={maxRaw}
            onChangeText={setMaxRaw}
            keyboardType="decimal-pad"
            editable={!quoteOnRequest}
          />
          <View style={styles.switchRow}>
            <AppText style={styles.switchLabel}>Preventivo su richiesta</AppText>
            <Switch
              value={quoteOnRequest}
              onValueChange={setQuoteOnRequest}
              trackColor={{ false: Colors.border, true: Colors.successSoft }}
              thumbColor={quoteOnRequest ? Colors.success : Colors.card}
            />
          </View>
          <AuthFormField
            label="Spiega perché questo prezzo è corretto (opzionale)"
            value={explanation}
            onChangeText={setExplanation}
            multiline
            icon="chatbubble-outline"
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <PrimaryButton
            title={busy ? 'Salvataggio…' : 'Salva nuovo prezzo'}
            onPress={() => void handleSavePrice()}
            disabled={busy}
          />
          <PrimaryButton
            title="Invia spiegazione"
            variant="outline"
            onPress={() => void handleSendExplanation()}
            disabled={busy}
          />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  lead: { fontSize: 17, fontWeight: '700', color: Colors.navy },
  hint: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  serviceCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
  },
  serviceTitle: { fontSize: 15, fontWeight: '700', color: Colors.navy },
  serviceMeta: { fontSize: 13, color: Colors.textMuted },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: Colors.navy },
  error: { fontSize: 13, color: Colors.error },
  reviewBanner: {
    backgroundColor: Colors.pendingSoft,
    padding: 14,
    borderRadius: Design.radius.md,
  },
  reviewText: { fontSize: 13, fontWeight: '600', color: Colors.navy },
});
