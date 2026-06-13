import { usePathname, useSegments } from 'expo-router';
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
import { devLog, devLogSupabaseError } from '@/lib/devLog';
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

function resolveRouteDecision(input: {
  authLoading: boolean;
  isAuthenticated: boolean;
  sessionPresent: boolean;
  professionalStatus: MyProfessionalStatus;
  professionalError: string | null;
}): string {
  if (input.authLoading) return 'splash/loading';
  if (!input.isAuthenticated || !input.sessionPresent) return 'login';
  if (input.professionalStatus === 'idle' || input.professionalStatus === 'loading') {
    return 'professional-loading';
  }
  if (input.professionalStatus === 'error') return 'professional-error';
  if (input.professionalStatus === 'not_found') return 'professional-not-found';
  if (input.professionalStatus === 'ready') return 'app/home/dashboard';
  return 'unknown';
}

export function MyProfessionalProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = useSegments();
  const { user, isAuthenticated, isLoading: authLoading, session } = useAuth();
  const [status, setStatus] = useState<MyProfessionalStatus>('idle');
  const [myProfessional, setMyProfessional] = useState<MyProfessional | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadProfile = useCallback(async (authUserId: string) => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);
    devLog('professional profile loading start');
    devLog('professional profile auth user id:', authUserId);

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
        devLog('professional profile: nessuna riga, controllo registrazione pending');
        const pending = await loadPendingRegistration();
        devLog('professional profile pending registration:', pending ? { authUserId: pending.authUserId } : null);

        if (pending?.authUserId === authUserId) {
          devLog('professional profile: completamento pending per auth user id', authUserId);
          try {
            profile = await completePendingRegistrationForUser(authUserId, pending);
            await clearPendingRegistration();
            if (requestId !== requestIdRef.current) return;
          } catch (pendingErr) {
            devLogSupabaseError('professional profile pending completion', pendingErr);
            throw pendingErr;
          }
        }
      }

      if (!profile) {
        setMyProfessional(null);
        setStatus('not_found');
        console.log('[Fidati Pro] profilo professionista non trovato — auth user id:', authUserId);
        devLog('professional profile not found for auth user id', authUserId);
        return;
      }

      setMyProfessional(profile);
      setStatus('ready');
      devLog('professional profile ready', profile.id);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      devLogSupabaseError('professional profile load', err);
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
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user?.id || !session?.user) {
      devLog('route decision: skip profile load — no authenticated user', {
        isAuthenticated,
        userId: user?.id ?? null,
        sessionPresent: Boolean(session),
      });
      requestIdRef.current += 1;
      setMyProfessional(null);
      setError(null);
      setStatus('idle');
      return;
    }

    void loadProfile(user.id);
  }, [authLoading, isAuthenticated, session, user?.id, loadProfile]);

  useEffect(() => {
    if (status !== 'ready') return;

    devLog('route decision snapshot after professional ready', {
      authLoading,
      userId: user?.id ?? null,
      sessionPresent: Boolean(session),
      professionalLoading: false,
      professionalId: myProfessional?.id ?? null,
      professionalError: error,
      currentRoute: pathname,
      segments,
      finalDecision: resolveRouteDecision({
        authLoading,
        isAuthenticated,
        sessionPresent: Boolean(session),
        professionalStatus: status,
        professionalError: error,
      }),
    });
  }, [
    authLoading,
    error,
    isAuthenticated,
    myProfessional?.id,
    pathname,
    segments,
    session,
    status,
    user?.id,
  ]);

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
