import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ImagePickerActions, pickImageFromLibrary } from '@/components/profile/ImagePickerActions';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CorrectionSuccessSequence } from '@/components/change-requests/CorrectionSuccessSequence';
import { submitChangeRequestResponse } from '@/services/changeRequestResponseService';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import {
  fetchVerificationDocument,
  uploadVerificationImage,
  upsertVerificationDocument,
} from '@/services/professionalVerificationService';
import { fieldKeyToDocSlot } from '@/utils/changeRequestRouting';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type DocSlot = 'front' | 'back' | 'selfie';

type Props = {
  request: AdminChangeRequest;
  professionalId: string;
  otherPendingCount: number;
  onSuccess: () => void;
  readOnly?: boolean;
};

const SLOT_COPY: Record<DocSlot, { title: string; hint: string; cta: string }> = {
  front: {
    title: 'Fronte documento',
    hint: 'Carica una foto nitida del fronte del documento.',
    cta: 'Carica nuovo fronte',
  },
  back: {
    title: 'Retro documento',
    hint: 'Carica una foto nitida del retro del documento.',
    cta: 'Carica nuovo retro',
  },
  selfie: {
    title: 'Selfie di verifica',
    hint: 'Scatta o carica un nuovo selfie con il viso ben visibile.',
    cta: 'Invia nuovo selfie',
  },
};

function resolveLockedSlot(request: AdminChangeRequest): DocSlot {
  return fieldKeyToDocSlot(request.fieldKey ?? '') ?? 'front';
}

export function DocumentFixFlow({ request, professionalId, otherPendingCount, onSuccess, readOnly }: Props) {
  const slot = useMemo(() => resolveLockedSlot(request), [request.fieldKey]);
  const copy = SLOT_COPY[slot];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [initialUrl, setInitialUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState<'id_card' | 'driving_license' | 'passport'>('id_card');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (__DEV__) {
      console.log('[CHANGE_REQUEST] opened', {
        id: request.id,
        type: request.type,
        field: request.fieldKey,
        slot,
      });
    }
  }, [request.id, request.type, request.fieldKey, slot]);

  useEffect(() => {
    void (async () => {
      try {
        const doc = await fetchVerificationDocument(professionalId);
        if (doc) {
          setDocType(doc.documentType);
          const current =
            slot === 'front' ? doc.frontImageUrl : slot === 'back' ? doc.backImageUrl : doc.selfieImageUrl;
          setPreviewUrl(current);
          setInitialUrl(current);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [professionalId, slot]);

  const handlePickFromLibrary = async () => {
    if (readOnly) return;
    const uri = await pickImageFromLibrary([4, 3]);
    if (!uri) return;
    await handlePick(uri);
  };

  const handlePick = async (uri: string) => {
    if (readOnly) return;
    setError(null);
    setBusy(true);
    try {
      const url = await uploadVerificationImage(professionalId, slot, uri);
      const patch =
        slot === 'front'
          ? { frontImageUrl: url }
          : slot === 'back'
            ? { backImageUrl: url }
            : { selfieImageUrl: url };

      await upsertVerificationDocument(professionalId, docType, patch);
      setPreviewUrl(url);
      setPendingUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile caricare il documento.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setError(null);

    const url = pendingUrl ?? previewUrl;
    if (!url || url === initialUrl) {
      if (__DEV__) {
        console.log('[CHANGE_REQUEST] submit blocked reason', 'document unchanged');
      }
      setError('Devi completare questa modifica prima di inviarla.');
      return;
    }

    setBusy(true);
    try {
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'upload',
        message: request.adminMessage ?? undefined,
        oldValue: { slot, url: initialUrl },
        newValue: { slot, url },
        attachmentUrl: url,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile inviare la correzione.');
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
      <AppText style={styles.lead}>{request.friendlyReason || copy.title}</AppText>
      <AppText style={styles.hint}>{copy.hint}</AppText>
      {request.adminMessage ? <AppText style={styles.note}>{request.adminMessage}</AppText> : null}

      {loading ? (
        <ActivityIndicator color={Colors.success} style={{ marginVertical: 20 }} />
      ) : previewUrl ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: previewUrl }} style={styles.preview} contentFit="cover" />
        </View>
      ) : (
        <View style={styles.previewPlaceholder}>
          <Ionicons name={slot === 'selfie' ? 'person-circle-outline' : 'document-outline'} size={28} color={Colors.textMuted} />
          <AppText style={styles.placeholderText}>Nessuna immagine caricata</AppText>
        </View>
      )}

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {readOnly ? (
        <View style={styles.reviewBanner}>
          <Ionicons name="time-outline" size={18} color={Colors.pending} />
          <AppText style={styles.reviewText}>Correzione inviata — in revisione</AppText>
        </View>
      ) : (
        <>
          {slot === 'selfie' ? (
            <ImagePickerActions onPick={(uri) => void handlePick(uri)} disabled={busy} />
          ) : (
            <PrimaryButton
              title={busy ? 'Caricamento…' : copy.cta}
              onPress={() => void handlePickFromLibrary()}
              disabled={busy}
            />
          )}
          <PrimaryButton
            title={busy ? 'Invio…' : 'Invia correzione'}
            onPress={() => void handleSubmit()}
            disabled={busy || (!pendingUrl && previewUrl === initialUrl)}
          />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  lead: { fontSize: 17, fontWeight: '700', color: Colors.navy, lineHeight: 24 },
  hint: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
  },
  previewWrap: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 280,
    height: 170,
    borderRadius: Design.radius.md,
    borderWidth: 2,
    borderColor: Colors.error,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  previewPlaceholder: {
    height: 140,
    borderRadius: Design.radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderText: { fontSize: 12, color: Colors.textMuted },
  error: { fontSize: 13, color: Colors.error },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
  },
  reviewText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.navy },
});
