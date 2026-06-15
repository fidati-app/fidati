import { useCallback, useEffect, useRef, useState } from 'react';

import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import type { VerificationStatus } from '@/types';
import {
  autoHideVerifiedCelebrationCard,
  dismissVerifiedCelebrationCard,
  getLastKnownVerificationStatus,
  markVerificationApprovedPopupShown,
  setLastKnownVerificationStatus,
  shouldShowVerificationApprovedPopup,
  shouldShowVerifiedCelebrationCard,
} from '@/utils/verificationUxStorage';

function approvalMarker(profileId: string, verified: boolean): string {
  return `${profileId}:verified:${verified ? '1' : '0'}`;
}

export function useHomeVerificationUx() {
  const { profile, profileId } = useMyProfessionalProfile();
  const prevStatusRef = useRef<VerificationStatus | null>(null);
  const verifiedCardSessionRef = useRef(false);

  const [approvedPopupVisible, setApprovedPopupVisible] = useState(false);
  const [verifiedCardVisible, setVerifiedCardVisible] = useState(false);
  const [verificationReviewModalVisible, setVerificationReviewModalVisible] = useState(false);

  const verificationStatus = profile?.verificationStatus ?? 'unverified';
  const isVerificationPending = verificationStatus === 'pending_review';
  const isVerified = verificationStatus === 'verified';

  useEffect(() => {
    if (!profileId) return;

    const current = verificationStatus;
    const previous = prevStatusRef.current;

    if (previous === current && prevStatusRef.current != null) {
      return;
    }

    if (__DEV__) {
      console.log('[HOME_VERIFICATION] status changed', previous, current);
    }

    void (async () => {
      if (current === 'verified') {
        const marker = approvalMarker(profileId, true);
        const showPopup = await shouldShowVerificationApprovedPopup(profileId, marker);
        const wasPending =
          previous === 'pending_review' ||
          (previous == null && (await getLastKnownVerificationStatus(profileId)) === 'pending_review');

        if (showPopup && wasPending) {
          setApprovedPopupVisible(true);
        } else if (await shouldShowVerifiedCelebrationCard(profileId)) {
          setVerifiedCardVisible(true);
        }
      }

      if (previous !== current) {
        prevStatusRef.current = current;
        await setLastKnownVerificationStatus(profileId, current);
      } else if (prevStatusRef.current == null) {
        prevStatusRef.current = current;
        await setLastKnownVerificationStatus(profileId, current);
      }
    })();
  }, [profileId, verificationStatus]);

  const handleApprovedPopupDismiss = useCallback(() => {
    if (profileId) {
      void markVerificationApprovedPopupShown(profileId, approvalMarker(profileId, true));
      void shouldShowVerifiedCelebrationCard(profileId).then((show) => {
        if (show) setVerifiedCardVisible(true);
      });
    }
    setApprovedPopupVisible(false);
  }, [profileId]);

  const dismissVerifiedCard = useCallback(() => {
    if (profileId) {
      void dismissVerifiedCelebrationCard(profileId);
    }
    setVerifiedCardVisible(false);
  }, [profileId]);

  const markVerifiedCardSeenForSession = useCallback(() => {
    if (!profileId || !verifiedCardVisible || verifiedCardSessionRef.current) return;
    verifiedCardSessionRef.current = true;
    void autoHideVerifiedCelebrationCard(profileId);
    setVerifiedCardVisible(false);
  }, [profileId, verifiedCardVisible]);

  const showVerificationReviewModal = useCallback(() => {
    setVerificationReviewModalVisible(true);
  }, []);

  const dismissVerificationReviewModal = useCallback(() => {
    setVerificationReviewModalVisible(false);
  }, []);

  return {
    verificationStatus,
    isVerificationPending,
    isVerified,
    isVerificationReviewModalVisible: verificationReviewModalVisible,
    approvedPopupVisible,
    verifiedCardVisible,
    handleApprovedPopupDismiss,
    dismissVerifiedCard,
    markVerifiedCardSeenForSession,
    showVerificationReviewModal,
    dismissVerificationReviewModal,
  };
}
