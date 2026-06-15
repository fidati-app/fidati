import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

const LOGO = require('@/components/logo-fidatipro.png');

interface OnboardingShellProps {
  children: ReactNode;
  progress?: number;
  showProgress?: boolean;
  progressLabel?: string;
  progressFillStyle?: AnimatedStyle<ViewStyle>;
  footer?: ReactNode;
  light?: boolean;
  errorMessage?: string | null;
}

export function OnboardingShell({
  children,
  progress = 0,
  showProgress = true,
  progressLabel,
  progressFillStyle,
  footer,
  light = false,
  errorMessage,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const keyboardOpen = keyboardHeight > 0;

  return (
    <View style={styles.root}>
      {!light ? (
        <LinearGradient
          colors={[...Colors.heroGradient]}
          style={[
            styles.header,
            { paddingTop: insets.top + (keyboardOpen ? 6 : 12) },
            keyboardOpen && styles.headerCompact,
          ]}
        >
          {!keyboardOpen ? (
            <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
          ) : null}
          {showProgress ? (
            <View style={styles.progressBlock}>
              {progressLabel && !keyboardOpen ? (
                <AppText style={styles.progressLabel}>{progressLabel}</AppText>
              ) : null}
              <View style={styles.progressTrack}>
                {progressFillStyle ? (
                  <Animated.View style={[styles.progressFill, progressFillStyle]} />
                ) : (
                  <View
                    style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]}
                  />
                )}
              </View>
            </View>
          ) : null}
        </LinearGradient>
      ) : (
        <View style={[styles.headerLight, { paddingTop: insets.top + 12 }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.main}>
          <View style={[styles.body, styles.flex]}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AppText style={styles.errorText}>{errorMessage}</AppText>
              </View>
            ) : null}
            {children}
          </View>
          {footer ? <View style={styles.footerSlot}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export function OnboardingStepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.stepHeader}>
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerCompact: {
    paddingBottom: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerLight: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  logo: {
    width: 120,
    height: 36,
    marginBottom: 14,
  },
  progressBlock: {
    gap: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.success,
  },
  body: {
    flex: 1,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    lineHeight: 18,
  },
  footerSlot: {
    backgroundColor: Colors.background,
  },
  stepHeader: {
    gap: 10,
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
