import { Session, User } from '@supabase/supabase-js';
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

import { asyncStorageError, isSupabaseConfigured, probeAsyncStorage, supabase } from '@/lib/supabaseClient';
import { devLogSupabaseError } from '@/lib/devLog';

const AUTH_INIT_TIMEOUT_MS = 10_000;

interface AuthResult {
  error: string | null;
}

export interface SignUpResult extends AuthResult {
  needsEmailConfirmation?: boolean;
  userId?: string;
  session?: Session | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistrationLocked: boolean;
  configError: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult & { success?: boolean }>;
  beginRegistration: () => void;
  finishRegistration: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email o password non corretti.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Conferma la tua email prima di accedere.';
  }
  if (normalized.includes('too many requests')) {
    return 'Troppi tentativi. Riprova tra qualche minuto.';
  }
  if (normalized.includes('user already registered')) {
    return 'Esiste già un account con questa email.';
  }

  return message || 'Accesso non riuscito. Riprova.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isRegistrationLocked, setIsRegistrationLocked] = useState(false);
  const registrationLockRef = useRef(false);

  useEffect(() => {
    let active = true;

    const finishAuthLoading = () => {
      if (!active) return;
      setIsLoading(false);
    };

    if (!isSupabaseConfigured) {
      setConfigError(
        'Supabase non configurato. Aggiungi EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY nel file .env di fidati-pro.',
      );
      finishAuthLoading();
      return () => {
        active = false;
      };
    }

    const timeoutId = setTimeout(() => {
      finishAuthLoading();
    }, AUTH_INIT_TIMEOUT_MS);

    void (async () => {
      try {
        const storageOk = await probeAsyncStorage();
        if (!active) return;

        if (!storageOk) {
          setConfigError(
            asyncStorageError ??
              'Storage locale non disponibile. Riavvia Expo Go e Metro con npx expo start -c.',
          );
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          devLogSupabaseError('getSession', error);
        }

        setSession(data.session ?? null);
      } catch (err) {
        devLogSupabaseError('getSession', err);
      } finally {
        clearTimeout(timeoutId);
        finishAuthLoading();
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;

      if (registrationLockRef.current) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
      } else if (nextSession) {
        setSession(nextSession);
      } else if (event === 'INITIAL_SESSION') {
        setSession(null);
      }

      setIsLoading(false);
    });

    return () => {
      active = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase non configurato. Controlla le variabili d’ambiente.' };
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { error: 'Inserisci email e password.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase non configurato. Controlla le variabili d’ambiente.' };
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { error: 'Inserisci email e password.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    const needsEmailConfirmation = !data.session && Boolean(data.user);

    return {
      error: null,
      needsEmailConfirmation,
      userId: data.user?.id,
      session: data.session ?? null,
    };
  }, []);

  const beginRegistration = useCallback(() => {
    registrationLockRef.current = true;
    setIsRegistrationLocked(true);
  }, []);

  const finishRegistration = useCallback(async () => {
    registrationLockRef.current = false;
    setIsRegistrationLocked(false);
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setSession(data.session);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult & { success?: boolean }> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase non configurato. Controlla le variabili d’ambiente.' };
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { error: 'Inserisci la tua email per recuperare la password.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    return { error: null, success: true };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session),
      isRegistrationLocked,
      configError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      beginRegistration,
      finishRegistration,
    }),
    [session, isLoading, isRegistrationLocked, configError, signIn, signUp, signOut, resetPassword, beginRegistration, finishRegistration],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
