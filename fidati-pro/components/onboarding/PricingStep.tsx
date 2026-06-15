import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRef } from 'react';
import type { RefObject } from 'react';
import {
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { AuthFormField } from '@/components/auth/AuthFormField';
import { AppText } from '@/components/AppText';
import { OnboardingShell, OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { OnboardingStepScroll, useOnboardingScroll } from '@/components/onboarding/OnboardingStepScroll';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { ONBOARDING_CONTINUE_LABEL } from '@/constants/onboarding';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import type { ServicePriceFieldErrors } from '@/utils/onboardingValidation';
import { formatClientFacingPrice, hasPricingPreviewData, ServicePriceInput } from '@/utils/pricing';

interface PricingStepProps {
  progress: number;
  services: ServicePriceInput[];
  fieldErrors?: Record<string, ServicePriceFieldErrors>;
  onChangeServicePrice: (serviceSlug: string, field: 'minRaw' | 'maxRaw', value: string) => void;
  onToggleQuoteRequired: (serviceSlug: string, value: boolean) => void;
  onContinue: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function PricingStep({
  progress,
  services,
  fieldErrors = {},
  onChangeServicePrice,
  onToggleQuoteRequired,
  onContinue,
  disabled,
  errorMessage,
}: PricingStepProps) {
  const { scrollRef, contentRef, scrollToField, onScroll, onScrollViewLayout, keyboardHeight } =
    useOnboardingScroll();
  const { revealed, reveal } = useRevealContinue();
  const fieldRefs = useRef<Record<string, View | null>>({});
  const lastIndex = services.length - 1;

  const fieldRef = (key: string): RefObject<View | null> => ({
    get current() {
      return fieldRefs.current[key] ?? null;
    },
  });

  const focusField = (key: string, shouldReveal = false) => () => {
    scrollToField(fieldRef(key), revealed || shouldReveal);
    if (shouldReveal) reveal();
  };
  const previewServices = services.map((s) => ({
    priceFrom: s.quoteRequired ? 0 : Number(s.minRaw.replace(',', '.')) || 0,
    quoteRequired: Boolean(s.quoteRequired),
  }));
  const previewLabel = formatClientFacingPrice(previewServices);
  const showPreview = hasPricingPreviewData(services);

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
            title="Impostiamo i prezzi 💶"
            subtitle="Per ogni servizio indica una fascia indicativa oppure attiva il preventivo su richiesta."
          />

          <View style={styles.list}>
            {services.map((service, index) => {
              const errors = fieldErrors[service.serviceSlug];
              const quoteRequired = Boolean(service.quoteRequired);
              const isCustom = Boolean(service.isCustom);
              const isLast = index === lastIndex;

              return (
                <View key={service.serviceSlug} style={styles.serviceCard}>
                  <AppText style={styles.serviceTitle}>{service.title}</AppText>

                  {isCustom ? (
                    <View style={styles.quoteRow}>
                      <AppText style={styles.quoteLabel}>Preventivo su richiesta</AppText>
                      <Switch
                        value={quoteRequired}
                        onValueChange={(value) => {
                          onToggleQuoteRequired(service.serviceSlug, value);
                          if (isLast) reveal();
                        }}
                        trackColor={{ false: Colors.border, true: Colors.successSoft }}
                        thumbColor={quoteRequired ? Colors.success : Colors.white}
                        disabled={disabled}
                      />
                    </View>
                  ) : null}

                  {!quoteRequired || !isCustom ? (
                    <View style={styles.rangeRow}>
                      <View
                        style={styles.rangeField}
                        ref={(node) => {
                          fieldRefs.current[`${service.serviceSlug}-min`] = node;
                        }}
                        collapsable={false}
                      >
                        <AuthFormField
                          label="Minimo"
                          value={service.minRaw}
                          onChangeText={(v) => onChangeServicePrice(service.serviceSlug, 'minRaw', v)}
                          placeholder="35"
                          keyboardType="decimal-pad"
                          icon="pricetag-outline"
                          editable={!disabled}
                          error={errors?.min}
                          onFocus={focusField(`${service.serviceSlug}-min`)}
                        />
                      </View>
                      <View
                        style={styles.rangeField}
                        ref={(node) => {
                          fieldRefs.current[`${service.serviceSlug}-max`] = node;
                        }}
                        collapsable={false}
                      >
                        <AuthFormField
                          label="Massimo"
                          value={service.maxRaw}
                          onChangeText={(v) => onChangeServicePrice(service.serviceSlug, 'maxRaw', v)}
                          placeholder="70"
                          keyboardType="decimal-pad"
                          icon="pricetag-outline"
                          editable={!disabled}
                          error={errors?.max}
                          onFocus={focusField(`${service.serviceSlug}-max`, isLast)}
                        />
                      </View>
                    </View>
                  ) : (
                    <AppText style={styles.quoteHint}>
                      Ai clienti mostreremo: Prezzo da concordare
                    </AppText>
                  )}
                </View>
              );
            })}
          </View>

          {showPreview ? (
            <View style={styles.note}>
              <AppText style={styles.noteText}>
                Anteprima listino:{' '}
                <AppText style={styles.noteHighlight}>{previewLabel}</AppText>
              </AppText>
            </View>
          ) : null}
        </Animated.View>
      </OnboardingStepScroll>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    gap: 12,
    ...Design.shadowSoft,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quoteLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  quoteHint: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeField: {
    flex: 1,
  },
  note: {
    marginTop: 20,
    padding: 14,
    borderRadius: Design.radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  noteHighlight: {
    fontWeight: '800',
    color: Colors.navy,
  },
});
