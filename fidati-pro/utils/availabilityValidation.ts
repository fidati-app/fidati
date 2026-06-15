import { WeeklyScheduleDay } from '@/types';

export function compareTimes(a: string, b: string): number {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return ah * 60 + am - (bh * 60 + bm);
}

export function validateWeeklySchedule(days: WeeklyScheduleDay[]): string | null {
  for (const day of days) {
    if (!day.isAvailable) continue;

    if (!day.startTime || !day.endTime) {
      return `Imposta orario inizio e fine per ${day.dayLabel}.`;
    }

    if (compareTimes(day.endTime, day.startTime) <= 0) {
      return `Per ${day.dayLabel}, l'orario di fine deve essere dopo l'inizio.`;
    }
  }

  return null;
}

export function hasValidWeeklyAvailability(days: WeeklyScheduleDay[]): boolean {
  return days.some(
    (day) =>
      day.isAvailable &&
      day.startTime != null &&
      day.endTime != null &&
      compareTimes(day.endTime, day.startTime) > 0,
  );
}

export function countAvailableDays(days: WeeklyScheduleDay[]): number {
  return days.filter((day) => day.isAvailable).length;
}
