import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAdminChangeRequests } from '@/contexts/AdminChangeRequestsContext';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import type { ClientVisibilityStatus } from '@/types';
import { markVisibilityApprovedNotificationsRead } from '@/services/professionalInternalNotificationsService';
import {
  getLastKnownVisibility,
  markVisibilityCelebrationShown,
  setLastKnownVisibility,
  shouldShowVisibilityCelebration,
} from '@/utils/clientVisibilityCelebrationStorage';

type BlockReason = Extract<ClientVisibilityStatus, 'hidden_changes' | 'pending_review'>;

async function evaluateVisibilityCelebration(
  profileId: string,
  current: ClientVisibilityStatus,
  changedAt: string | null | undefined,
  previous: ClientVisibilityStatus | null,
): Promise<boolean> {
  if (current !== 'visible') return false;

  const lastStored = await getLastKnownVisibility(profileId);
  const wasHidden =
    (previous != null && previous !== 'visible') ||
    (lastStored != null && lastStored !== 'visible');

  if (!wasHidden) return false;
  return shouldShowVisibilityCelebration(profileId, changedAt);
}

export function useHomeVisibilityUx() {
  const router = useRouter();
  const { profile, profileId } = useMyProfessionalProfile();
  const { requests } = useAdminChangeRequests();

  const prevVisibilityRef = useRef<ClientVisibilityStatus | null>(null);
  const persistedVisibilityRef = useRef<ClientVisibilityStatus | null>(null);
  const celebrationCheckedForRef = useRef<string | null>(null);

  const [acceptedPopupVisible, setAcceptedPopupVisible] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [blockedReason, setBlockedReason] = useState<BlockReason | null>(null);

  const visibilityStatus = profile?.clientVisibilityStatus ?? 'visible';
  const isClientVisible = visibilityStatus === 'visible';
  const visibilityChangedAt = profile?.clientVisibilityChangedAt ?? null;

  useEffect(() => {
    if (!profileId) return;

    const current = visibilityStatus;
    const previous = prevVisibilityRef.current;

    if (previous === current && persistedVisibilityRef.current === current) {
      return;
    }

    if (__DEV__) {
      console.log('[VISIBILITY] status sync', previous, '→', current);
    }

    const celebrationKey = `${profileId}:${visibilityChangedAt ?? 'none'}:${current}`;
    const shouldCheckCelebration =
      current === 'visible' &&
      celebrationCheckedForRef.current !== celebrationKey &&
      (previous !== current || previous == null);

    if (shouldCheckCelebration) {
      celebrationCheckedForRef.current = celebrationKey;
      void evaluateVisibilityCelebration(profileId, current, visibilityChangedAt, previous).then(
        (show) => {
          if (show) {
            setAcceptedPopupVisible(true);
          }
        },
      );
    }

    if (previous !== current) {
      prevVisibilityRef.current = current;
      if (persistedVisibilityRef.current !== current) {
        persistedVisibilityRef.current = current;
        void setLastKnownVisibility(profileId, current);
      }
    } else if (prevVisibilityRef.current == null) {
      prevVisibilityRef.current = current;
      if (persistedVisibilityRef.current !== current) {
        persistedVisibilityRef.current = current;
        void setLastKnownVisibility(profileId, current);
      }
    }
  }, [profileId, visibilityStatus, visibilityChangedAt]);

  const handleAcceptedDismiss = useCallback(() => {
    if (profileId && visibilityChangedAt) {
      void markVisibilityCelebrationShown(profileId, visibilityChangedAt);
      void markVisibilityApprovedNotificationsRead(profileId);
    }
    setAcceptedPopupVisible(false);
    setCelebrating(true);
  }, [profileId, visibilityChangedAt]);

  const handleCelebrationComplete = useCallback(() => {
    setCelebrating(false);
  }, []);

  const handleAvailabilityChange = useCallback(
    (
      value: boolean,
      setAvailable: (v: boolean) => void,
      setShowAvailableToast: (v: boolean) => void,
      available: boolean,
    ) => {
      if (visibilityStatus !== 'visible') {
        if (__DEV__) {
          console.log('[TOGGLE] blocked reason', visibilityStatus);
        }
        setBlockedReason(
          visibilityStatus === 'pending_review' ? 'pending_review' : 'hidden_changes',
        );
        return;
      }

      if (!value) {
        setShowAvailableToast(false);
      } else if (!available) {
        setShowAvailableToast(true);
      }
      setAvailable(value);
    },
    [visibilityStatus],
  );

  const showVisibilityBlockedModal = useCallback(
    (reason: BlockReason) => {
      if (__DEV__) {
        console.log('[TOGGLE] blocked reason', reason);
      }
      setBlockedReason(reason);
    },
    [],
  );

  const handleBlockedFixNow = useCallback(() => {
    const first = requests.find((r) => !r.isInReview);
    if (first) {
      router.push({ pathname: '/change-requests/[id]', params: { id: first.id } });
    } else {
      router.push('/(tabs)/profile');
    }
  }, [requests, router]);

  const dismissBlockedModal = useCallback(() => {
    setBlockedReason(null);
  }, []);

  return {
    visibilityStatus,
    isClientVisible,
    acceptedPopupVisible,
    celebrating,
    blockedReason,
    handleAcceptedDismiss,
    handleCelebrationComplete,
    handleAvailabilityChange,
    handleBlockedFixNow,
    dismissBlockedModal,
    showVisibilityBlockedModal,
  };
}
