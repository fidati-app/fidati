import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProgressRing } from '@/components/home/ProgressRing';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PROFILE_STEPS } from '@/constants/profileSteps';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfileProgress } from '@/contexts/ProfileProgressContext';

export default function ProfileCompleteScreen() {
  const router = useRouter();
  const { completedCount, totalSteps, percent, stepsLeft, isStepCompleted, completeStep } =
    useProfileProgress();

  return (
    <ProfilePageShell
      title="Completa profilo"
      subtitle={`${completedCount} di ${totalSteps} passaggi completati`}
    >
      <View style={styles.summaryCard}>
        <ProgressRing
          percent={percent}
          size={72}
          stroke={6}
          label={`${completedCount}/${totalSteps}`}
          labelSize={14}
        />
        <View style={styles.summaryCopy}>
          <AppText style={styles.summaryTitle}>
            {stepsLeft === 0 ? 'Profilo completo!' : `Ti mancano ${stepsLeft} passaggi`}
          </AppText>
          <AppText style={styles.summarySub}>
            Ogni passaggio aumenta la visibilità del tuo profilo su Fidati.
          </AppText>
        </View>
      </View>

      <View style={styles.stepsCard}>
        {PROFILE_STEPS.map((step, index) => {
          const done = isStepCompleted(step.id);
          return (
            <View key={step.id} style={[styles.stepRow, index > 0 && styles.stepBorder]}>
              <View style={[styles.stepIcon, done && styles.stepIconDone]}>
                <Ionicons
                  name={done ? 'checkmark' : step.icon}
                  size={16}
                  color={done ? Colors.white : Colors.navy}
                />
              </View>
              <View style={styles.stepCopy}>
                <AppText style={styles.stepTitle}>{step.title}</AppText>
                <AppText style={styles.stepSub}>{step.subtitle}</AppText>
              </View>
              {done ? (
                <AppText style={styles.stepDone}>Fatto</AppText>
              ) : (
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => {
                    if (step.id === 'photo' || step.id === 'bio') {
                      completeStep(step.id);
                      return;
                    }
                    router.push(step.route as '/profile/services');
                  }}
                >
                  <AppText style={styles.stepBtnText}>Completa</AppText>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <PrimaryButton
        title={stepsLeft === 0 ? 'Torna alla Home' : 'Segna foto e descrizione come fatte'}
        onPress={() => {
          completeStep('photo');
          completeStep('bio');
        }}
      />
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Design.shadowSoft,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  summarySub: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  stepBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: Colors.success,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  stepSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  stepDone: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.navy,
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
});
