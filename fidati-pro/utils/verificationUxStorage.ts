import AsyncStorage from '@react-native-async-storage/async-storage';

import type { VerificationStatus } from '@/types';

const LAST_STATUS_PREFIX = 'verification_last_status:';
const APPROVED_POPUP_PREFIX = 'verification_approved_popup:';
const VERIFIED_CARD_PREFIX = 'verification_approved_card:';

function lastStatusKey(professionalId: string): string {
  return `${LAST_STATUS_PREFIX}${professionalId}`;
}

function approvedPopupKey(professionalId: string): string {
  return `${APPROVED_POPUP_PREFIX}${professionalId}`;
}

function verifiedCardKey(professionalId: string): string {
  return `${VERIFIED_CARD_PREFIX}${professionalId}`;
}

export async function getLastKnownVerificationStatus(
  professionalId: string,
): Promise<VerificationStatus | null> {
  try {
    const value = await AsyncStorage.getItem(lastStatusKey(professionalId));
    if (
      value === 'unverified' ||
      value === 'pending_review' ||
      value === 'verified' ||
      value === 'rejected'
    ) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setLastKnownVerificationStatus(
  professionalId: string,
  status: VerificationStatus,
): Promise<void> {
  try {
    await AsyncStorage.setItem(lastStatusKey(professionalId), status);
  } catch {
    // ignore
  }
}

export async function shouldShowVerificationApprovedPopup(
  professionalId: string,
  marker: string,
): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(approvedPopupKey(professionalId));
    return stored !== marker;
  } catch {
    return true;
  }
}

export async function markVerificationApprovedPopupShown(
  professionalId: string,
  marker: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(approvedPopupKey(professionalId), marker);
  } catch {
    // ignore
  }
}

export async function shouldShowVerifiedCelebrationCard(
  professionalId: string,
): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(verifiedCardKey(professionalId));
    return value !== 'dismissed' && value !== 'auto_hidden';
  } catch {
    return true;
  }
}

export async function dismissVerifiedCelebrationCard(professionalId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(verifiedCardKey(professionalId), 'dismissed');
  } catch {
    // ignore
  }
}

export async function autoHideVerifiedCelebrationCard(professionalId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(verifiedCardKey(professionalId), 'auto_hidden');
  } catch {
    // ignore
  }
}
