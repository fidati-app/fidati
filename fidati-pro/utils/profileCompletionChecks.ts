import { ProfileStepId } from '@/constants/profileSteps';

import {

  isVerificationDocumentComplete,

  VerificationDocument,

} from '@/services/professionalVerificationService';

import { MyProfessional, VerificationStatus } from '@/types';



export function isProfileStepComplete(
  stepId: ProfileStepId,
  profile: MyProfessional | null,
  hasValidAvailability: boolean,
  verificationDocument: VerificationDocument | null = null,
  workPhotosCount = 0,
  acceptsUrgentJobsConfigured = false,
): boolean {
  switch (stepId) {
    case 'photo':
      return Boolean(profile?.imageUrl);
    case 'documents':
      return isVerificationDocumentComplete(verificationDocument);
    case 'portfolio':
      return workPhotosCount > 0;
    case 'availability':
      return hasValidAvailability;
    case 'urgent_jobs':
      return acceptsUrgentJobsConfigured;
    default:
      return false;
  }
}



export function canRequestVerification(input: {
  profile: MyProfessional | null;
  hasValidAvailability: boolean;
  verificationDocument: VerificationDocument | null;
  workPhotosCount: number;
}): boolean {
  const { profile, hasValidAvailability, verificationDocument, workPhotosCount } = input;

  if (!profile?.imageUrl) return false;
  if (!isVerificationDocumentComplete(verificationDocument)) return false;
  if (workPhotosCount < 1) return false;
  if (!hasValidAvailability) return false;

  const status = profile.verificationStatus ?? 'unverified';
  return status === 'unverified' || status === 'rejected';
}

/** Richiesta già inviata o profilo già approvato — niente nuovo invio. */
export function isVerificationSubmissionLocked(status: VerificationStatus): boolean {
  return status === 'pending_review' || status === 'verified';
}

export function verificationStatusLabel(status: VerificationStatus): string {
  switch (status) {
    case 'pending_review':
      return 'In verifica';
    case 'verified':
      return 'Verificato Fidati';
    case 'rejected':
      return 'Verifica rifiutata';
    case 'changes_requested':
      return 'Modifiche richieste';
    default:
      return 'Non verificato';
  }
}

export function verificationStatusMessage(
  status: VerificationStatus,
  rejectedReason?: string | null,
): string | null {
  switch (status) {
    case 'pending_review':
      return 'La tua richiesta è già stata inviata. Fidati controllerà il profilo e ti avviserà appena sarà approvato.';
    case 'verified':
      return 'Il tuo profilo è verificato. I clienti possono trovarti su Fidati.';
    case 'rejected':
      return rejectedReason
        ? `Verifica rifiutata: ${rejectedReason}. Aggiorna i dati e invia di nuovo la richiesta.`
        : 'Verifica rifiutata. Aggiorna i dati e invia di nuovo la richiesta.';
    default:
      return null;
  }
}

