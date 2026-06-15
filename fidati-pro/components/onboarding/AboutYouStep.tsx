import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { AppText } from '@/components/AppText';
import { CategoryPicker } from '@/components/auth/CategoryPicker';
import { OnboardingShell, OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { OnboardingStepScroll, useOnboardingScroll } from '@/components/onboarding/OnboardingStepScroll';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { ONBOARDING_CONTINUE_LABEL } from '@/constants/onboarding';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import type { OnboardingAccountKind } from '@/types/onboarding';

interface AboutYouStepProps {
  progress: number;
  accountKind: OnboardingAccountKind;
  firstName: string;
  lastName: string;
  companyName: string;
  categorySlug: string;
  onChangeAccountKind: (kind: OnboardingAccountKind) => void;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onChangeCompanyName: (v: string) => void;
  onChangeCategory: (v: string) => void;
  onContinue: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function AboutYouStep({
  progress,
  accountKind,
  firstName,
  lastName,
  companyName,
  categorySlug,
  onChangeAccountKind,
  onChangeFirstName,
  onChangeLastName,
  onChangeCompanyName,
  onChangeCategory,
  onContinue,
  disabled,
  errorMessage,
}: AboutYouStepProps) {
  const firstNameRef = useRef<View>(null);
  const lastNameRef = useRef<View>(null);
  const companyRef = useRef<View>(null);
  const { scrollRef, contentRef, scrollToField, onScroll, onScrollViewLayout, keyboardHeight } =
    useOnboardingScroll();
  const { revealed, reveal } = useRevealContinue();

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
          disabled={disabled}
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
            title="Parlaci di te 😊"
            subtitle="Cominciamo dalle basi. Come vuoi farti trovare dai clienti?"
          />

          <AppText style={styles.sectionLabel}>Lavoro come</AppText>
          <View style={styles.kindRow}>
            <Pressable
              style={[styles.kindPill, accountKind === 'individual' && styles.kindPillActive]}
              onPress={() => onChangeAccountKind('individual')}
              disabled={disabled}
            >
              <AppText style={[styles.kindLabel, accountKind === 'individual' && styles.kindLabelActive]}>
                Professionista
              </AppText>
            </Pressable>
            <Pressable
              style={[styles.kindPill, accountKind === 'company' && styles.kindPillActive]}
              onPress={() => onChangeAccountKind('company')}
              disabled={disabled}
            >
              <AppText style={[styles.kindLabel, accountKind === 'company' && styles.kindLabelActive]}>
                Azienda / società
              </AppText>
            </Pressable>
          </View>

          <View style={styles.fields}>
            {accountKind === 'individual' ? (
              <>
                <AuthFormField
                  containerRef={firstNameRef}
                  label="Nome"
                  value={firstName}
                  onChangeText={onChangeFirstName}
                  placeholder="Es. Mario"
                  autoCapitalize="words"
                  icon="person-outline"
                  editable={!disabled}
                  onFocus={focusField(firstNameRef)}
                />
                <AuthFormField
                  containerRef={lastNameRef}
                  label="Cognome"
                  value={lastName}
                  onChangeText={onChangeLastName}
                  placeholder="Es. Rossi"
                  autoCapitalize="words"
                  icon="person-outline"
                  editable={!disabled}
                  onFocus={focusField(lastNameRef, true)}
                />
              </>
            ) : (
              <AuthFormField
                containerRef={companyRef}
                label="Nome attività / società"
                value={companyName}
                onChangeText={onChangeCompanyName}
                placeholder="Es. Elettricisti Rossi S.r.l."
                autoCapitalize="words"
                icon="business-outline"
                editable={!disabled}
                onFocus={focusField(companyRef, true)}
              />
            )}
            <CategoryPicker
              value={categorySlug}
              onChange={(slug) => {
                onChangeCategory(slug);
                reveal();
              }}
              disabled={disabled}
            />
          </View>
        </Animated.View>
      </OnboardingStepScroll>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 10,
  },
  kindRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  kindPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  kindPillActive: {
    borderColor: Colors.navy,
    backgroundColor: 'rgba(7, 37, 74, 0.06)',
  },
  kindLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  kindLabelActive: {
    color: Colors.navy,
    fontWeight: '800',
  },
  fields: {
    gap: 16,
  },
});
