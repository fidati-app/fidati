import { ProfileStepId } from '@/constants/profileSteps';
import { VerificationDocument } from '@/services/professionalVerificationService';
import { MyProfessional } from '@/types';
import { isProfileStepComplete } from '@/utils/profileCompletionChecks';

export const PROFILE_COMPLETION_WEIGHTS: Record<ProfileStepId, number> = {
  photo: 20,
  documents: 20,
  portfolio: 20,
  availability: 20,
  urgent_jobs: 20,
};

export function computeProfileCompletionPercent(input: {
  profile: MyProfessional | null;
  hasValidAvailability: boolean;
  acceptsUrgentJobsConfigured: boolean;
  verificationDocument: VerificationDocument | null;
  workPhotosCount: number;
}): number {
  const {
    profile,
    hasValidAvailability,
    acceptsUrgentJobsConfigured,
    verificationDocument,
    workPhotosCount,
  } = input;

  let percent = 0;

  for (const stepId of Object.keys(PROFILE_COMPLETION_WEIGHTS) as ProfileStepId[]) {
    if (
      isProfileStepComplete(
        stepId,
        profile,
        hasValidAvailability,
        verificationDocument,
        workPhotosCount,
        acceptsUrgentJobsConfigured,
      )
    ) {
      percent += PROFILE_COMPLETION_WEIGHTS[stepId];
    }
  }

  return Math.min(100, percent);
}
