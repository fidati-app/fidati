import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/AppText';
import { OnboardingShell, OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { OnboardingStepScroll, useOnboardingScroll } from '@/components/onboarding/OnboardingStepScroll';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getSuggestedServicesForCategory } from '@/constants/onboardingServices';
import { ONBOARDING_CONTINUE_LABEL } from '@/constants/onboarding';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import { slugifyServiceTitle } from '@/utils/serviceSlug';

import { SelectedOnboardingService } from '@/types/onboarding';

interface ServicesStepProps {
  progress: number;
  categorySlug: string;
  selectedServices: SelectedOnboardingService[];
  onToggleService: (title: string, isCustom?: boolean) => void;
  onAddCustomService: (title: string) => void;
  onContinue: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function ServicesStep({
  progress,
  categorySlug,
  selectedServices,
  onToggleService,
  onAddCustomService,
  onContinue,
  disabled,
  errorMessage,
}: ServicesStepProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const customFieldRef = useRef<View>(null);
  const { scrollRef, contentRef, scrollToField, onScroll, onScrollViewLayout, keyboardHeight } =
    useOnboardingScroll();
  const { revealed, reveal } = useRevealContinue();
  const suggestions = getSuggestedServicesForCategory(categorySlug);

  useEffect(() => {
    if (selectedServices.length > 0 && !customOpen) {
      reveal();
    }
  }, [customOpen, reveal, selectedServices.length]);

  const selectedSlugs = new Set(selectedServices.map((service) => service.serviceSlug));
  const suggestedSlugs = new Set(suggestions.map((title) => slugifyServiceTitle(title)));

  const handleAddCustom = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    onAddCustomService(trimmed);
    setCustomValue('');
    setCustomOpen(false);
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
            title="Quali servizi offri? 🔧"
            subtitle="Seleziona tutti i servizi che desideri proporre ai clienti."
          />

          <View style={styles.grid}>
            {suggestions.map((title) => {
              const active = selectedSlugs.has(slugifyServiceTitle(title));
              return (
                <Pressable
                  key={title}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => onToggleService(title, false)}
                  disabled={disabled}
                >
                  <View style={[styles.check, active && styles.checkActive]}>
                    {active ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
                  </View>
                  <AppText style={[styles.cardTitle, active && styles.cardTitleActive]}>{title}</AppText>
                </Pressable>
              );
            })}

            {selectedServices
              .filter((service) => !suggestedSlugs.has(service.serviceSlug))
              .map((service) => (
                <Pressable
                  key={service.serviceSlug}
                  style={[styles.card, styles.cardActive]}
                  onPress={() => onToggleService(service.title, service.isCustom)}
                  disabled={disabled}
                >
                  <View style={[styles.check, styles.checkActive]}>
                    <Ionicons name="checkmark" size={14} color={Colors.white} />
                  </View>
                  <AppText style={[styles.cardTitle, styles.cardTitleActive]}>{service.title}</AppText>
                </Pressable>
              ))}
          </View>

          {customOpen ? (
            <View style={styles.customBox} ref={customFieldRef} collapsable={false}>
              <TextInput
                value={customValue}
                onChangeText={setCustomValue}
                placeholder="Es. Riparazione elettrodomestici"
                placeholderTextColor={Colors.textMuted}
                style={styles.customInput}
                autoCapitalize="sentences"
                editable={!disabled}
                onFocus={() => {
                  scrollToField(customFieldRef as RefObject<View | null>, revealed);
                  reveal();
                }}
              />
              <PrimaryButton title="Aggiungi" onPress={handleAddCustom} style={styles.customBtn} />
            </View>
          ) : (
            <Pressable
              style={styles.addOther}
              onPress={() => setCustomOpen(true)}
              disabled={disabled}
            >
              <Ionicons name="add-outline" size={18} color={Colors.navy} />
              <AppText style={styles.addOtherText}>Altro servizio</AppText>
            </Pressable>
          )}
        </Animated.View>
      </OnboardingStepScroll>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  card: {
    width: '48%',
    minHeight: 88,
    padding: 14,
    borderRadius: Design.radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
    ...Design.shadowSoft,
  },
  cardActive: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: Colors.successSoft,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardTitleActive: {
    color: Colors.navy,
  },
  addOther: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Design.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.white,
  },
  addOtherText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  customBox: {
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  customInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Design.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.navy,
  },
  customBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
});
