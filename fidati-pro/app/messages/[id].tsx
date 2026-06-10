import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { ProfileImage } from '@/components/ProfileImage';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { getChatMessagesForClient, getMessageByClientId } from '@/services/mockData';
import { ProChatMessage } from '@/types';

function MessageBubble({ message }: { message: ProChatMessage }) {
  const isPro = message.sender === 'pro';

  return (
    <View style={[styles.bubble, isPro ? styles.bubblePro : styles.bubbleClient]}>
      <AppText style={[styles.bubbleText, isPro && styles.bubbleTextPro]}>
        {message.text}
      </AppText>
      <AppText style={[styles.bubbleTime, isPro && styles.bubbleTimePro]}>
        {message.timestamp}
      </AppText>
    </View>
  );
}

export default function ProChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const thread = getMessageByClientId(id ?? '');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ProChatMessage[]>(() =>
    getChatMessagesForClient(id ?? ''),
  );
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, scrollToBottom]);

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    const timestamp = new Date().toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    setMessages((current) => [
      ...current,
      { id: `pro-${Date.now()}`, sender: 'pro', text, timestamp },
    ]);
    setDraft('');
  };

  if (!thread) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 12 }]}>
        <AppText style={styles.fallbackText}>Conversazione non trovata</AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.chatText} />
        </Pressable>

        <View style={styles.headerMain}>
          <View style={styles.avatarRing}>
            <ProfileImage
              name={thread.clientName}
              imageUrl={thread.imageUrl}
              fallbackColor={thread.avatarColor}
              size={40}
              shape="circle"
            />
          </View>

          <View style={styles.headerCopy}>
            <View style={styles.nameRow}>
              <AppText style={styles.headerName} numberOfLines={1}>
                {thread.clientName}
              </AppText>
              <Ionicons name="person-circle-outline" size={16} color={Colors.accent} />
            </View>
            <AppText style={styles.headerMeta} numberOfLines={1}>
              Cliente · Risponde di solito in 1h
            </AppText>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onContentSizeChange={() => scrollToBottom(true)}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={message.sender === 'pro' ? styles.rowProBubble : styles.rowClient}
          >
            <MessageBubble message={message} />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.composer}>
          <Pressable
            hitSlop={8}
            style={({ pressed }) => [styles.attachBtn, pressed && styles.attachBtnPressed]}
          >
            <Ionicons name="image-outline" size={21} color={Colors.chatText} />
          </Pressable>

          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            textAlignVertical="center"
          />

          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && styles.sendBtnPressed,
            ]}
          >
            <Ionicons name="send" size={17} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  fallbackText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    ...Design.shadow,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: Colors.background,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    height: 40,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
    color: Colors.chatText,
    flexShrink: 1,
    includeFontPadding: false,
  },
  headerMeta: {
    fontSize: 11,
    lineHeight: 13,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  rowProBubble: {
    width: '100%',
    paddingLeft: 28,
    alignItems: 'flex-end',
  },
  rowClient: {
    width: '100%',
    paddingRight: 28,
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  bubblePro: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  bubbleClient: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.chatText,
  },
  bubbleTextPro: {
    color: Colors.white,
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  bubbleTimePro: {
    color: 'rgba(255,255,255,0.8)',
  },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 28,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadow,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  attachBtnPressed: {
    opacity: 0.9,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 15,
    color: Colors.chatText,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnPressed: {
    opacity: 0.9,
  },
});
