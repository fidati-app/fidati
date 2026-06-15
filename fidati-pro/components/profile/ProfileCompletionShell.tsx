import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { AppText } from '@/components/AppText';
import { PROFILE_VERIFICATION_STEP_TOTAL } from '@/constants/profileVerificationFlow';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

interface ProfileCompletionShellProps {
  stepNumber: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  footerRevealed?: boolean;
  onBack?: () => void;
}

export function ProfileCompletionShell({
  stepNumber,
  totalSteps = PROFILE_VERIFICATION_STEP_TOTAL,
  title,
  subtitle,
  children,
  footer,
  footerRevealed = false,
  onBack,
}: ProfileCompletionShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const progressTarget = stepNumber / totalSteps;
  const progressValue = useSharedValue(progressTarget);

  useEffect(() => {
    progressValue.value = withTiming(progressTarget, { duration: 450 });
  }, [progressTarget, progressValue]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progressValue.value * 100))}%`,
  }));

  const footerReserve = footerRevealed ? 88 : 20;

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <AppText style={styles.progressLabel}>
          Passaggio {stepNumber} di {totalSteps}
        </AppText>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 24 + keyboardHeight + footerReserve,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.backRow}
            onPress={onBack ?? (() => router.back())}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.navy} />
            <AppText style={styles.backText}>Indietro</AppText>
          </Pressable>

          <OnboardingStepHeader title={title} subtitle={subtitle} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      {footer ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.pending,
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.pending,
  },
  scrollContent: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
  },
});
