import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { ProfileImage } from '@/components/ProfileImage';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { ProHeroHeader } from '@/components/ui/ProHeroHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_MESSAGES } from '@/services/mockData';
import { ProMessage } from '@/types';

function MessageRow({
  message,
  showBorder,
  onPress,
}: {
  message: ProMessage;
  showBorder: boolean;
  onPress: () => void;
}) {
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
        name={message.clientName}
        imageUrl={message.imageUrl}
        fallbackColor={message.avatarColor}
        size={52}
        shape="circle"
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText style={styles.name}>{message.clientName}</AppText>
          <AppText style={styles.time}>{message.timestamp}</AppText>
        </View>
        <View style={styles.bottomRow}>
          <AppText numberOfLines={1} style={styles.preview}>
            {message.lastMessage}
          </AppText>
          {message.unread > 0 ? (
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
  const [query, setQuery] = useState('');

  const filteredMessages = MOCK_MESSAGES.filter((message) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return (
      message.clientName.toLowerCase().includes(normalized) ||
      message.lastMessage.toLowerCase().includes(normalized)
    );
  });

  return (
    <>
      <StatusBar style="light" />
      <Screen padded={false} contentContainerStyle={styles.screenContent}>
        <ProHeroHeader
          title="Messaggi"
          subtitle="Le tue conversazioni con i clienti"
          icon="chatbubbles"
        />

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
                  onPress={() => router.push(`/messages/${message.clientId}`)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyTitle}>Nessuna conversazione</AppText>
              <AppText style={styles.emptyText}>
                {query.trim()
                  ? 'Prova con un altro termine di ricerca.'
                  : 'Quando un cliente ti contatterà, la chat comparirà qui.'}
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
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
  },
  search: {
    marginBottom: 16,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
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
    color: Colors.chatText,
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
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    ...Design.shadow,
  },
  emptyTitle: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.chatText,
  },
  emptyText: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
