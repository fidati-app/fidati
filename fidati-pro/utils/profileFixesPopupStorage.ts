import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISS_TTL_MS = 6 * 60 * 60 * 1000;
const KEY_PREFIX = 'profile_fixes_popup_dismissed:';

type DismissRecord = {
  fingerprint: string;
  dismissedAt: number;
};

function storageKey(professionalId: string): string {
  return `${KEY_PREFIX}${professionalId}`;
}

export function buildChangeRequestsFingerprint(
  requests: { id: string; status: string; created_at: string }[],
): string {
  return requests
    .filter((r) => r.status === 'unread' || r.status === 'read')
    .map((r) => `${r.id}:${r.status}:${r.created_at}`)
    .sort()
    .join('|');
}

export async function shouldShowProfileFixesPopup(
  professionalId: string,
  fingerprint: string,
): Promise<boolean> {
  if (!fingerprint) return false;

  try {
    const raw = await AsyncStorage.getItem(storageKey(professionalId));
    if (!raw) return true;

    const record = JSON.parse(raw) as DismissRecord;
    if (record.fingerprint !== fingerprint) return true;

    return Date.now() - record.dismissedAt > DISMISS_TTL_MS;
  } catch {
    return true;
  }
}

export async function dismissProfileFixesPopup(
  professionalId: string,
  fingerprint: string,
): Promise<void> {
  const record: DismissRecord = { fingerprint, dismissedAt: Date.now() };
  try {
    await AsyncStorage.setItem(storageKey(professionalId), JSON.stringify(record));
  } catch {
    // ignore storage errors
  }
}
