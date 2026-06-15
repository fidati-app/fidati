import type { MyProfessional } from '@/types';

type GreetingProfile = Pick<
  MyProfessional,
  'name' | 'accountKind' | 'firstName' | 'lastName' | 'companyName'
>;

export function getProfessionalGreetingName(profile: GreetingProfile): string {
  if (profile.accountKind === 'company' && profile.companyName?.trim()) {
    return profile.companyName.trim();
  }
  if (profile.firstName?.trim()) {
    return profile.firstName.trim();
  }
  const first = profile.name.trim().split(/\s+/)[0];
  return first || profile.name.trim();
}

export function canProfessionalReceiveClients(
  profile: Pick<MyProfessional, 'verificationStatus' | 'clientVisibilityStatus'>,
): boolean {
  return (
    profile.verificationStatus === 'verified' && profile.clientVisibilityStatus === 'visible'
  );
}

export function isProfileVerificationIncomplete(
  status: MyProfessional['verificationStatus'],
): boolean {
  return status === 'unverified' || status === 'rejected';
}
