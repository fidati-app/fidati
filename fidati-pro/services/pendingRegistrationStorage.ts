import AsyncStorage from '@react-native-async-storage/async-storage';

import { ProRegistrationProfileInput } from '@/services/proRegistrationService';

const STORAGE_KEY = '@fidati_pro/pending_registration';

export interface PendingProRegistration extends ProRegistrationProfileInput {
  authUserId: string;
  savedAt: string;
}

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Fidati Pro] pendingRegistrationStorage getItem failed:', err);
    }
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Fidati Pro] pendingRegistrationStorage setItem failed:', err);
    }
    throw err;
  }
}

async function safeRemoveItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    if (__DEV__) {
      console.warn('[Fidati Pro] pendingRegistrationStorage removeItem failed:', err);
    }
  }
}

export async function savePendingRegistration(payload: PendingProRegistration): Promise<void> {
  await safeSetItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function loadPendingRegistration(): Promise<PendingProRegistration | null> {
  const raw = await safeGetItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingProRegistration;
  } catch {
    return null;
  }
}

export async function clearPendingRegistration(): Promise<void> {
  await safeRemoveItem(STORAGE_KEY);
}
