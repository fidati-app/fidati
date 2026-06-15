import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Rimuovi',
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.message}>{message}</AppText>
          <View style={styles.actions}>
            <PrimaryButton
              title={cancelLabel}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={styles.actionBtn}
            />
            <PrimaryButton
              title={loading ? 'Attendere…' : confirmLabel}
              onPress={onConfirm}
              disabled={loading}
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Design.radius.xl,
    padding: 22,
    gap: 12,
    ...Design.shadowSoft,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 46,
    backgroundColor: Colors.error,
  },
});
