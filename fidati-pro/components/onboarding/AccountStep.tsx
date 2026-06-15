import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { OnboardingShell, OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { OnboardingStepScroll, useOnboardingScroll } from '@/components/onboarding/OnboardingStepScroll';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { ONBOARDING_CONTINUE_LABEL } from '@/constants/onboarding';
import { useRevealContinue } from '@/hooks/useRevealContinue';

interface AccountStepProps {
  progress: number;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  emailError?: string | null;
  emailChecking?: boolean;
  phoneError?: string | null;
  phoneChecking?: boolean;
  onChangeEmail: (v: string) => void;
  onBlurEmail?: () => void;
  onChangePassword: (v: string) => void;
  onChangeConfirmPassword: (v: string) => void;
  onChangePhone: (v: string) => void;
  onBlurPhone?: () => void;
  onContinue: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function AccountStep({
  progress,
  email,
  password,
  confirmPassword,
  phone,
  emailError,
  emailChecking = false,
  phoneError,
  phoneChecking = false,
  onChangeEmail,
  onBlurEmail,
  onChangePassword,
  onChangeConfirmPassword,
  onChangePhone,
  onBlurPhone,
  onContinue,
  disabled,
  errorMessage,
}: AccountStepProps) {
  const emailRef = useRef<View>(null);
  const passwordRef = useRef<View>(null);
  const confirmPasswordRef = useRef<View>(null);
  const phoneRef = useRef<View>(null);
  const { scrollRef, contentRef, scrollToField, onScroll, onScrollViewLayout, keyboardHeight } =
    useOnboardingScroll();
  const { revealed, reveal } = useRevealContinue();
  const continueDisabled =
    disabled || emailChecking || phoneChecking || Boolean(emailError) || Boolean(phoneError);

  const focusField = (ref: RefObject<View | null>, shouldReveal = false) => () => {
    scrollToField(ref, revealed || shouldReveal);
    if (shouldReveal) reveal();
  };

  return (
    <OnboardingShell
      progress={progress}
      errorMessage={errorMessage}
      footer={
        <RevealContinueFooter
          visible={revealed}
          title={ONBOARDING_CONTINUE_LABEL}
          onPress={onContinue}
          disabled={continueDisabled}
        />
      }
    >
      <OnboardingStepScroll
        scrollRef={scrollRef}
        contentRef={contentRef}
        onScroll={onScroll}
        onScrollViewLayout={onScrollViewLayout}
        keyboardHeight={keyboardHeight}
        footerRevealed={revealed}
      >
        <Animated.View entering={FadeInRight.duration(400)}>
          <OnboardingStepHeader
            title="Crea il tuo accesso 🔐"
            subtitle="Servono solo pochi dati per proteggere il tuo profilo. Tranquillo, ci pensiamo noi."
          />
          <View style={styles.fields}>
            <AuthFormField
              containerRef={emailRef}
              label="Email"
              value={email}
              onChangeText={onChangeEmail}
              onBlur={onBlurEmail}
              onFocus={focusField(emailRef)}
              placeholder="nome@email.com"
              keyboardType="email-address"
              autoComplete="email"
              icon="mail-outline"
              editable={!disabled}
              error={emailError}
              loading={emailChecking}
            />
            <AuthFormField
              containerRef={passwordRef}
              label="Password"
              value={password}
              onChangeText={onChangePassword}
              onFocus={focusField(passwordRef)}
              placeholder="Minimo 6 caratteri"
              secureTextEntry
              editable={!disabled}
            />
            <AuthFormField
              containerRef={confirmPasswordRef}
              label="Conferma password"
              value={confirmPassword}
              onChangeText={onChangeConfirmPassword}
              onFocus={focusField(confirmPasswordRef)}
              placeholder="Ripeti la password"
              secureTextEntry
              editable={!disabled}
            />
            <AuthFormField
              containerRef={phoneRef}
              label="Telefono"
              value={phone}
              onChangeText={onChangePhone}
              onBlur={onBlurPhone}
              onFocus={focusField(phoneRef, true)}
              placeholder="+39 333 123 4567"
              keyboardType="phone-pad"
              icon="call-outline"
              editable={!disabled}
              error={phoneError}
              loading={phoneChecking}
            />
          </View>
        </Animated.View>
      </OnboardingStepScroll>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
});
