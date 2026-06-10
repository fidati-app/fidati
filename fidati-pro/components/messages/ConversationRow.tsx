import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { ProMessage } from '@/types';

interface ConversationRowProps {
  message: ProMessage;
  showBorder?: boolean;
  onPress?: () => void;
}

export function ConversationRow({ message, showBorder, onPress }: ConversationRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, showBorder && styles.border, pressed && styles.pressed]}
    >
      <View style={[styles.avatar, { backgroundColor: message.avatarColor }]}>
        <AppText style={styles.avatarText}>{message.clientName.charAt(0)}</AppText>
      </View>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppText style={styles.name}>{message.clientName}</AppText>
          <AppText style={styles.time}>{message.timestamp}</AppText>
        </View>
        <View style={styles.bottomRow}>
          <AppText style={styles.preview} numberOfLines={1}>
            {message.lastMessage}
          </AppText>
          {message.unread > 0 ? (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{message.unread}</AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Design.spacing.screen,
    paddingVertical: 14,
    backgroundColor: Colors.card,
  },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  pressed: { backgroundColor: Colors.overlay },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.white },
  copy: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: Colors.navy },
  time: { fontSize: Design.font.micro, color: Colors.textMuted },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  preview: { flex: 1, fontSize: Design.font.caption, color: Colors.textSecondary },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});
