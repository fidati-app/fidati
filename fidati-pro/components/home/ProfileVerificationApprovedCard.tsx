import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Props = {
  onDismiss: () => void;
};

export function ProfileVerificationApprovedCard({ onDismiss }: Props) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.closeBtn} onPress={onDismiss} hitSlop={10}>
        <Ionicons name="close" size={18} color={Colors.textMuted} />
      </Pressable>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.success} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.title}>Verifica ottenuta</AppText>
          <AppText style={styles.body}>Profilo completato</AppText>
          <AppText style={styles.hint}>
            Hai ricevuto il badge di verifica Fidati. Ora sarai visibile ai clienti negli orari che hai indicato.
          </AppText>
        </View>
      </View>
      <View style={styles.verifiedPill}>
        <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
        <AppText style={styles.verifiedPillText}>Professionista verificato</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    padding: 18,
    gap: 12,
    ...Design.shadowSoft,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingRight: 24,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
  },
  body: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Design.radius.full,
  },
  verifiedPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.success,
  },
});
