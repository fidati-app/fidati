import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import type { ClientVisibilityStatus } from '@/types';
import { elegantFadeIn, elegantFadeOut, elegantZoomIn } from '@/utils/elegantAnimations';

type BlockReason = Extract<ClientVisibilityStatus, 'hidden_changes' | 'pending_review'>;

type Props = {
  visible: boolean;
  reason: BlockReason | null;
  onDismiss: () => void;
  onFixNow?: () => void;
};

function copy(reason: BlockReason): { title: string; body: string; cta: string } {
  if (reason === 'pending_review') {
    return {
      title: 'Correzioni inviate',
      body: 'Stiamo controllando le modifiche. Ti avviseremo appena il profilo sarà di nuovo visibile.',
      cta: 'Ho capito',
    };
  }
  return {
    title: 'Prima sistema questi dettagli',
    body: 'Per tornare visibile ai clienti devi completare le modifiche richieste.',
    cta: 'Vai a sistemare',
  };
}

export function AvailabilityBlockedModal({ visible, reason, onDismiss, onFixNow }: Props) {
  if (!visible || !reason) return null;

  const text = copy(reason);

  const handlePrimary = () => {
    if (reason === 'hidden_changes' && onFixNow) {
      onFixNow();
    }
    onDismiss();
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <Animated.View entering={elegantFadeIn} exiting={elegantFadeOut} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View entering={elegantZoomIn(220)} style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={onDismiss} hitSlop={12}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.iconWrap}>
            <Ionicons
              name={reason === 'pending_review' ? 'time-outline' : 'sparkles'}
              size={28}
              color={reason === 'pending_review' ? Colors.pending : Colors.success}
            />
          </View>
          <AppText style={styles.title}>{text.title}</AppText>
          <AppText style={styles.body}>{text.body}</AppText>
          <PrimaryButton title={text.cta} onPress={handlePrimary} />
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
});
