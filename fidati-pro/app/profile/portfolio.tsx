import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { ConfirmDialog } from '@/components/profile/ConfirmDialog';
import { pickImageFromLibrary, pickMultipleImagesFromLibrary } from '@/components/profile/ImagePickerActions';
import { ProfileCompletionShell } from '@/components/profile/ProfileCompletionShell';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { workPhotoTitlePlaceholder } from '@/constants/workPhotos';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import { getNextVerificationRoute } from '@/constants/profileVerificationFlow';
import { markVerificationStepContinued } from '@/services/verificationProgressStorage';
import {
  addWorkPhoto,
  addWorkPhotos,
  fetchWorkPhotos,
  MAX_WORK_PHOTOS,
  MIN_WORK_PHOTOS,
  removeWorkPhoto,
  reorderWorkPhoto,
  updateWorkPhotoTitle,
  WorkPhoto,
} from '@/services/professionalWorkPhotosService';

function WorkPhotoCard({
  photo,
  index,
  total,
  onPreview,
  onTitleChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  isBusy,
  onDescriptionFocus,
  isLast,
}: {
  photo: WorkPhoto;
  index: number;
  total: number;
  onPreview: () => void;
  onTitleChange: (title: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  isBusy: boolean;
  onDescriptionFocus?: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={styles.photoCard}>
      <View style={styles.photoCardTop}>
        <AppText style={styles.photoIndex}>#{index + 1}</AppText>
        <View style={styles.photoActions}>
          <Pressable
            style={[styles.iconBtn, index === 0 && styles.iconBtnDisabled]}
            onPress={onMoveUp}
            disabled={isBusy || index === 0}
            hitSlop={6}
          >
            <Ionicons name="chevron-up" size={16} color={Colors.navy} />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, index === total - 1 && styles.iconBtnDisabled]}
            onPress={onMoveDown}
            disabled={isBusy || index === total - 1}
            hitSlop={6}
          >
            <Ionicons name="chevron-down" size={16} color={Colors.navy} />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.previewThumb} onPress={onPreview} disabled={isBusy}>
        <Image source={{ uri: photo.imageUrl }} style={styles.previewImage} contentFit="cover" />
      </Pressable>

      <AuthFormField
        label="Descrizione"
        value={photo.title ?? ''}
        onChangeText={onTitleChange}
        placeholder={workPhotoTitlePlaceholder(index)}
        autoCapitalize="sentences"
        icon="create-outline"
        editable={!isBusy}
        onFocus={isLast ? onDescriptionFocus : undefined}
      />

      <View style={styles.tileActions}>
        <Pressable style={styles.iconBtnDanger} onPress={onRemove} disabled={isBusy} hitSlop={6}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ProfilePortfolioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profileId, refresh } = useMyProfessionalProfile();
  const [photos, setPhotos] = useState<WorkPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadPlaceholders, setUploadPlaceholders] = useState<string[]>([]);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [pendingRemove, setPendingRemove] = useState<WorkPhoto | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<WorkPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { revealed, reveal } = useRevealContinue();

  const loadPhotos = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      setPhotos(await fetchWorkPhotos(profileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento foto.');
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  if (!profileId) return null;

  const isComplete = photos.length >= MIN_WORK_PHOTOS;

  const handleAdd = async () => {
    const remaining = MAX_WORK_PHOTOS - photos.length;
    if (remaining <= 0) return;
    setError(null);
    setUploadWarnings([]);
    setIsUploading(true);
    setUploadProgress({ done: 0, total: 0 });
    try {
      const uris = await pickMultipleImagesFromLibrary(remaining);
      if (!uris.length) return;
      if (uris.length > remaining) {
        setError('Puoi caricare al massimo 6 foto.');
        return;
      }
      setUploadPlaceholders(uris);
      setUploadProgress({ done: 0, total: uris.length });
      const { photos: uploaded, errors: uploadErrors } = await addWorkPhotos(
        profileId,
        uris,
        (done, total) => setUploadProgress({ done, total }),
      );
      setPhotos((current) => [...current, ...uploaded]);
      if (uploadErrors.length > 0) {
        setUploadWarnings(uploadErrors);
        setError(
          uploadErrors.length === 1
            ? `1 foto non caricata: ${uploadErrors[0]}`
            : `${uploadErrors.length} foto non caricate. Le altre sono state salvate.`,
        );
      }
      if (uploaded.length > 0) {
        reveal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile caricare le foto.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      setUploadPlaceholders([]);
    }
  };

  const handleTitleChange = (photoId: string, title: string) => {
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, title } : photo)),
    );
  };

  const handleReorder = async (photoId: string, direction: 'up' | 'down') => {
    setBusyId(photoId);
    setError(null);
    try {
      const next = await reorderWorkPhoto(profileId, photoId, direction);
      setPhotos(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile riordinare.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async () => {
    if (!pendingRemove) return;
    setBusyId(pendingRemove.id);
    try {
      await removeWorkPhoto(pendingRemove);
      setPhotos((current) => current.filter((p) => p.id !== pendingRemove.id));
      setPendingRemove(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile rimuovere la foto.');
    } finally {
      setBusyId(null);
    }
  };

  const handleContinue = async () => {
    if (!isComplete) {
      setError(`Carica almeno ${MIN_WORK_PHOTOS} foto di un tuo lavoro per continuare.`);
      return;
    }
    setError(null);
    try {
      await Promise.all(photos.map((photo) => updateWorkPhotoTitle(photo.id, photo.title)));
      await refresh();
      await markVerificationStepContinued(profileId, 'portfolio');
      const next = getNextVerificationRoute('/profile/portfolio');
      router.replace((next ?? '/(tabs)') as '/profile/availability');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare le foto.');
    }
  };

  return (
    <>
      <ProfileCompletionShell
        stepNumber={3}
        title="Foto dei tuoi lavori 🛠️"
        subtitle="Mostra ai clienti alcuni lavori che hai realizzato."
        footerRevealed={revealed}
        footer={
          <RevealContinueFooter
            visible={revealed}
            title="Continua"
            onPress={handleContinue}
            disabled={!isComplete || isUploading || Boolean(busyId)}
          />
        }
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.flex}>
          <View style={styles.intro}>
            <AppText style={styles.introText}>
              I professionisti con foto reali ricevono più richieste e trasmettono maggiore fiducia.
            </AppText>
            <AppText style={styles.introRequired}>
              Almeno 1 foto obbligatoria · massimo {MAX_WORK_PHOTOS}
            </AppText>
          </View>

          {isUploading ? (
            <View style={styles.uploadBanner}>
              <ActivityIndicator color={Colors.navy} />
              <View style={styles.uploadBannerCopy}>
                <AppText style={styles.uploadBannerTitle}>Stiamo caricando le foto…</AppText>
                {uploadProgress && uploadProgress.total > 0 ? (
                  <AppText style={styles.uploadBannerMeta}>
                    Caricamento {Math.min(uploadProgress.done + 1, uploadProgress.total)} di{' '}
                    {uploadProgress.total}
                  </AppText>
                ) : null}
              </View>
            </View>
          ) : null}

          {isLoading ? (
            <ActivityIndicator color={Colors.navy} style={styles.loader} />
          ) : photos.length > 0 ? (
            <View>
              <View style={styles.grid}>
                {photos.map((photo, index) => (
                  <WorkPhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    total={photos.length}
                    isBusy={busyId === photo.id || isUploading}
                    isLast={index === photos.length - 1}
                    onDescriptionFocus={reveal}
                    onPreview={() => setPreviewPhoto(photo)}
                    onTitleChange={(title) => handleTitleChange(photo.id, title)}
                    onMoveUp={() => void handleReorder(photo.id, 'up')}
                    onMoveDown={() => void handleReorder(photo.id, 'down')}
                    onRemove={() => setPendingRemove(photo)}
                  />
                ))}
                {uploadPlaceholders.map((uri, index) => (
                  <View key={`pending-${uri}-${index}`} style={styles.pendingCard}>
                    <Image source={{ uri }} style={styles.pendingImage} contentFit="cover" />
                    <View style={styles.pendingOverlay}>
                      <ActivityIndicator color={Colors.white} />
                      <AppText style={styles.pendingLabel}>
                        {uploadProgress
                          ? `Caricamento ${Math.min(uploadProgress.done + 1, uploadProgress.total)} di ${uploadProgress.total}`
                          : 'Caricamento…'}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
              {photos.length < MAX_WORK_PHOTOS ? (
                <PrimaryButton
                  title={isUploading ? 'Caricamento…' : 'Aggiungi foto'}
                  variant="outline"
                  onPress={() => void handleAdd()}
                  disabled={isUploading || Boolean(busyId)}
                  style={styles.addMoreBtn}
                />
              ) : null}
            </View>
          ) : (
            <Pressable style={styles.empty} onPress={() => void handleAdd()} disabled={isUploading}>
              <Ionicons name="images-outline" size={36} color={Colors.textMuted} />
              <AppText style={styles.emptyTitle}>Aggiungi la tua prima foto</AppText>
              <AppText style={styles.emptyText}>
                Carica almeno una foto reale di un lavoro svolto. Puoi aggiungere un titolo breve.
              </AppText>
            </Pressable>
          )}

          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          {uploadWarnings.length > 0 && !isUploading ? (
            <AppText style={styles.warning}>
              Alcune foto non sono state caricate. Puoi riprovare con «Aggiungi foto».
            </AppText>
          ) : null}
        </ScrollView>
      </ProfileCompletionShell>

      <ConfirmDialog
        visible={Boolean(pendingRemove)}
        title="Rimuovere questa foto?"
        message={
          photos.length <= MIN_WORK_PHOTOS
            ? 'Serve almeno una foto lavori per richiedere la verifica Fidati.'
            : 'La foto verrà eliminata dal tuo portfolio.'
        }
        confirmLabel="Rimuovi"
        onConfirm={() => void handleRemove()}
        onCancel={() => setPendingRemove(null)}
        loading={Boolean(busyId)}
      />

      <Modal visible={Boolean(previewPhoto)} animationType="fade" onRequestClose={() => setPreviewPhoto(null)}>
        <View style={[styles.previewModal, { paddingTop: insets.top }]}>
          <Pressable style={styles.previewClose} onPress={() => setPreviewPhoto(null)} hitSlop={12}>
            <Ionicons name="close" size={28} color={Colors.white} />
          </Pressable>
          {previewPhoto ? (
            <>
              <Image source={{ uri: previewPhoto.imageUrl }} style={styles.previewFull} contentFit="contain" />
              {previewPhoto.title ? (
                <View style={[styles.previewCaption, { paddingBottom: insets.bottom + 16 }]}>
                  <AppText style={styles.previewCaptionText}>{previewPhoto.title}</AppText>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: 6,
    marginBottom: 18,
  },
  introText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  introRequired: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  loader: { marginVertical: 24 },
  uploadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 14,
  },
  uploadBannerCopy: {
    flex: 1,
    gap: 2,
  },
  uploadBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
  },
  uploadBannerMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    gap: 8,
    ...Design.shadowSoft,
  },
  photoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: { opacity: 0.35 },
  iconBtnDanger: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Design.radius.md,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  tileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: Design.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.white,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  warning: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.pending,
    lineHeight: 17,
  },
  pendingCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Design.radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  pendingImage: {
    width: '100%',
    height: '100%',
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 37, 74, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  pendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  footer: { gap: 10 },
  addMoreBtn: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  flex: { flex: 1 },
  previewModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 2,
  },
  previewFull: {
    flex: 1,
    width: '100%',
  },
  previewCaption: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewCaptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
});
