import { useMyProfessional } from '@/contexts/MyProfessionalContext';
import { MyProfessional } from '@/types';

export function useMyProfessionalProfile() {
  const { status, myProfessional, myProfessionalId, error, isReady, refresh } = useMyProfessional();

  return {
    profile: myProfessional as MyProfessional | null,
    profileId: myProfessionalId,
    status,
    error,
    isLoading: status === 'idle' || status === 'loading',
    isReady,
    isNotFound: status === 'not_found',
    isError: status === 'error',
    refresh,
  };
}
