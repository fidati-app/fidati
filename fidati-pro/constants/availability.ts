import { WeeklyScheduleDay } from '@/types';

/** PostgreSQL DOW: 0 = Domenica, 1 = Lunedì, … 6 = Sabato */
export const WEEKDAY_DEFS = [
  { dayOfWeek: 1, dayLabel: 'Lunedì', shortLabel: 'Lun' },
  { dayOfWeek: 2, dayLabel: 'Martedì', shortLabel: 'Mar' },
  { dayOfWeek: 3, dayLabel: 'Mercoledì', shortLabel: 'Mer' },
  { dayOfWeek: 4, dayLabel: 'Giovedì', shortLabel: 'Gio' },
  { dayOfWeek: 5, dayLabel: 'Venerdì', shortLabel: 'Ven' },
  { dayOfWeek: 6, dayLabel: 'Sabato', shortLabel: 'Sab' },
  { dayOfWeek: 0, dayLabel: 'Domenica', shortLabel: 'Dom' },
] as const;

export const TIME_STEP_MINUTES = 30;
export const TIME_START_HOUR = 6;
export const TIME_END_HOUR = 22;

export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '18:00';

export function buildTimeOptions(stepMinutes = TIME_STEP_MINUTES): string[] {
  const options: string[] = [];
  for (let hour = TIME_START_HOUR; hour <= TIME_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === TIME_END_HOUR && minute > 0) break;
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return options;
}

export const TIME_OPTIONS = buildTimeOptions();

export function createDefaultWeeklySchedule(): WeeklyScheduleDay[] {
  return WEEKDAY_DEFS.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    dayLabel: day.dayLabel,
    shortLabel: day.shortLabel,
    isAvailable: day.dayOfWeek !== 0,
    startTime: day.dayOfWeek !== 0 ? DEFAULT_START_TIME : null,
    endTime: day.dayOfWeek !== 0 ? DEFAULT_END_TIME : null,
  }));
}

export function formatTimeRangeLabel(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return 'Non disponibile';
  return `${startTime} — ${endTime}`;
}
