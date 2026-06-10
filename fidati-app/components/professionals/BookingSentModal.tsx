import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BookingSuccessCheckmark } from '@/components/professionals/BookingSuccessCheckmark';
import { ConfettiBurst } from '@/components/professionals/ConfettiBurst';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { BorderRadius } from '@/constants/theme';

interface BookingSentModalProps {
  visible: boolean;
  professionalName: string;
  packageTitle: string;
  onGoToChat: () => void;
}

export function BookingSentModal({
  visible,
  professionalName,
  packageTitle,
  onGoToChat,
}: BookingSentModalProps) {
  const firstName = professionalName.split(' ')[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onGoToChat}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ConfettiBurst active={visible} />

          <BookingSuccessCheckmark />

          <AppText style={styles.title}>Richiesta inviata!</AppText>
          <AppText style={styles.body}>
            La tua richiesta per{' '}
            <AppText style={styles.highlight}>{packageTitle}</AppText> è stata mandata a{' '}
            <AppText style={styles.highlight}>{professionalName}</AppText>.
          </AppText>
          <AppText style={styles.body}>
            <AppText style={styles.highlight}>{firstName}</AppText> ha{' '}
            <AppText style={styles.timeHighlight}>60 minuti</AppText> per risponderti in chat.
            Se non risponde, la richiesta verrà proposta ad altri professionisti simili.
          </AppText>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onGoToChat}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.white} />
            <AppText style={styles.buttonText}>Vai alla chat</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 13, 32, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 22,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  highlight: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  timeHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accent,
  },
  button: {
    marginTop: 8,
    width: '100%',
    minHeight: 48,
    borderRadius: Design.radius.button,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
