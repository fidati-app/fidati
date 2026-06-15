import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface IntroStepProps {
  onStart: () => void;
}

export function IntroStep({ onStart }: IntroStepProps) {
  return (
    <OnboardingShell showProgress={false} light>
      <View style={styles.center}>
        <Animated.View entering={FadeInUp.duration(600).delay(100)}>
          <AppText style={styles.emoji}>👋</AppText>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.copy}>
          <AppText style={styles.title}>Benvenuto su Fidati Pro</AppText>
          <AppText style={styles.body}>
            In pochi minuti prepareremo il tuo profilo professionale.{'\n\n'}
            Pensiamo noi a guidarti passo dopo passo.
          </AppText>
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.ctaWrap}>
          <PrimaryButton title="Iniziamo" onPress={onStart} style={styles.cta} />
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
    fontSize: 52,
    marginBottom: 16,
  },
  copy: {
    gap: 14,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  ctaWrap: {
    marginTop: 8,
  },
  cta: {
    minHeight: 52,
    borderRadius: Design.radius.lg,
  },
});
