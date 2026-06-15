import { useCallback, useEffect, useState } from 'react';

import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import {
  fetchVerificationDocument,
  VerificationDocument,
} from '@/services/professionalVerificationService';
import { fetchWorkPhotos, WorkPhoto } from '@/services/professionalWorkPhotosService';

export function useProfileCompletionAssets() {
  const { profileId } = useMyProfessionalProfile();
  const [verificationDocument, setVerificationDocument] = useState<VerificationDocument | null>(null);
  const [workPhotos, setWorkPhotos] = useState<WorkPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setVerificationDocument(null);
      setWorkPhotos([]);
      setIsLoading(false);
      setIsReady(false);
      return;
    }

    setIsLoading(true);
    setIsReady(false);
    setError(null);
    try {
      const [doc, photos] = await Promise.all([
        fetchVerificationDocument(profileId),
        fetchWorkPhotos(profileId),
      ]);
      setVerificationDocument(doc);
      setWorkPhotos(photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento dati profilo.');
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, [profileId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    verificationDocument,
    workPhotos,
    workPhotosCount: workPhotos.length,
    isLoading,
    isReady,
    error,
    refresh,
  };
}
