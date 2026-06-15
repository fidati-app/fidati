import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { pickImageFromLibrary } from '@/components/profile/ImagePickerActions';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CorrectionSuccessSequence } from '@/components/change-requests/CorrectionSuccessSequence';
import { submitChangeRequestResponse } from '@/services/changeRequestResponseService';
import type { AdminChangeRequest } from '@/services/professionalInternalNotificationsService';
import { replaceWorkPhoto, type WorkPhoto } from '@/services/professionalWorkPhotosService';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import {
  logPortfolioChangeRequest,
  logPortfolioError,
  normalizeImageUrl,
  PORTFOLIO_UPLOAD_USER_ERROR,
  resolvePortfolioChangeTarget,
} from '@/utils/portfolioChangeRequestResolver';

type Props = {
  request: AdminChangeRequest;
  professionalId: string;
  otherPendingCount: number;
  onSuccess: () => void;
  readOnly?: boolean;
};

export function PortfolioFixFlow({
  request,
  professionalId,
  otherPendingCount,
  onSuccess,
  readOnly,
}: Props) {
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [needsManualSelection, setNeedsManualSelection] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTarget = useCallback(async () => {
    setLoadingPhoto(true);
    setError(null);
    try {
      logPortfolioChangeRequest(request);
      const resolved = await resolvePortfolioChangeTarget(request, professionalId);
      setPhotos(resolved.photos);
      setNeedsManualSelection(resolved.needsManualSelection);
      setSelectedPhotoId(resolved.resolvedPhotoId);
      setPreviewUrl(normalizeImageUrl(resolved.targetPhoto?.imageUrl ?? null));

      if (__DEV__) {
        console.log('[Fidati Pro PortfolioFix] photoId risolto:', resolved.resolvedPhotoId);
      }
    } catch (err) {
      logPortfolioError('resolveTarget', err);
      setError(PORTFOLIO_UPLOAD_USER_ERROR);
    } finally {
      setLoadingPhoto(false);
    }
  }, [request, professionalId]);

  useEffect(() => {
    void loadTarget();
  }, [loadTarget]);

  const activePhotoId = selectedPhotoId;
  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;

  useEffect(() => {
    if (activePhoto) {
      setPreviewUrl(normalizeImageUrl(activePhoto.imageUrl));
    }
  }, [activePhoto?.id, activePhoto?.imageUrl]);

  const handleSelectPhoto = (photo: WorkPhoto) => {
    setSelectedPhotoId(photo.id);
    setPreviewUrl(normalizeImageUrl(photo.imageUrl));
    setError(null);
  };

  const handlePick = async () => {
    if (readOnly) return;

    if (!activePhotoId) {
      setError('Seleziona prima la foto che vuoi sostituire.');
      return;
    }

    setError(null);
    let uri: string | null = null;
    try {
      uri = await pickImageFromLibrary([4, 3]);
    } catch (pickerErr) {
      logPortfolioError('ImagePicker', pickerErr);
      setError(PORTFOLIO_UPLOAD_USER_ERROR);
      return;
    }

    if (!uri) return;

    setBusy(true);
    try {
      if (__DEV__) {
        console.log('[Fidati Pro PortfolioFix] sostituzione foto', { photoId: activePhotoId, uri });
      }

      const updated = await replaceWorkPhoto(activePhotoId, professionalId, uri);
      await submitChangeRequestResponse({
        notificationId: request.id,
        responseType: 'upload',
        message: request.adminMessage ?? undefined,
        oldValue: previewUrl ? { image_url: previewUrl, photo_id: activePhotoId } : { photo_id: activePhotoId },
        newValue: { image_url: updated.imageUrl, photo_id: updated.id },
        attachmentUrl: updated.imageUrl,
      });
      setPreviewUrl(updated.imageUrl);
      setShowSuccess(true);
    } catch (err) {
      logPortfolioError('replaceAndSubmit', err);
      setError(PORTFOLIO_UPLOAD_USER_ERROR);
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

  const showPickerGrid = needsManualSelection && photos.length > 0;
  const showEmptyPortfolio = !loadingPhoto && photos.length === 0;

  return (
    <Animated.View entering={FadeInDown.duration(350)} style={styles.wrap}>
      <AppText style={styles.lead}>{request.friendlyReason}</AppText>
      <AppText style={styles.hint}>{request.friendlyHint}</AppText>

      {loadingPhoto ? (
        <ActivityIndicator color={Colors.success} style={{ marginVertical: 24 }} />
      ) : (
        <>
          {previewUrl ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: previewUrl }} style={styles.preview} contentFit="cover" />
            </View>
          ) : showEmptyPortfolio ? (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="images-outline" size={32} color={Colors.textMuted} />
              <AppText style={styles.placeholderText}>
                Non hai ancora foto nel portfolio. Aggiungine una dalla sezione Portfolio.
              </AppText>
            </View>
          ) : showPickerGrid ? (
            <View style={styles.pickerBlock}>
              <AppText style={styles.pickerTitle}>
                Non riusciamo a riconoscere automaticamente la foto. Scegli quale foto vuoi
                sostituire.
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
                {photos.map((photo) => {
                  const selected = photo.id === selectedPhotoId;
                  return (
                    <Pressable
                      key={photo.id}
                      style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                      onPress={() => handleSelectPhoto(photo)}
                    >
                      <Image source={{ uri: photo.imageUrl }} style={styles.pickerThumb} contentFit="cover" />
                      {selected ? (
                        <View style={styles.pickerCheck}>
                          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="images-outline" size={32} color={Colors.textMuted} />
              <AppText style={styles.placeholderText}>
                Non riusciamo a riconoscere automaticamente la foto. Scegli quale foto vuoi
                sostituire qui sotto.
              </AppText>
            </View>
          )}

          {showPickerGrid && selectedPhotoId && previewUrl ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: previewUrl }} style={styles.preview} contentFit="cover" />
            </View>
          ) : null}
        </>
      )}

      {request.adminMessage ? (
        <AppText style={styles.note}>{request.adminMessage}</AppText>
      ) : null}

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {readOnly ? (
        <View style={styles.reviewBanner}>
          <Ionicons name="time-outline" size={18} color={Colors.pending} />
          <AppText style={styles.reviewText}>Correzione inviata — in revisione dal team Fidati</AppText>
        </View>
      ) : (
        <PrimaryButton
          title={busy ? 'Caricamento…' : 'Cambia foto'}
          onPress={() => void handlePick()}
          disabled={busy || loadingPhoto || showEmptyPortfolio || !activePhotoId}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  lead: { fontSize: 17, fontWeight: '700', color: Colors.navy, lineHeight: 24 },
  hint: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  previewWrap: {
    alignSelf: 'center',
    width: 160,
    height: 120,
    borderRadius: Design.radius.md,
    borderWidth: 2,
    borderColor: Colors.error,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  preview: { width: '100%', height: '100%' },
  previewPlaceholder: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    minHeight: 100,
    borderRadius: Design.radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  placeholderText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  pickerBlock: { gap: 10 },
  pickerTitle: { fontSize: 14, lineHeight: 20, color: Colors.navy, fontWeight: '600' },
  pickerRow: { gap: 10, paddingVertical: 4 },
  pickerItem: {
    width: 88,
    height: 88,
    borderRadius: Design.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  pickerItemSelected: { borderColor: Colors.success },
  pickerThumb: { width: '100%', height: '100%' },
  pickerCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    backgroundColor: Colors.pendingSoft,
    padding: 12,
    borderRadius: Design.radius.md,
    lineHeight: 19,
  },
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
