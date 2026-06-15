import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { devLogSupabaseError } from '@/lib/devLog';
import { fetchMyProfessionalByAuthUserId } from '@/services/professionalsMeService';
import {
  clearPendingRegistration,
  loadPendingRegistration,
} from '@/services/pendingRegistrationStorage';
import { completePendingRegistrationForUser } from '@/services/proRegistrationService';
import { MyProfessional, MyProfessionalStatus } from '@/types';

interface MyProfessionalContextValue {
  status: MyProfessionalStatus;
  myProfessional: MyProfessional | null;
  myProfessionalId: string | null;
  error: string | null;
  isReady: boolean;
  refresh: () => Promise<void>;
}

const MyProfessionalContext = createContext<MyProfessionalContextValue | null>(null);

const PROFILE_LOAD_TIMEOUT_MS = 12_000;

function mapLoadError(message: string): string {
  if (message.toLowerCase().includes('network')) {
    return 'Connessione non disponibile. Controlla la rete e riprova.';
  }
  return 'Impossibile caricare il profilo professionista. Riprova.';
}

export function MyProfessionalProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading, session } = useAuth();
  const [status, setStatus] = useState<MyProfessionalStatus>('idle');
  const [myProfessional, setMyProfessional] = useState<MyProfessional | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasProfileRef = useRef(false);

  const loadProfile = useCallback(async (authUserId: string, options?: { background?: boolean }) => {
    const requestId = ++requestIdRef.current;
    const background = Boolean(options?.background && hasProfileRef.current);

    if (__DEV__) {
      console.log('[PROFILE] loading', { requestId, background });
    }

    if (!background) {
      setStatus('loading');
      setError(null);
    }

    const timeoutId = setTimeout(() => {
      if (requestId !== requestIdRef.current) return;
      requestIdRef.current += 1;
      setMyProfessional(null);
      setStatus('error');
      setError('Timeout caricamento profilo. Controlla la connessione e riprova.');
    }, PROFILE_LOAD_TIMEOUT_MS);

    try {
      let profile = await fetchMyProfessionalByAuthUserId(authUserId);
      if (requestId !== requestIdRef.current) return;

      if (!profile) {
        const pending = await loadPendingRegistration();

        if (pending?.authUserId === authUserId) {
          try {
            profile = await completePendingRegistrationForUser(authUserId, pending);
            await clearPendingRegistration();
            if (requestId !== requestIdRef.current) return;
          } catch (pendingErr) {
            devLogSupabaseError('completePendingRegistration', pendingErr);
            throw pendingErr;
          }
        }
      }

      if (!profile) {
        setMyProfessional(null);
        setStatus('not_found');
        return;
      }

      setMyProfessional(profile);
      hasProfileRef.current = true;
      setStatus('ready');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      devLogSupabaseError('loadProfessionalProfile', err);
      setMyProfessional(null);
      setStatus('error');
      setError(mapLoadError(err instanceof Error ? err.message : 'Errore sconosciuto'));
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    if (__DEV__) {
      console.log('[PROFILE] refetch', { background: hasProfileRef.current });
    }
    await loadProfile(user.id, { background: hasProfileRef.current });
  }, [loadProfile, user?.id]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user?.id || !session?.user) {
      requestIdRef.current += 1;
      hasProfileRef.current = false;
      setMyProfessional(null);
      setError(null);
      setStatus('idle');
      return;
    }

    void loadProfile(user.id);
  }, [authLoading, isAuthenticated, session, user?.id, loadProfile]);

  const value = useMemo(
    () => ({
      status,
      myProfessional,
      myProfessionalId: myProfessional?.id ?? null,
      error,
      isReady: status === 'ready' && myProfessional !== null,
      refresh,
    }),
    [status, myProfessional, error, refresh],
  );

  return (
    <MyProfessionalContext.Provider value={value}>{children}</MyProfessionalContext.Provider>
  );
}

export function useMyProfessional() {
  const context = useContext(MyProfessionalContext);
  if (!context) {
    throw new Error('useMyProfessional must be used within MyProfessionalProvider');
  }
  return context;
}
