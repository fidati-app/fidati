import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfileCompletionAssets } from '@/hooks/useProfileCompletionAssets';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { clearVerificationContinuedSteps } from '@/services/verificationProgressStorage';
import { requestProfileVerification } from '@/services/professionalVerificationService';
import { markVerificationSubmittedPopup } from '@/services/verificationSubmittedPopupStorage';
import { canRequestVerification } from '@/utils/profileCompletionChecks';

const SUBMIT_MESSAGES = [
  'Stiamo inviando il tuo profilo…',
  'Controlliamo che sia tutto completo…',
  'Richiesta inviata',
] as const;

type Phase = 'submitting' | 'error';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function VerificationSubmitFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, profileId, refresh } = useMyProfessionalProfile();
  const { verificationDocument, workPhotosCount, isLoading: assetsLoading } =
    useProfileCompletionAssets();
  const { hasValidAvailability, isLoading: availabilityLoading } = useProfessionalAvailability();

  const [phase, setPhase] = useState<Phase>('submitting');
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || assetsLoading || availabilityLoading || !profile || !profileId) {
      return;
    }

    const status = profile.verificationStatus ?? 'unverified';
    if (status === 'pending_review' || status === 'verified') {
      router.replace('/(tabs)');
      return;
    }

    const ready = canRequestVerification({
      profile,
      hasValidAvailability,
      verificationDocument,
      workPhotosCount,
    });

    if (!ready) {
      router.replace('/(tabs)');
      return;
    }

    startedRef.current = true;

    const submit = async () => {
      try {
        setMessageIndex(0);
        await wait(700);
        setMessageIndex(1);
        await wait(500);
        await requestProfileVerification(profileId);
        await clearVerificationContinuedSteps(profileId);
        await refresh();
        setMessageIndex(2);
        await wait(800);
        await markVerificationSubmittedPopup();
        router.replace('/(tabs)');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossibile inviare la richiesta.');
        setPhase('error');
      }
    };

    void submit();
  }, [
    assetsLoading,
    availabilityLoading,
    hasValidAvailability,
    profile,
    profileId,
    refresh,
    router,
    verificationDocument,
    workPhotosCount,
  ]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {phase === 'submitting' ? (
        <Animated.View entering={FadeIn.duration(220)} style={styles.center}>
          <ActivityIndicator size="large" color={Colors.success} />
          <AppText style={styles.sendingTitle}>{SUBMIT_MESSAGES[messageIndex]}</AppText>
          <AppText style={styles.sendingSub}>
            {messageIndex < 2
              ? 'Un attimo, stiamo preparando la tua richiesta.'
              : 'Perfetto! Ti portiamo alla Home.'}
          </AppText>
        </Animated.View>
      ) : null}

      {phase === 'error' ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <AppText style={styles.error}>{error}</AppText>
          <PrimaryButton title="Torna alla Home" onPress={() => router.replace('/(tabs)')} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 22,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendingTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
  },
  sendingSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  error: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: 16,
  },
});
