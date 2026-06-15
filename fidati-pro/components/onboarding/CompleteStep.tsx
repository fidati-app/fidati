import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ConfettiOverlay } from '@/components/onboarding/ConfettiOverlay';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface CompleteStepProps {
  onEnterApp: () => void;
  loading?: boolean;
}

export function CompleteStep({ onEnterApp, loading }: CompleteStepProps) {
  return (
    <OnboardingShell showProgress={false} light>
      <ConfettiOverlay />
      <View style={styles.center}>
        <Animated.View entering={FadeInUp.duration(700).delay(100)}>
          <AppText style={styles.emoji}>🎉</AppText>
        </Animated.View>
        <Animated.View entering={FadeIn.duration(700).delay(300)} style={styles.copy}>
          <AppText style={styles.title}>Fantastico</AppText>
          <AppText style={styles.body}>
            Il tuo profilo è pronto.{'\n\n'}
            Adesso possiamo iniziare a trovare nuovi clienti.
          </AppText>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(700).delay(500)} style={styles.ctaWrap}>
          <PrimaryButton title="Vai alla dashboard" onPress={onEnterApp} loading={loading} style={styles.cta} />
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  emoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 20,
  },
  copy: {
    gap: 14,
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ctaWrap: {
    marginTop: 8,
  },
  cta: {
    minHeight: 52,
    borderRadius: Design.radius.lg,
  },
});
