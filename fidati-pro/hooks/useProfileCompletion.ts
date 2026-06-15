import { useMemo } from 'react';

import { PROFILE_STEP_TOTAL, PROFILE_STEPS, ProfileStepId } from '@/constants/profileSteps';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfileCompletionAssets } from '@/hooks/useProfileCompletionAssets';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import {
  canRequestVerification,
  isProfileStepComplete,
  isVerificationSubmissionLocked,
} from '@/utils/profileCompletionChecks';
import { computeProfileCompletionPercent } from '@/utils/profileCompletionPercent';

export const VERIFICATION_PREREQUISITE_IDS: ProfileStepId[] = [
  'photo',
  'documents',
  'portfolio',
  'availability',
  'urgent_jobs',
];

export interface ProfileCompletionStepView {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  route: string;
  label: string;
  done: boolean;
}

export function useProfileCompletion() {
  const { profile, profileId, isLoading: profileLoading } = useMyProfessionalProfile();
  const {
    hasValidAvailability,
    availableDaysCount,
    acceptsUrgentJobs,
    isPersisted,
    isLoading: availabilityLoading,
  } = useProfessionalAvailability();
  const {
    verificationDocument,
    workPhotosCount,
    isLoading: assetsLoading,
    isReady: assetsReady,
    refresh: refreshAssets,
  } = useProfileCompletionAssets();

  const isLoading =
    profileLoading || (Boolean(profileId) && (!assetsReady || availabilityLoading || assetsLoading));

  return useMemo(() => {
    const steps: ProfileCompletionStepView[] = PROFILE_STEPS.map((step, index) => {
      const stepNumber = index + 1;
      const done = isProfileStepComplete(
        step.id,
        profile,
        hasValidAvailability,
        verificationDocument,
        workPhotosCount,
        isPersisted,
      );

      return {
        id: step.id,
        stepNumber,
        title: step.title,
        subtitle: step.subtitle,
        route: step.route,
        label: `${stepNumber} di ${PROFILE_STEP_TOTAL} ${step.title}`,
        done,
      };
    });

    const percent = computeProfileCompletionPercent({
      profile,
      hasValidAvailability,
      acceptsUrgentJobsConfigured: isPersisted,
      verificationDocument,
      workPhotosCount,
    });

    const pending = steps.filter((step) => !step.done);

    const nextStep = pending[0] ?? null;

    const prerequisiteSteps = steps.filter((step) =>
      VERIFICATION_PREREQUISITE_IDS.includes(step.id as ProfileStepId),
    );

    const status = profile?.verificationStatus ?? 'unverified';
    const canSubmitVerification = canRequestVerification({
      profile,
      hasValidAvailability,
      verificationDocument,
      workPhotosCount,
    });
    const verificationLocked = isVerificationSubmissionLocked(status);

    return {
      percent,
      completedCount: steps.filter((step) => step.done).length,
      total: PROFILE_STEP_TOTAL,
      steps,
      pending,
      nextStep,
      verificationReady: VERIFICATION_PREREQUISITE_IDS.every((id) =>
        steps.find((step) => step.id === id)?.done,
      ),
      canSubmitVerification,
      verificationLocked,
      prerequisiteSteps,
      nextSuggestion: nextStep
        ? { id: nextStep.id, label: nextStep.label, route: nextStep.route, done: nextStep.done }
        : null,
      verificationStatus: profile?.verificationStatus ?? 'unverified',
      availabilitySummary: {
        availableDaysCount,
        acceptsUrgentJobs,
        isLoading: availabilityLoading,
      },
      isLoading,
      refreshAssets,
    };
  }, [
    acceptsUrgentJobs,
    assetsLoading,
    assetsReady,
    availabilityLoading,
    availableDaysCount,
    hasValidAvailability,
    isPersisted,
    isLoading,
    profile,
    profileId,
    profileLoading,
    refreshAssets,
    verificationDocument,
    workPhotosCount,
  ]);
}
