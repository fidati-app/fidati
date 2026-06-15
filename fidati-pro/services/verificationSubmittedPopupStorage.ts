import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fidati_pro_show_verification_submitted';

export async function markVerificationSubmittedPopup(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}

export async function consumeVerificationSubmittedPopup(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEY);
  if (value === '1') {
    await AsyncStorage.removeItem(KEY);
    return true;
  }
  return false;
}
