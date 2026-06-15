import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { AdminUser } from '@/types';

interface AuthState {
  session: Session | null;
  admin: AdminUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function mapAdmin(row: {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: AdminUser['role'];
  is_active: boolean;
}): AdminUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdmin = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setAdmin(null);
      return;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, auth_user_id, email, full_name, role, is_active')
      .eq('auth_user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setAdmin(null);
      return;
    }

    setAdmin(mapAdmin(data));
  }, []);

  const refreshAdmin = useCallback(async () => {
    await loadAdmin(session?.user.id);
  }, [loadAdmin, session?.user.id]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadAdmin(data.session?.user.id).finally(() => setIsLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadAdmin(nextSession?.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      admin,
      isLoading,
      isAdmin: Boolean(admin?.isActive),
      signIn,
      signOut,
      refreshAdmin,
    }),
    [admin, isLoading, refreshAdmin, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
