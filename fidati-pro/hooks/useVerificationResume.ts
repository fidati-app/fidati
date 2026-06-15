import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';

import { resolveFirstIncompleteVerificationRoute } from '@/constants/profileVerificationFlow';
import type { ProfileVerificationRoute } from '@/constants/profileVerificationFlow';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfileCompletionAssets } from '@/hooks/useProfileCompletionAssets';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { getVerificationContinuedSteps } from '@/services/verificationProgressStorage';

export function useVerificationResume() {
  const router = useRouter();
  const { profile, profileId } = useMyProfessionalProfile();
  const { verificationDocument, workPhotosCount, isReady: assetsReady } =
    useProfileCompletionAssets();
  const { schedule, isPersisted, isLoading: availabilityLoading } = useProfessionalAvailability();
  const [continuedSteps, setContinuedSteps] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setContinuedSteps([]);
      setStorageReady(false);
      return;
    }
    setStorageReady(false);
    void getVerificationContinuedSteps(profileId).then((steps) => {
      setContinuedSteps(steps);
      setStorageReady(true);
    });
  }, [profileId]);

  const resumeRoute = useMemo((): ProfileVerificationRoute | null => {
    if (!profile || !assetsReady || availabilityLoading || !storageReady) {
      return null;
    }
    return resolveFirstIncompleteVerificationRoute({
      profile,
      verificationDocument,
      workPhotosCount,
      schedule,
      availabilityPersisted: isPersisted,
      continuedSteps: continuedSteps as import('@/constants/profileVerificationFlow').ProfileVerificationStepId[],
      verificationStatus: profile.verificationStatus,
    });
  }, [
    assetsReady,
    availabilityLoading,
    continuedSteps,
    isPersisted,
    profile,
    schedule,
    storageReady,
    verificationDocument,
    workPhotosCount,
  ]);

  const navigateToResume = useCallback(() => {
    if (!resumeRoute) return;
    router.push(resumeRoute);
  }, [resumeRoute, router]);

  const isReady = Boolean(profileId) && assetsReady && !availabilityLoading && storageReady;

  return {
    resumeRoute,
    isReady,
    navigateToResume,
  };
}
