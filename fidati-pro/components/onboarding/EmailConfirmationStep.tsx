import Animated, { FadeInUp } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface EmailConfirmationStepProps {
  onGoToLogin: () => void;
}

export function EmailConfirmationStep({ onGoToLogin }: EmailConfirmationStepProps) {
  return (
    <OnboardingShell showProgress={false} light>
      <View style={styles.center}>
        <Animated.View entering={FadeInUp.duration(600)}>
          <AppText style={styles.emoji}>✉️</AppText>
          <AppText style={styles.title}>Controlla la tua email</AppText>
          <AppText style={styles.body}>
            Ti abbiamo inviato un link di conferma.{'\n\n'}
            Dopo aver confermato, accedi e completeremo il tuo profilo in automatico.
          </AppText>
          <PrimaryButton title="Vai al login" onPress={onGoToLogin} style={styles.cta} />
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  cta: {
    minHeight: 52,
    borderRadius: Design.radius.lg,
  },
});
