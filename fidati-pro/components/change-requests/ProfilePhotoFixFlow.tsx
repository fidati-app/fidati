import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ImagePickerActions } from '@/components/profile/ImagePickerActions';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CorrectionSuccessSequence } from '@/components/change-requests/CorrectionSuccessSequence';
import { submitChangeRequestResponse } from '@/services/changeRequestResponseService';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import { saveProfessionalProfilePhoto } from '@/services/professionalProfilePhotoService';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Props = {
  request: AdminChangeRequest;
  professionalId: string;
  otherPendingCount: number;
  onSuccess: () => void;
  readOnly?: boolean;
};

export function ProfilePhotoFixFlow({
  request,
  professionalId,
  otherPendingCount,
  onSuccess,
  readOnly,
}: Props) {
  const { profile, refresh } = useMyProfessionalProfile();
  const initialUrl = profile?.imageUrl ?? null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(initialUrl);
  }, [initialUrl]);

  const handlePick = (uri: string) => {
    if (readOnly) return;
    setPendingUri(uri);
    setPreviewUrl(uri);
    setError(null);
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setError(null);

    if (!pendingUri) {
      setError('Modifica almeno un dettaglio prima di inviare.');
      return;
    }

    setBusy(true);
    try {
      const publicUrl = await saveProfessionalProfilePhoto(professionalId, pendingUri);
      await refresh();
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'upload',
        message: request.adminMessage ?? undefined,
        oldValue: initialUrl ? { image_url: initialUrl } : undefined,
        newValue: { image_url: publicUrl },
        attachmentUrl: publicUrl,
      });
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile aggiornare la foto profilo.');
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

  const submitLabel = otherPendingCount > 0 ? 'Salva e continua' : 'Invia modifica';

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.wrap}>
      <AppText style={styles.lead}>{request.friendlyReason || 'Aggiorniamo la foto profilo'}</AppText>
      <AppText style={styles.hint}>Carica una nuova foto nitida del volo o del logo.</AppText>
      {request.adminMessage ? <AppText style={styles.note}>{request.adminMessage}</AppText> : null}

      <View style={styles.previewWrap}>
        {previewUrl ? (
          <Image source={{ uri: previewUrl }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <AppText style={styles.placeholderText}>Nessuna foto profilo</AppText>
          </View>
        )}
      </View>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {readOnly ? (
        <View style={styles.reviewBanner}>
          <AppText style={styles.reviewText}>Correzione inviata — in revisione</AppText>
        </View>
      ) : (
        <>
          <ImagePickerActions onPick={handlePick} disabled={busy} />
          <PrimaryButton
            title={busy ? 'Caricamento…' : submitLabel}
            onPress={() => void handleSubmit()}
            disabled={busy || !pendingUri}
          />
          {busy ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.success} />
              <AppText style={styles.loadingText}>Stiamo caricando la foto…</AppText>
            </View>
          ) : null}
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
  previewWrap: { alignItems: 'center', marginVertical: 8 },
  preview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.success,
  },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  error: { fontSize: 13, color: Colors.error },
  reviewBanner: {
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
  },
  reviewText: { fontSize: 13, fontWeight: '600', color: Colors.pending },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
});
