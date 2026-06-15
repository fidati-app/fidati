import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ClientVisibilityStatus } from '@/types';

const KEY_PREFIX = 'visibility_celebration_shown:';
const LAST_STATUS_PREFIX = 'last_visibility_status:';

function storageKey(professionalId: string): string {
  return `${KEY_PREFIX}${professionalId}`;
}

function lastStatusKey(professionalId: string): string {
  return `${LAST_STATUS_PREFIX}${professionalId}`;
}

export async function getLastKnownVisibility(
  professionalId: string,
): Promise<ClientVisibilityStatus | null> {
  try {
    const value = await AsyncStorage.getItem(lastStatusKey(professionalId));
    if (value === 'visible' || value === 'hidden_changes' || value === 'pending_review') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastKnownVisibility(
  professionalId: string,
  status: ClientVisibilityStatus,
): Promise<void> {
  try {
    await AsyncStorage.setItem(lastStatusKey(professionalId), status);
  } catch {
    // ignore
  }
}

export async function shouldShowVisibilityCelebration(
  professionalId: string,
  changedAt: string | null | undefined,
): Promise<boolean> {
  if (!professionalId || !changedAt) return false;

  try {
    const stored = await AsyncStorage.getItem(storageKey(professionalId));
    return stored !== changedAt;
  } catch {
    return true;
  }
}

export async function markVisibilityCelebrationShown(
  professionalId: string,
  changedAt: string | null | undefined,
): Promise<void> {
  if (!professionalId || !changedAt) return;

  try {
    await AsyncStorage.setItem(storageKey(professionalId), changedAt);
  } catch {
    // ignore
  }
}
