import Animated, { FadeInRight } from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CityPicker } from '@/components/shared/CityPicker';
import { OnboardingShell, OnboardingStepHeader } from '@/components/onboarding/OnboardingShell';
import { OnboardingStepScroll, useOnboardingScroll } from '@/components/onboarding/OnboardingStepScroll';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { ONBOARDING_CONTINUE_LABEL } from '@/constants/onboarding';
import { Colors } from '@/constants/colors';
import { useRevealContinue } from '@/hooks/useRevealContinue';

interface WorkAreaStepProps {
  progress: number;
  mainCity: string | null;
  nearbyCities: string[];
  mainQuery: string;
  nearbyQuery: string;
  onChangeMainQuery: (v: string) => void;
  onChangeNearbyQuery: (v: string) => void;
  onSetMainCity: (city: string) => void;
  onClearMainCity: () => void;
  onAddNearbyCity: (city: string) => void;
  onRemoveNearbyCity: (city: string) => void;
  onContinue: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function WorkAreaStep({
  progress,
  mainCity,
  nearbyCities,
  mainQuery,
  nearbyQuery,
  onChangeMainQuery,
  onChangeNearbyQuery,
  onSetMainCity,
  onClearMainCity,
  onAddNearbyCity,
  onRemoveNearbyCity,
  onContinue,
  disabled,
  errorMessage,
}: WorkAreaStepProps) {
  const showNearby = Boolean(mainCity);
  const { scrollRef, contentRef, scrollToField, onScroll, onScrollViewLayout, keyboardHeight } =
    useOnboardingScroll();
  const { revealed, reveal } = useRevealContinue();
  const mainCityFieldRef = useRef<View>(null);
  const nearbyFieldRef = useRef<View>(null);

  useEffect(() => {
    if (mainCity) {
      reveal();
    }
  }, [mainCity, reveal]);

  return (
    <OnboardingShell
      progress={progress}
      errorMessage={errorMessage}
      footer={
        <RevealContinueFooter
          visible={revealed}
          title={ONBOARDING_CONTINUE_LABEL}
          onPress={onContinue}
          disabled={disabled || !mainCity}
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
            title="Qual è la tua città principale? 📍"
            subtitle="Da quale città parti per offrire i tuoi servizi?"
          />

          {!mainCity ? (
            <View ref={mainCityFieldRef} collapsable={false}>
              <CityPicker
                cities={[]}
                query={mainQuery}
                onChangeQuery={onChangeMainQuery}
                onAddCity={onSetMainCity}
                onRemoveCity={() => {}}
                disabled={disabled}
                placeholder="Cerca la tua città"
                hint="Scegli il comune da cui operi di solito."
                onInputFocus={() => {
                  scrollToField(mainCityFieldRef, revealed);
                  reveal();
                }}
              />
            </View>
          ) : (
            <View style={styles.mainCityCard}>
              <View style={styles.mainCityRow}>
                <AppText style={styles.mainCityLabel}>Città principale</AppText>
                <AppText style={styles.mainCityValue}>{mainCity}</AppText>
              </View>
              <AppText style={styles.changeLink} onPress={onClearMainCity}>
                Cambia città principale
              </AppText>
            </View>
          )}

          {showNearby ? (
            <View style={styles.nearbyBlock}>
              <AppText style={styles.nearbyQuestion}>
                Oltre {mainCity}, offri servizio anche in città vicine?
              </AppText>
              <AppText style={styles.nearbyHint}>
                Aggiungi altri comuni solo se ti sposti regolarmente per lavorare.
              </AppText>
              <View ref={nearbyFieldRef} collapsable={false}>
                <CityPicker
                  cities={nearbyCities}
                  query={nearbyQuery}
                  onChangeQuery={onChangeNearbyQuery}
                  onAddCity={onAddNearbyCity}
                  onRemoveCity={onRemoveNearbyCity}
                  disabled={disabled}
                  placeholder="Cerca un altro comune"
                  excludeCities={mainCity ? [mainCity] : []}
                  onInputFocus={() => {
                    scrollToField(nearbyFieldRef, revealed);
                    reveal();
                  }}
                />
              </View>
            </View>
          ) : null}
        </Animated.View>
      </OnboardingStepScroll>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  mainCityCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  mainCityRow: {
    gap: 4,
  },
  mainCityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mainCityValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    opacity: 0.75,
  },
  nearbyBlock: {
    marginTop: 22,
    gap: 8,
  },
  nearbyQuestion: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.navy,
    lineHeight: 22,
  },
  nearbyHint: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
});
