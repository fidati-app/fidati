import type { Professional } from '@/types';

export function isProfessionalClientVisible(
  professional: Pick<Professional, 'verified' | 'clientVisibilityStatus' | 'accountStatus'>,
): boolean {
  if (professional.accountStatus === 'banned') return false;
  if (!professional.verified) return false;
  return (professional.clientVisibilityStatus ?? 'visible') === 'visible';
}
