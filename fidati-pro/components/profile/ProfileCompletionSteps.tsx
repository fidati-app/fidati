import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfileCompletionStepView } from '@/hooks/useProfileCompletion';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { PROFILE_STEPS, ProfileStepIcon } from '@/constants/profileSteps';

interface ProfileCompletionStepsProps {
  steps: ProfileCompletionStepView[];
  onPressStep: (route: string) => void;
  compact?: boolean;
}

const ICON_BY_ID = Object.fromEntries(PROFILE_STEPS.map((step) => [step.id, step.icon])) as Record<
  string,
  ProfileStepIcon
>;

export function ProfileCompletionSteps({
  steps,
  onPressStep,
  compact,
}: ProfileCompletionStepsProps) {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => (
        <View key={step.id} style={[styles.row, index > 0 && styles.rowBorder]}>
          <View style={[styles.iconWrap, step.done && styles.iconWrapDone]}>
            <Ionicons
              name={step.done ? 'checkmark' : ICON_BY_ID[step.id]}
              size={16}
              color={step.done ? Colors.white : Colors.navy}
            />
          </View>

          <View style={styles.copy}>
            <AppText style={styles.stepLabel}>{step.label}</AppText>
            {!compact ? <AppText style={styles.stepSub}>{step.subtitle}</AppText> : null}
          </View>

          {step.done ? (
            <AppText style={styles.done}>Fatto</AppText>
          ) : (
            <Pressable style={styles.btn} onPress={() => onPressStep(step.route)}>
              <AppText style={styles.btnText}>Completa</AppText>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDone: {
    backgroundColor: Colors.success,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  stepSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  done: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.navy,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
});
