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

export function VerificaOttenutaPopup({ visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onDismiss}>
      <Animated.View entering={elegantFadeIn} exiting={elegantFadeOut} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
        <Animated.View entering={elegantZoomIn(240)} style={styles.sheet}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={44} color={Colors.success} />
          </View>
          <AppText style={styles.title}>Verifica ottenuta</AppText>
          <AppText style={styles.body}>
            Hai ricevuto il badge di verifica{' '}
            <AppText style={styles.brand}>Fidati</AppText>.
          </AppText>
          <AppText style={styles.hint}>
            Da questo momento i clienti della tua zona potranno trovarti.
          </AppText>
          <PrimaryButton title="Fantastico" onPress={onDismiss} />
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
    marginBottom: 6,
  },
  brand: {
    fontWeight: '800',
    color: Colors.success,
  },
  hint: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
});
