import { useCallback, useEffect, useMemo, useState } from 'react';

import { createDefaultWeeklySchedule } from '@/constants/availability';
import {
  fetchProfessionalAvailabilitySettings,
  saveProfessionalAvailabilitySchedule,
  saveProfessionalAvailabilitySettings,
  updateAcceptsUrgentJobs,
} from '@/services/professionalAvailabilityService';
import { WeeklyScheduleDay } from '@/types';
import {
  countAvailableDays,
  hasValidWeeklyAvailability,
  validateWeeklySchedule,
} from '@/utils/availabilityValidation';

import { useMyProfessionalProfile } from './useMyProfessionalProfile';

export function useProfessionalAvailability() {
  const { profileId, refresh: refreshProfile } = useMyProfessionalProfile();
  const [schedule, setSchedule] = useState<WeeklyScheduleDay[]>(createDefaultWeeklySchedule());
  const [acceptsUrgentJobs, setAcceptsUrgentJobs] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchProfessionalAvailabilitySettings(profileId);
      setSchedule(data.schedule);
      setAcceptsUrgentJobs(data.acceptsUrgentJobs);
      setIsPersisted(data.isPersisted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile caricare la disponibilità.');
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateDay = useCallback((dayOfWeek: number, patch: Partial<WeeklyScheduleDay>) => {
    setSchedule((current) =>
      current.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }, []);

  const toggleDayAvailability = useCallback((dayOfWeek: number, isAvailable: boolean) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        if (!isAvailable) {
          return { ...day, isAvailable: false, startTime: null, endTime: null };
        }
        return {
          ...day,
          isAvailable: true,
          startTime: day.startTime ?? '08:00',
          endTime: day.endTime ?? '18:00',
        };
      }),
    );
  }, []);

  const save = useCallback(async () => {
    if (!profileId || isSaving) return false;

    const validationError = validateWeeklySchedule(schedule);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveProfessionalAvailabilitySettings(profileId, schedule, acceptsUrgentJobs);
      setIsPersisted(true);
      await refreshProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare la disponibilità.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [acceptsUrgentJobs, isSaving, profileId, refreshProfile, schedule]);

  const saveScheduleOnly = useCallback(async () => {
    if (!profileId || isSaving) return false;

    const validationError = validateWeeklySchedule(schedule);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveProfessionalAvailabilitySchedule(profileId, schedule);
      setIsPersisted(true);
      await refreshProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossibile salvare la disponibilità.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, profileId, refreshProfile, schedule]);

  const persistUrgentJobs = useCallback(
    async (value: boolean) => {
      if (!profileId) return;
      setAcceptsUrgentJobs(value);
      try {
        await updateAcceptsUrgentJobs(profileId, value);
      } catch (err) {
        setAcceptsUrgentJobs(!value);
        setError(err instanceof Error ? err.message : 'Impossibile aggiornare i lavori urgenti.');
      }
    },
    [profileId],
  );

  const availableDaysCount = useMemo(() => countAvailableDays(schedule), [schedule]);
  const canSaveSchedule = useMemo(() => hasValidWeeklyAvailability(schedule), [schedule]);
  const hasValidAvailability = useMemo(
    () => isPersisted && hasValidWeeklyAvailability(schedule),
    [isPersisted, schedule],
  );
  const allDaysOff = availableDaysCount === 0;

  return {
    schedule,
    updateDay,
    toggleDayAvailability,
    acceptsUrgentJobs,
    setAcceptsUrgentJobs: persistUrgentJobs,
    save,
    saveScheduleOnly,
    reload: load,
    isLoading,
    isSaving,
    error,
    availableDaysCount,
    hasValidAvailability,
    canSaveSchedule,
    allDaysOff,
    isPersisted,
  };
}
