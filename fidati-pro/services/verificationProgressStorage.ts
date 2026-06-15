import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ProfileVerificationStepId } from '@/constants/profileVerificationFlow';

const KEY_PREFIX = '@fidati_pro/verification_continued/';

function storageKey(profileId: string): string {
  return `${KEY_PREFIX}${profileId}`;
}

export async function getVerificationContinuedSteps(
  profileId: string,
): Promise<ProfileVerificationStepId[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(profileId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ProfileVerificationStepId => typeof item === 'string');
  } catch {
    return [];
  }
}

export async function markVerificationStepContinued(
  profileId: string,
  stepId: ProfileVerificationStepId,
): Promise<void> {
  const current = await getVerificationContinuedSteps(profileId);
  if (current.includes(stepId)) return;
  await AsyncStorage.setItem(storageKey(profileId), JSON.stringify([...current, stepId]));
}

export async function clearVerificationContinuedSteps(profileId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(profileId));
}
