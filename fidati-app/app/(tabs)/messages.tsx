import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { ProfileImage } from '@/components/ProfileImage';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { getActiveMessageThreads } from '@/services/bookingRequests';
import { MOCK_MESSAGES } from '@/services/mockData';
import { Message } from '@/types';

function MessageRow({
  message,
  showBorder,
  onPress,
}: {
  message: Message;
  showBorder: boolean;
  onPress: () => void;
}) {
  const remainingMs = useCountdown(message.pendingDeadline ?? null);
  const hasPending = Boolean(message.pendingDeadline && remainingMs > 0);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        showBorder && styles.rowBorder,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <ProfileImage
        name={message.professionalName}
        imageUrl={message.imageUrl}
        fallbackColor={message.avatarColor}
        size={52}
        shape="circle"
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText style={styles.name}>{message.professionalName}</AppText>
          <AppText style={styles.time}>{message.timestamp}</AppText>
        </View>
        <View style={styles.bottomRow}>
          <AppText numberOfLines={1} style={styles.preview}>
            {message.lastMessage}
          </AppText>
          {hasPending ? (
            <View style={styles.pendingBadge}>
              <AppText style={styles.pendingBadgeText}>
                {formatCountdown(remainingMs)}
              </AppText>
            </View>
          ) : message.unread > 0 ? (
            <View style={styles.unreadBadge}>
              <AppText style={styles.unreadText}>{message.unread}</AppText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const pending = getActiveMessageThreads();
      const pendingIds = new Set(pending.map((item) => item.professionalId));
      const rest = MOCK_MESSAGES.filter((item) => !pendingIds.has(item.professionalId));
      setMessages([...pending, ...rest]);
    }, []),
  );

  const filteredMessages = messages.filter((message) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return (
      message.professionalName.toLowerCase().includes(normalized) ||
      message.lastMessage.toLowerCase().includes(normalized)
    );
  });

  return (
    <>
      <StatusBar style="light" />
      <Screen padded={false} contentContainerStyle={styles.screenContent}>
        <LinearGradient
          colors={[...Colors.heroGradient]}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { paddingTop: insets.top + 18 }]}
        >
          <View style={styles.glow} />
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="chatbubbles" size={22} color={Colors.accent} />
            </View>
            <AppText style={styles.title}>Messaggi</AppText>
          </View>
          <AppText style={styles.subtitle}>Le tue conversazioni con i professionisti</AppText>
        </LinearGradient>

        <View style={styles.body}>
          <SearchBar
            size="slim"
            placeholder="Cerca nelle conversazioni..."
            showChevron
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />

          {filteredMessages.length > 0 ? (
            <View style={styles.list}>
              {filteredMessages.map((message, index) => (
                <MessageRow
                  key={message.id}
                  message={message}
                  showBorder={index < filteredMessages.length - 1}
                  onPress={() => router.push(`/messages/${message.professionalId}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyTitle}>Nessuna conversazione</AppText>
              <AppText style={styles.emptyText}>
                {query.trim()
                  ? 'Prova con un altro termine di ricerca.'
                  : 'Quando contatterai un professionista, la chat comparirà qui.'}
              </AppText>
            </View>
          )}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 0,
    paddingBottom: 120,
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Design.font.hero,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.8,
    lineHeight: 34,
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontSize: Design.font.caption,
    color: 'rgba(255, 255, 255, 0.68)',
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
  },
  search: {
    marginBottom: 16,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pressed: {
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.text,
  },
  time: {
    fontSize: Design.font.micro,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    flex: 1,
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 48,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pendingBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Design.shadow,
  },
  emptyTitle: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyText: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
