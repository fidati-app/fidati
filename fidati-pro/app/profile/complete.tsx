import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProgressRing } from '@/components/home/ProgressRing';
import { ProfileCompletionSkeleton } from '@/components/profile/ProfileCompletionSkeleton';
import { ProfileCompletionSteps } from '@/components/profile/ProfileCompletionSteps';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import {
  verificationStatusLabel,
  verificationStatusMessage,
} from '@/utils/profileCompletionChecks';

export default function ProfileCompleteScreen() {
  const router = useRouter();
  const { profile } = useMyProfessionalProfile();
  const {
    percent,
    completedCount,
    total,
    steps,
    pending,
    nextStep,
    verificationReady,
    canSubmitVerification,
    verificationLocked,
    verificationStatus,
    isLoading,
  } = useProfileCompletion();

  const statusMessage = verificationStatusMessage(
    verificationStatus,
    profile?.verificationRejectedReason,
  );

  return (
    <ProfilePageShell
      title="Completa profilo"
      subtitle={
        isLoading
          ? 'Caricamento profilo…'
          : `${completedCount} di ${total} passaggi · ${verificationStatusLabel(verificationStatus)}`
      }
    >
      {isLoading ? (
        <ProfileCompletionSkeleton variant="full" />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <ProgressRing percent={percent} size={72} stroke={6} label={`${percent}%`} labelSize={14} />
            <View style={styles.summaryCopy}>
              <AppText style={styles.summaryTitle}>
                {verificationStatus === 'verified'
                  ? 'Profilo verificato Fidati'
                  : verificationStatus === 'pending_review'
                    ? 'Richiesta di verifica inviata'
                    : verificationReady
                      ? 'Profilo pronto per la verifica Fidati!'
                      : `Ti mancano ${pending.length} passaggi`}
              </AppText>
              <AppText style={styles.summarySub}>
                Foto profilo, documenti, almeno 1 foto lavori e disponibilità sono obbligatori per la
                verifica.
              </AppText>
            </View>
          </View>

          {statusMessage ? (
            <View
              style={[
                styles.statusBanner,
                verificationStatus === 'verified' && styles.statusBannerVerified,
                verificationStatus === 'pending_review' && styles.statusBannerPending,
                verificationStatus === 'rejected' && styles.statusBannerRejected,
              ]}
            >
              {verificationStatus === 'pending_review' ? (
                <View style={styles.pendingBadge}>
                  <AppText style={styles.pendingBadgeText}>In verifica</AppText>
                </View>
              ) : null}
              {verificationStatus === 'verified' ? (
                <View style={styles.verifiedRow}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
                  <AppText style={styles.verifiedLabel}>Verificato Fidati</AppText>
                </View>
              ) : null}
              <AppText style={styles.statusMessage}>{statusMessage}</AppText>
            </View>
          ) : null}

          <ProfileCompletionSteps
            steps={steps}
            onPressStep={(route) => router.push(route as '/profile/photo')}
          />

          {canSubmitVerification ? (
            <AppText style={styles.autoHint}>
              Appena completi l&apos;ultimo passaggio, invieremo automaticamente il profilo al team Fidati.
            </AppText>
          ) : verificationLocked ? null : (
            <PrimaryButton
              title="Continua completamento"
              onPress={() => router.push((nextStep?.route ?? '/profile/photo') as '/profile/photo')}
            />
          )}
        </>
      )}
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Design.shadowSoft,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  summarySub: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  statusBanner: {
    backgroundColor: Colors.background,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  statusBannerPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  statusBannerVerified: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.success,
  },
  statusBannerRejected: {
    backgroundColor: Colors.errorSoft,
    borderColor: Colors.error,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  autoHint: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
});
