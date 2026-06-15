import { VerificationDocument } from '@/services/professionalVerificationService';
import { MyProfessional, VerificationStatus } from '@/types';
import { isVerificationDocumentComplete } from '@/services/professionalVerificationService';
import { hasValidWeeklyAvailability } from '@/utils/availabilityValidation';
import { WeeklyScheduleDay } from '@/types';

export const PROFILE_VERIFICATION_STEP_TOTAL = 5;

export type ProfileVerificationStepId =
  | 'photo'
  | 'documents'
  | 'portfolio'
  | 'availability'
  | 'urgent_jobs';

export const PROFILE_VERIFICATION_ROUTES = [
  '/profile/photo',
  '/profile/documents',
  '/profile/portfolio',
  '/profile/availability',
  '/profile/urgent-jobs',
] as const;

export type ProfileVerificationRoute = (typeof PROFILE_VERIFICATION_ROUTES)[number];

const STEP_ROUTE_MAP: Record<ProfileVerificationStepId, ProfileVerificationRoute> = {
  photo: '/profile/photo',
  documents: '/profile/documents',
  portfolio: '/profile/portfolio',
  availability: '/profile/availability',
  urgent_jobs: '/profile/urgent-jobs',
};

export const PROFILE_VERIFICATION_STEP_ORDER: ProfileVerificationStepId[] = [
  'photo',
  'documents',
  'portfolio',
  'availability',
  'urgent_jobs',
];

export function getVerificationStepNumber(route: string): number {
  const index = PROFILE_VERIFICATION_ROUTES.indexOf(route as ProfileVerificationRoute);
  return index >= 0 ? index + 1 : 1;
}

export function getNextVerificationRoute(currentRoute: string): ProfileVerificationRoute | null {
  const index = PROFILE_VERIFICATION_ROUTES.indexOf(currentRoute as ProfileVerificationRoute);
  if (index < 0 || index >= PROFILE_VERIFICATION_ROUTES.length - 1) {
    return null;
  }
  return PROFILE_VERIFICATION_ROUTES[index + 1];
}

export function routeForVerificationStep(stepId: ProfileVerificationStepId): ProfileVerificationRoute {
  return STEP_ROUTE_MAP[stepId];
}

export interface VerificationResumeInput {
  profile: MyProfessional | null;
  verificationDocument: VerificationDocument | null;
  workPhotosCount: number;
  schedule: WeeklyScheduleDay[];
  availabilityPersisted: boolean;
  continuedSteps: ProfileVerificationStepId[];
  verificationStatus?: VerificationStatus;
}

/** Primo step non completato (dati reali + step esplicitamente continuati). */
export function resolveFirstIncompleteVerificationRoute(
  input: VerificationResumeInput,
): ProfileVerificationRoute | null {
  const status = input.verificationStatus ?? input.profile?.verificationStatus ?? 'unverified';
  if (status === 'pending_review' || status === 'verified') {
    return null;
  }

  const continued = new Set(input.continuedSteps);

  const stepReady: Record<ProfileVerificationStepId, boolean> = {
    photo: Boolean(input.profile?.imageUrl),
    documents: isVerificationDocumentComplete(input.verificationDocument),
    portfolio: input.workPhotosCount >= 1,
    availability:
      input.availabilityPersisted && hasValidWeeklyAvailability(input.schedule),
    urgent_jobs: true,
  };

  for (const stepId of PROFILE_VERIFICATION_STEP_ORDER) {
    if (!continued.has(stepId)) {
      return routeForVerificationStep(stepId);
    }
    if (!stepReady[stepId]) {
      return routeForVerificationStep(stepId);
    }
  }

  return routeForVerificationStep('urgent_jobs');
}

/** @deprecated Usa resolveFirstIncompleteVerificationRoute con dati reali. */
export function getVerificationStartRoute(): ProfileVerificationRoute {
  return '/profile/photo';
}
