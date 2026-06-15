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

export function ProfiloInviatoPopup({ visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <Animated.View entering={elegantFadeIn} exiting={elegantFadeOut} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View entering={elegantZoomIn(240)} style={styles.sheet}>
          <View style={styles.iconWrap}>
            <Ionicons name="paper-plane" size={40} color={Colors.pending} />
          </View>
          <AppText style={styles.title}>Profilo inviato</AppText>
          <AppText style={styles.body}>
            Il tuo profilo è ora in revisione. Di solito controlliamo tutto entro 24 ore. Ti
            avviseremo appena sarà pronto.
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
    alignItems: 'center',
    ...Design.shadowSoft,
  },
  iconWrap: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
