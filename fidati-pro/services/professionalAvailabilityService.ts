import { createDefaultWeeklySchedule, WEEKDAY_DEFS } from '@/constants/availability';
import { devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { WeeklyScheduleDay } from '@/types';

interface AvailabilityRow {
  day_of_week: number;
  short_label: string;
  day_label: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  time_ranges: string[] | null;
  status: string;
}

function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 5);
}

function mapRowToScheduleDay(row: AvailabilityRow): WeeklyScheduleDay {
  const def = WEEKDAY_DEFS.find((d) => d.dayOfWeek === row.day_of_week);
  const startTime = normalizeTime(row.start_time);
  const endTime = normalizeTime(row.end_time);
  const isAvailable = row.is_available ?? row.status !== 'off';

  return {
    dayOfWeek: row.day_of_week,
    dayLabel: row.day_label || def?.dayLabel || 'Giorno',
    shortLabel: row.short_label || def?.shortLabel || '?',
    isAvailable,
    startTime: isAvailable ? startTime : null,
    endTime: isAvailable ? endTime : null,
  };
}

function mergeWithDefaults(rows: AvailabilityRow[]): WeeklyScheduleDay[] {
  const defaults = createDefaultWeeklySchedule();
  const byDay = new Map(rows.map((row) => [row.day_of_week, mapRowToScheduleDay(row)]));

  return defaults.map((fallback) => byDay.get(fallback.dayOfWeek) ?? fallback);
}

function scheduleDayToDbRow(professionalId: string, day: WeeklyScheduleDay) {
  const startTime = day.isAvailable ? day.startTime : null;
  const endTime = day.isAvailable ? day.endTime : null;
  const rangeLabel =
    startTime && endTime ? `${startTime} – ${endTime}` : undefined;

  return {
    professional_id: professionalId,
    day_of_week: day.dayOfWeek,
    short_label: day.shortLabel,
    day_label: day.dayLabel,
    is_available: day.isAvailable,
    start_time: startTime,
    end_time: endTime,
    time_ranges: rangeLabel ? [rangeLabel] : [],
    status: day.isAvailable ? 'partial' : 'off',
  };
}

export async function fetchProfessionalAvailabilitySettings(
  professionalId: string,
): Promise<{ schedule: WeeklyScheduleDay[]; acceptsUrgentJobs: boolean; isPersisted: boolean }> {
  const [availabilityRes, professionalRes] = await Promise.all([
    supabase
      .from('professional_availability')
      .select(
        'day_of_week, short_label, day_label, is_available, start_time, end_time, time_ranges, status',
      )
      .eq('professional_id', professionalId)
      .order('day_of_week', { ascending: true }),
    supabase
      .from('professionals')
      .select('accepts_urgent_jobs')
      .eq('id', professionalId)
      .maybeSingle(),
  ]);

  if (availabilityRes.error) {
    devLogSupabaseError('fetchProfessionalAvailabilitySettings availability', availabilityRes.error);
    throw availabilityRes.error;
  }

  if (professionalRes.error) {
    devLogSupabaseError('fetchProfessionalAvailabilitySettings professional', professionalRes.error);
    throw professionalRes.error;
  }

  const rows = (availabilityRes.data ?? []) as AvailabilityRow[];

  return {
    schedule: rows.length > 0 ? mergeWithDefaults(rows) : createDefaultWeeklySchedule(),
    acceptsUrgentJobs: Boolean(professionalRes.data?.accepts_urgent_jobs),
    isPersisted: rows.length > 0,
  };
}

export async function saveProfessionalAvailabilitySchedule(
  professionalId: string,
  schedule: WeeklyScheduleDay[],
): Promise<void> {
  const rows = schedule.map((day) => scheduleDayToDbRow(professionalId, day));

  const { error: upsertError } = await supabase
    .from('professional_availability')
    .upsert(rows, { onConflict: 'professional_id,day_of_week' });

  if (upsertError) {
    devLogSupabaseError('saveProfessionalAvailabilitySchedule upsert', upsertError);
    throw upsertError;
  }
}

export async function saveProfessionalAvailabilitySettings(
  professionalId: string,
  schedule: WeeklyScheduleDay[],
  acceptsUrgentJobs: boolean,
): Promise<void> {
  const rows = schedule.map((day) => scheduleDayToDbRow(professionalId, day));

  const { error: upsertError } = await supabase
    .from('professional_availability')
    .upsert(rows, { onConflict: 'professional_id,day_of_week' });

  if (upsertError) {
    devLogSupabaseError('saveProfessionalAvailabilitySettings upsert', upsertError);
    throw upsertError;
  }

  const { error: updateError } = await supabase
    .from('professionals')
    .update({ accepts_urgent_jobs: acceptsUrgentJobs })
    .eq('id', professionalId);

  if (updateError) {
    devLogSupabaseError('saveProfessionalAvailabilitySettings urgent flag', updateError);
    throw updateError;
  }
}

export async function updateAcceptsUrgentJobs(
  professionalId: string,
  acceptsUrgentJobs: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .update({ accepts_urgent_jobs: acceptsUrgentJobs })
    .eq('id', professionalId);

  if (error) {
    devLogSupabaseError('updateAcceptsUrgentJobs', error);
    throw error;
  }
}
