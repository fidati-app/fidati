import { Session, User } from '@supabase/supabase-js';

import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react';



import { asyncStorageError, isSupabaseConfigured, probeAsyncStorage, supabase } from '@/lib/supabaseClient';

import { devLog } from '@/lib/devLog';



const AUTH_INIT_TIMEOUT_MS = 10_000;



interface AuthResult {

  error: string | null;

}



export interface SignUpResult extends AuthResult {

  needsEmailConfirmation?: boolean;

  userId?: string;

}



interface AuthContextValue {

  session: Session | null;

  user: User | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  configError: string | null;

  signIn: (email: string, password: string) => Promise<AuthResult>;

  signUp: (email: string, password: string) => Promise<SignUpResult>;

  signOut: () => Promise<void>;

  resetPassword: (email: string) => Promise<AuthResult & { success?: boolean }>;

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



  useEffect(() => {

    devLog('app start');

    devLog('auth loading start');



    let active = true;



    const finishAuthLoading = (reason: string) => {

      if (!active) return;

      setIsLoading(false);

      devLog('auth loading end', reason);

    };



    if (!isSupabaseConfigured) {

      setConfigError(

        'Supabase non configurato. Aggiungi EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY nel file .env di fidati-pro.',

      );

      finishAuthLoading('missing-env');

      return () => {

        active = false;

      };

    }



    const timeoutId = setTimeout(() => {

      devLog('getSession timeout — forcing auth ready');

      finishAuthLoading('timeout');

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

          devLog('getSession error', error.message);

        } else {

          devLog('getSession success', data.session ? 'with-session' : 'no-session');

        }



        setSession(data.session ?? null);

      } catch (err) {

        devLog('getSession throw', err instanceof Error ? err.message : err);

      } finally {

        clearTimeout(timeoutId);

        finishAuthLoading('finally');

      }

    })();



    const {

      data: { subscription },

    } = supabase.auth.onAuthStateChange((event, nextSession) => {

      if (!active) return;

      devLog('onAuthStateChange', {

        event,

        userId: nextSession?.user?.id ?? null,

        sessionPresent: Boolean(nextSession),

      });



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



    if (data.session) {

      setSession(data.session);

    }



    devLog('signIn success auth user id:', data.session?.user?.id ?? data.user?.id ?? '(none)');



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



    if (data.session) {

      setSession(data.session);

    }



    devLog('signUp auth user id:', data.user?.id ?? '(none)');

    devLog('signUp needsEmailConfirmation:', needsEmailConfirmation);

    devLog('signUp session present:', Boolean(data.session));

    return {

      error: null,

      needsEmailConfirmation,

      userId: data.user?.id,

    };

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

      configError,

      signIn,

      signUp,

      signOut,

      resetPassword,

    }),

    [session, isLoading, configError, signIn, signUp, signOut, resetPassword],

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


