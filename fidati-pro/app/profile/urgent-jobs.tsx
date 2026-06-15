import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { UrgentJobsSection } from '@/components/availability/UrgentJobsSection';
import { AppText } from '@/components/AppText';
import { ProfileCompletionShell } from '@/components/profile/ProfileCompletionShell';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { Colors } from '@/constants/colors';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import { isProfileVerificationIncomplete } from '@/utils/professionalDisplayName';
import { markVerificationStepContinued } from '@/services/verificationProgressStorage';
import { updateAcceptsUrgentJobs } from '@/services/professionalAvailabilityService';

export default function ProfileUrgentJobsScreen() {
  const router = useRouter();
  const { profile, profileId, refresh } = useMyProfessionalProfile();
  const {
    acceptsUrgentJobs,
    setAcceptsUrgentJobs,
    isLoading,
    isSaving,
    error,
    hasValidAvailability,
  } = useProfessionalAvailability();
  const [localUrgent, setLocalUrgent] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { revealed, reveal } = useRevealContinue();

  const verificationFlow = isProfileVerificationIncomplete(profile?.verificationStatus ?? 'unverified');
  const urgentEnabled = localUrgent ?? acceptsUrgentJobs;

  const disabledReason = useMemo(() => {
    if (!hasValidAvailability) {
      return 'Completa prima la disponibilità settimanale nello step precedente.';
    }
    if (isLoading) return 'Caricamento in corso…';
    return null;
  }, [hasValidAvailability, isLoading]);

  const handleSubmit = async () => {
    if (!profileId || submitting) return;
    if (!hasValidAvailability) {
      setSubmitError('Imposta almeno un giorno disponibile prima di inviare la verifica.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await updateAcceptsUrgentJobs(profileId, urgentEnabled);
      await markVerificationStepContinued(profileId, 'urgent_jobs');
      await refresh();
      router.replace('/profile/verification-submit');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Impossibile inviare la verifica.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile || !profileId) return null;

  if (!verificationFlow) {
    router.replace('/profile/availability');
    return null;
  }

  if (isLoading) {
    return (
      <ProfileCompletionShell stepNumber={5} title="Lavori urgenti" subtitle="Caricamento…">
        <ActivityIndicator color={Colors.navy} />
      </ProfileCompletionShell>
    );
  }

  return (
    <ProfileCompletionShell
      stepNumber={5}
      title="Vuoi ricevere lavori urgenti? ⚡"
      subtitle="Interventi rapidi nella tua categoria e zona. Puoi attivarli o disattivarli quando vuoi."
      footerRevealed={revealed}
      footer={
        <RevealContinueFooter
          visible={revealed}
          title={submitting ? 'Invio in corso…' : 'Completa e invia verifica'}
          onPress={() => void handleSubmit()}
          disabled={submitting || isSaving || Boolean(disabledReason)}
          loading={submitting}
          hint={
            <>
              {disabledReason ? (
                <AppText style={styles.disabledHint}>{disabledReason}</AppText>
              ) : null}
              {submitError ? <AppText style={styles.error}>{submitError}</AppText> : null}
            </>
          }
        />
      }
    >
      <UrgentJobsSection
        enabled={urgentEnabled}
        disabled={submitting || isSaving}
        compact
        onChange={(value) => {
          setLocalUrgent(value);
          setAcceptsUrgentJobs(value);
          reveal();
        }}
      />

      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </ProfileCompletionShell>
  );
}

const styles = StyleSheet.create({
  disabledHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.pending,
    textAlign: 'center',
    lineHeight: 17,
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginTop: 8,
  },
});
