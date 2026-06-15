import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';

/** Reindirizza al flusso automatico o alla Home se la verifica è già stata inviata. */
export default function ProfileVerificationScreen() {
  const router = useRouter();
  const { profile } = useMyProfessionalProfile();

  useEffect(() => {
    if (!profile) return;
    const status = profile.verificationStatus ?? 'unverified';
    if (status === 'pending_review' || status === 'verified') {
      router.replace('/(tabs)');
      return;
    }
    router.replace('/profile/photo');
  }, [profile, router]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={Colors.navy} />
      <AppText style={styles.text}>Prepariamo l&apos;invio…</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
