import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useVerificationResume } from '@/hooks/useVerificationResume';
import type { ProfileCompletionStepView } from '@/hooks/useProfileCompletion';

type Props = {
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  prerequisiteSteps: ProfileCompletionStepView[];
  nextStepTitle?: string | null;
  continueLabel?: string;
};

export function ProfileIncompleteCard({
  completionPercent,
  completedSteps,
  totalSteps,
  prerequisiteSteps,
  nextStepTitle,
  continueLabel,
}: Props) {
  const router = useRouter();
  const { navigateToResume, isReady, resumeRoute } = useVerificationResume();
  const hasStarted = completedSteps > 0;
  const cta = continueLabel ?? (hasStarted ? 'Continua verifica' : 'Inizia verifica');

  const onPress = () => {
    if (resumeRoute) {
      navigateToResume();
      return;
    }
    router.push('/profile/photo');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-outline" size={24} color={Colors.pending} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.eyebrow}>Verifica profilo</AppText>
          <AppText style={styles.title}>Completa il tuo profilo</AppText>
          <AppText style={styles.body}>
            {nextStepTitle
              ? `Prossimo passaggio: ${nextStepTitle}`
              : 'Ti guidiamo in pochi passaggi per ricevere clienti nella tua zona.'}
          </AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, completionPercent)}%` }]} />
      </View>
      <AppText style={styles.progressLabel}>
        {completedSteps} di {totalSteps} passaggi · {completionPercent}%
      </AppText>

      <View style={styles.stepsList}>
        {prerequisiteSteps.map((step) => (
          <View key={step.id} style={styles.stepRow}>
            <Ionicons
              name={step.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
              color={step.done ? Colors.success : Colors.textMuted}
            />
            <AppText style={[styles.stepText, step.done && styles.stepTextDone]} numberOfLines={1}>
              {step.title}
            </AppText>
          </View>
        ))}
      </View>

      <PrimaryButton title={cta} onPress={onPress} disabled={!isReady && hasStarted} />
      <Pressable onPress={() => router.push('/profile/complete')} hitSlop={8}>
        <AppText style={styles.link}>Dettaglio passaggi</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
    padding: 18,
    gap: 12,
    ...Design.shadowSoft,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.pendingSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.pending,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.pending,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -4,
  },
  stepsList: {
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepTextDone: {
    color: Colors.navy,
    opacity: 0.7,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    opacity: 0.7,
  },
});
