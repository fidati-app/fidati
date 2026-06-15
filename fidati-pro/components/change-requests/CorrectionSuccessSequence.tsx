import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Step = 'uploading' | 'received' | 'review' | 'done';

type Props = {
  active: boolean;
  onComplete: () => void;
  otherPendingCount: number;
};

const STEPS: { key: Step; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'uploading', label: 'Stiamo inviando la correzione…', icon: 'cloud-upload-outline' },
  { key: 'received', label: 'Perfetto, abbiamo ricevuto la correzione.', icon: 'checkmark-circle' },
  { key: 'review', label: 'Il team Fidati la controllerà appena possibile.', icon: 'time-outline' },
];

export function CorrectionSuccessSequence({ active, onComplete, otherPendingCount }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      return;
    }
    if (stepIndex >= STEPS.length) {
      setStepIndex(STEPS.length);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), stepIndex === 0 ? 900 : 1100);
    return () => clearTimeout(timer);
  }, [active, stepIndex]);

  if (!active) return null;

  const done = stepIndex >= STEPS.length;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.wrap}>
      <View style={styles.card}>
        {done ? (
          <Animated.View entering={FadeInDown.duration(350)} style={styles.doneBlock}>
            <View style={styles.doneIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            </View>
            <AppText style={styles.doneTitle}>
              {otherPendingCount > 0 ? 'Correzione inviata!' : 'Modifiche inviate'}
            </AppText>
            <AppText style={styles.doneSub}>
              {otherPendingCount > 0
                ? `Ancora ${otherPendingCount} ${otherPendingCount === 1 ? 'modifica' : 'modifiche'} da completare.`
                : 'Grazie per aver aggiornato il profilo. Ti avviseremo quando avremo ricontrollato.'}
            </AppText>
            <PrimaryButton
              title={otherPendingCount > 0 ? 'Continua con la prossima modifica' : 'Torna alla Home'}
              onPress={onComplete}
              style={styles.cta}
            />
          </Animated.View>
        ) : (
          STEPS.slice(0, stepIndex + 1).map((step, index) => (
            <Animated.View
              key={step.key}
              entering={FadeInDown.delay(index * 80).duration(300)}
              style={styles.stepRow}
            >
              {index === stepIndex ? (
                <ActivityIndicator size="small" color={Colors.success} style={styles.spinner} />
              ) : (
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              )}
              <AppText style={styles.stepLabel}>{step.label}</AppText>
            </Animated.View>
          ))
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 14,
    ...Design.shadowSoft,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spinner: { width: 22 },
  stepLabel: { flex: 1, fontSize: 15, lineHeight: 21, color: Colors.navy, fontWeight: '600' },
  doneBlock: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  doneIcon: { marginBottom: 4 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: Colors.navy },
  doneSub: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary, textAlign: 'center' },
  cta: { marginTop: 12, alignSelf: 'stretch' },
});
