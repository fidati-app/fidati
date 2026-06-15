import { useFocusEffect } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { devLogSupabaseError } from '@/lib/devLog';
import {
  type AdminChangeRequest,
  fetchPendingAdminChangeRequests,
} from '@/services/professionalInternalNotificationsService';

type AdminChangeRequestsContextValue = {
  requests: AdminChangeRequest[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const AdminChangeRequestsContext = createContext<AdminChangeRequestsContextValue | null>(null);

export function AdminChangeRequestsProvider({ children }: { children: ReactNode }) {
  const { profileId } = useMyProfessionalProfile();
  const [requests, setRequests] = useState<AdminChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchPendingAdminChangeRequests(profileId);
      setRequests(rows);
    } catch (error) {
      devLogSupabaseError('AdminChangeRequestsProvider.refresh', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const unreadCount = useMemo(
    () => requests.filter((r) => r.status === 'unread').length,
    [requests],
  );

  const value = useMemo(
    () => ({ requests, unreadCount, isLoading, refresh }),
    [requests, unreadCount, isLoading, refresh],
  );

  return (
    <AdminChangeRequestsContext.Provider value={value}>{children}</AdminChangeRequestsContext.Provider>
  );
}

export function useAdminChangeRequests() {
  const context = useContext(AdminChangeRequestsContext);
  if (!context) {
    throw new Error('useAdminChangeRequests must be used within AdminChangeRequestsProvider');
  }
  return context;
}
