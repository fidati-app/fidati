import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ImagePickerActions } from '@/components/profile/ImagePickerActions';
import { ProfileCompletionShell } from '@/components/profile/ProfileCompletionShell';
import { AppText } from '@/components/AppText';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { getNextVerificationRoute } from '@/constants/profileVerificationFlow';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import { saveProfessionalProfilePhoto } from '@/services/professionalProfilePhotoService';
import { markVerificationStepContinued } from '@/services/verificationProgressStorage';

export default function ProfilePhotoScreen() {
  const router = useRouter();
  const { profile, profileId, refresh } = useMyProfessionalProfile();
  const [previewUri, setPreviewUri] = useState<string | null>(profile?.imageUrl ?? null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState(!profile?.imageUrl);
  const { revealed, reveal } = useRevealContinue();

  if (!profile || !profileId) return null;

  const hasPreview = Boolean(previewUri);
  const showPicker = !hasPreview || editingPhoto;

  const handleSave = async () => {
    if (!localUri) {
      if (profile.imageUrl) {
        await markVerificationStepContinued(profileId, 'photo');
        const next = getNextVerificationRoute('/profile/photo');
        router.replace((next ?? '/profile/documents') as '/profile/documents');
        return;
      }
      setError('Seleziona una foto per continuare.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await saveProfessionalProfilePhoto(profileId, localUri);
      await refresh();
      await markVerificationStepContinued(profileId, 'photo');
      setEditingPhoto(false);
      const next = getNextVerificationRoute('/profile/photo');
      router.replace((next ?? '/profile/documents') as '/profile/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare la foto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProfileCompletionShell
      stepNumber={1}
      title="Aggiungiamo una foto al tuo profilo 📷"
      subtitle="I clienti si fidano di più quando vedono un volto o un logo riconoscibile."
      footerRevealed={revealed}
      footer={
        <RevealContinueFooter
          visible={revealed}
          title={isSaving ? 'Salvataggio…' : 'Salva e continua'}
          onPress={() => void handleSave()}
          disabled={isSaving || (!localUri && !profile.imageUrl)}
          loading={isSaving}
        />
      }
    >
      <View style={styles.previewWrap}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <AppText style={styles.placeholderText}>Nessuna foto ancora</AppText>
          </View>
        )}
      </View>

      {showPicker ? (
        <ImagePickerActions
          disabled={isSaving}
          onPick={(uri) => {
            setLocalUri(uri);
            setPreviewUri(uri);
            setEditingPhoto(false);
            setError(null);
            reveal();
          }}
        />
      ) : (
        <Pressable
          style={styles.editBtn}
          onPress={() => setEditingPhoto(true)}
          disabled={isSaving}
        >
          <AppText style={styles.editBtnText}>Modifica foto</AppText>
        </Pressable>
      )}

      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      {isSaving ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.navy} />
          <AppText style={styles.loadingText}>Stiamo caricando la tua foto…</AppText>
        </View>
      ) : null}
    </ProfileCompletionShell>
  );
}

const styles = StyleSheet.create({
  previewWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  preview: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.success,
  },
  placeholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  editBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  error: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
