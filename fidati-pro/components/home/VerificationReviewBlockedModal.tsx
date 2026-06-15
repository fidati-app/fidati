import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { elegantFadeIn, elegantFadeOut, elegantZoomIn } from '@/utils/elegantAnimations';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function VerificationReviewBlockedModal({ visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <Animated.View entering={elegantFadeIn} exiting={elegantFadeOut} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View entering={elegantZoomIn(220)} style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={onDismiss} hitSlop={12}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.iconWrap}>
            <Ionicons name="time-outline" size={28} color={Colors.pending} />
          </View>
          <AppText style={styles.title}>Profilo in revisione</AppText>
          <AppText style={styles.body}>
            Ti avviseremo appena sarà tutto pronto.
          </AppText>
          <PrimaryButton title="Ho capito" onPress={onDismiss} />
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
    backgroundColor: Colors.pendingSoft,
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
