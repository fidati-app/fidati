import { useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { DayAvailabilityRow } from '@/components/availability/DayAvailabilityRow';
import { TimeRangeSheet } from '@/components/availability/TimeRangeSheet';
import { AppText } from '@/components/AppText';
import { ProfileCompletionShell } from '@/components/profile/ProfileCompletionShell';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RevealContinueFooter } from '@/components/shared/RevealContinueFooter';
import { DEFAULT_END_TIME, DEFAULT_START_TIME } from '@/constants/availability';
import { getNextVerificationRoute } from '@/constants/profileVerificationFlow';
import { Colors } from '@/constants/colors';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfessionalAvailability } from '@/hooks/useProfessionalAvailability';
import { isProfileVerificationIncomplete } from '@/utils/professionalDisplayName';
import { useRevealContinue } from '@/hooks/useRevealContinue';
import { markVerificationStepContinued } from '@/services/verificationProgressStorage';
import { WeeklyScheduleDay } from '@/types';

export default function ProfileAvailabilityScreen() {
  const router = useRouter();
  const { profile, profileId } = useMyProfessionalProfile();
  const {
    schedule,
    updateDay,
    toggleDayAvailability,
    saveScheduleOnly,
    isLoading,
    isSaving,
    error,
    allDaysOff,
    canSaveSchedule,
  } = useProfessionalAvailability();

  const [editingDay, setEditingDay] = useState<WeeklyScheduleDay | null>(null);
  const [draftStart, setDraftStart] = useState(DEFAULT_START_TIME);
  const [draftEnd, setDraftEnd] = useState(DEFAULT_END_TIME);
  const [localError, setLocalError] = useState<string | null>(null);
  const { revealed, reveal } = useRevealContinue();

  const verificationFlow = isProfileVerificationIncomplete(profile?.verificationStatus ?? 'unverified');

  useEffect(() => {
    if (verificationFlow && canSaveSchedule) {
      reveal();
    }
  }, [canSaveSchedule, reveal, verificationFlow]);

  const editingLabel = useMemo(
    () => schedule.find((day) => day.dayOfWeek === editingDay?.dayOfWeek)?.dayLabel ?? '',
    [editingDay?.dayOfWeek, schedule],
  );

  const openTimeEditor = (day: WeeklyScheduleDay) => {
    setEditingDay(day);
    setDraftStart(day.startTime ?? DEFAULT_START_TIME);
    setDraftEnd(day.endTime ?? DEFAULT_END_TIME);
  };

  const confirmTimeEditor = () => {
    if (!editingDay) return;
    updateDay(editingDay.dayOfWeek, {
      startTime: draftStart,
      endTime: draftEnd,
      isAvailable: true,
    });
    setEditingDay(null);
  };

  const handleContinue = async () => {
    if (!canSaveSchedule) {
      setLocalError('Attiva almeno un giorno con orario valido per continuare.');
      return;
    }
    setLocalError(null);
    const ok = await saveScheduleOnly();
    if (!ok || !profileId) return;

    if (verificationFlow) {
      await markVerificationStepContinued(profileId, 'availability');
      const next = getNextVerificationRoute('/profile/availability');
      router.replace((next ?? '/profile/urgent-jobs') as '/profile/urgent-jobs');
      return;
    }

    router.back();
  };

  if (!profile) return null;

  if (isLoading) {
    const loading = verificationFlow ? (
      <ProfileCompletionShell stepNumber={4} title="Disponibilità" subtitle="Caricamento…">
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.navy} />
        </View>
      </ProfileCompletionShell>
    ) : (
      <ProfilePageShell title="Disponibilità" subtitle="Configura la tua settimana tipo">
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.navy} />
        </View>
      </ProfilePageShell>
    );
    return loading;
  }

  const editor = (
    <>
      <View style={styles.intro}>
        <AppText style={styles.introTitle}>Settimana tipo</AppText>
        <AppText style={styles.introText}>
          Attiva i giorni in cui lavori e scegli la fascia oraria. Potrai modificarla in qualsiasi momento.
        </AppText>
      </View>

      <View style={styles.list}>
        {schedule.map((day) => (
          <DayAvailabilityRow
            key={day.dayOfWeek}
            day={day}
            disabled={isSaving}
            onToggleAvailable={(value) => toggleDayAvailability(day.dayOfWeek, value)}
            onPressTime={() => openTimeEditor(day)}
          />
        ))}
      </View>

      {allDaysOff ? (
        <View style={styles.warning}>
          <AppText style={styles.warningText}>
            Attiva almeno un giorno per poter continuare.
          </AppText>
        </View>
      ) : null}

      {(error || localError) ? (
        <AppText style={styles.error}>{localError ?? error}</AppText>
      ) : null}

      {!verificationFlow ? (
        <PrimaryButton
          title={isSaving ? 'Salvataggio…' : 'Salva disponibilità'}
          onPress={() => void handleContinue()}
          disabled={isSaving}
        />
      ) : null}

      <TimeRangeSheet
        visible={editingDay != null}
        dayLabel={editingLabel}
        startTime={draftStart}
        endTime={draftEnd}
        onChangeStart={setDraftStart}
        onChangeEnd={setDraftEnd}
        onConfirm={confirmTimeEditor}
        onClose={() => setEditingDay(null)}
      />
    </>
  );

  if (verificationFlow) {
    return (
      <ProfileCompletionShell
        stepNumber={4}
        title="Quando sei disponibile? 📅"
        subtitle="Imposta giorni e orari in cui puoi ricevere nuove richieste."
        footerRevealed={revealed}
        footer={
          <RevealContinueFooter
            visible={revealed}
            title={isSaving ? 'Salvataggio…' : 'Salva e continua'}
            onPress={() => void handleContinue()}
            disabled={isSaving || !canSaveSchedule}
            loading={isSaving}
            hint={
              !canSaveSchedule ? (
                <AppText style={styles.disabledHint}>
                  Attiva almeno un giorno con orario valido per continuare.
                </AppText>
              ) : null
            }
          />
        }
      >
        {editor}
      </ProfileCompletionShell>
    );
  }

  return (
    <ProfilePageShell title="Disponibilità" subtitle="Imposta quando sei disponibile per nuove richieste.">
      {editor}
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  intro: {
    gap: 4,
    marginBottom: 14,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  list: {
    gap: 10,
    marginBottom: 14,
  },
  warning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 14,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 12,
  },
  footer: {
    gap: 8,
  },
  disabledHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.pending,
    textAlign: 'center',
    lineHeight: 17,
  },
});
