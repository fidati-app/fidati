import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAdminChangeRequests } from '@/contexts/AdminChangeRequestsContext';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import {
  getChangeRequestShortLabel,
  type AdminChangeRequest,
} from '@/services/professionalInternalNotificationsService';
import { elegantFadeIn, elegantFadeOut, elegantZoomIn } from '@/utils/elegantAnimations';
import {
  buildChangeRequestsFingerprint,
  dismissProfileFixesPopup,
  shouldShowProfileFixesPopup,
} from '@/utils/profileFixesPopupStorage';

export function ProfileFixesPopup() {
  const router = useRouter();
  const { profileId } = useMyProfessionalProfile();
  const { requests, isLoading } = useAdminChangeRequests();
  const [visible, setVisible] = useState(false);

  const actionable = useMemo(
    () => requests.filter((r) => !r.isInReview),
    [requests],
  );

  const fingerprint = useMemo(() => buildChangeRequestsFingerprint(actionable), [actionable]);

  useEffect(() => {
    let active = true;

    async function evaluate() {
      if (!profileId || isLoading || actionable.length === 0) {
        if (active) setVisible(false);
        return;
      }

      const show = await shouldShowProfileFixesPopup(profileId, fingerprint);
      if (active) setVisible(show);
    }

    void evaluate();
    return () => {
      active = false;
    };
  }, [profileId, isLoading, actionable.length, fingerprint]);

  const handleDismiss = useCallback(async () => {
    if (profileId && fingerprint) {
      await dismissProfileFixesPopup(profileId, fingerprint);
    }
    setVisible(false);
  }, [profileId, fingerprint]);

  const handleFixNow = useCallback(() => {
    const first = actionable[0];
    if (!first) return;
    setVisible(false);
    router.push({ pathname: '/change-requests/[id]', params: { id: first.id } });
  }, [actionable, router]);

  if (!visible || actionable.length === 0) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => void handleDismiss()}>
      <Animated.View entering={elegantFadeIn} exiting={elegantFadeOut} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => void handleDismiss()} />
        <Animated.View entering={elegantZoomIn(220)} style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={() => void handleDismiss()} hitSlop={12}>
            <Ionicons name="close" size={22} color={Colors.textMuted} />
          </Pressable>

          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={28} color={Colors.success} />
          </View>

          <AppText style={styles.title}>Ci siamo quasi</AppText>
          <AppText style={styles.body}>
            {actionable.length === 1
              ? 'C’è 1 cosa da sistemare prima di rendere di nuovo visibile il tuo profilo ai clienti.'
              : `Ci sono ${actionable.length} cose da sistemare prima di rendere di nuovo visibile il tuo profilo ai clienti.`}
          </AppText>
          <AppText style={styles.hint}>
            Per proteggere i clienti e valorizzare il tuo profilo, ti chiediamo di sistemare questi dettagli.
            Appena li invii, li ricontrolliamo.
          </AppText>

          <View style={styles.list}>
            {actionable.map((item: AdminChangeRequest) => (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.bullet} />
                <AppText style={styles.listLabel}>{getChangeRequestShortLabel(item)}</AppText>
              </View>
            ))}
          </View>

          <PrimaryButton title="Sistema ora" onPress={handleFixNow} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 37, 74, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    paddingTop: 20,
    ...Design.shadowSoft,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  list: {
    gap: 10,
    marginBottom: 20,
    paddingVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    flex: 1,
  },
});
