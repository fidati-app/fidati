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
import { devLog } from '@/lib/devLog';
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
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<MyProfessionalStatus>('idle');
  const [myProfessional, setMyProfessional] = useState<MyProfessional | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadProfile = useCallback(async (authUserId: string) => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);
    devLog('professional profile loading start');

    const timeoutId = setTimeout(() => {
      if (requestId !== requestIdRef.current) return;
      requestIdRef.current += 1;
      devLog('professional profile loading timeout');
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
          profile = await completePendingRegistrationForUser(authUserId, pending);
          await clearPendingRegistration();
          if (requestId !== requestIdRef.current) return;
        }
      }

      if (!profile) {
        setMyProfessional(null);
        setStatus('not_found');
        devLog('professional profile not found');
        return;
      }

      setMyProfessional(profile);
      setStatus('ready');
      devLog('professional profile ready');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setMyProfessional(null);
      setStatus('error');
      setError(mapLoadError(err instanceof Error ? err.message : 'Errore sconosciuto'));
      devLog('professional profile error', err instanceof Error ? err.message : err);
    } finally {
      clearTimeout(timeoutId);
      devLog('professional profile loading end');
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    await loadProfile(user.id);
  }, [loadProfile, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      requestIdRef.current += 1;
      setMyProfessional(null);
      setError(null);
      setStatus('idle');
      return;
    }

    void loadProfile(user.id);
  }, [isAuthenticated, user?.id, loadProfile]);

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
