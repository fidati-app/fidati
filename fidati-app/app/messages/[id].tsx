import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { BookingRequestCard } from '@/components/messages/BookingRequestCard';
import { FullScreenImageViewer } from '@/components/messages/FullScreenImageViewer';
import { ProfileImage } from '@/components/ProfileImage';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { useProfessional } from '@/hooks/useProfessionals';
import {
  appendChatMessage,
  getBookingRequest,
  getChatMessages,
} from '@/services/bookingRequests';
import { ChatMessage } from '@/types';
import { formatTypicalResponseTime } from '@/utils/professionalResponse';

function MessageBubble({
  message,
  onImagePress,
}: {
  message: ChatMessage;
  onImagePress: (uri: string) => void;
}) {
  const isUser = message.sender === 'user';
  const hasImage = Boolean(message.imageUri);
  const hasText = Boolean(message.text?.trim());
  const isPhotoOnly = hasImage && !hasText;

  if (isPhotoOnly) {
    return (
      <View style={[styles.photoOnlyWrap, isUser ? styles.photoOnlyUser : styles.photoOnlyPro]}>
        <Pressable onPress={() => onImagePress(message.imageUri!)}>
          <Image
            source={{ uri: message.imageUri }}
            style={styles.photoOnlyImage}
            contentFit="cover"
          />
        </Pressable>
        <AppText style={[styles.photoOnlyTime, isUser && styles.photoOnlyTimeUser]}>
          {message.timestamp}
        </AppText>
      </View>
    );
  }

  if (hasImage && hasText && isUser) {
    return (
      <View style={styles.bubbleUserMixed}>
        <Pressable onPress={() => onImagePress(message.imageUri!)}>
          <Image
            source={{ uri: message.imageUri }}
            style={styles.bubbleMixedImage}
            contentFit="cover"
          />
        </Pressable>
        <View style={styles.bubbleMixedBody}>
          <AppText style={styles.bubbleTextUser}>{message.text}</AppText>
          <AppText style={styles.bubbleTimeUser}>{message.timestamp}</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubblePro]}>
      {hasImage ? (
        <Pressable onPress={() => onImagePress(message.imageUri!)}>
          <Image source={{ uri: message.imageUri }} style={styles.bubbleImage} contentFit="cover" />
        </Pressable>
      ) : null}
      {hasText ? (
        <AppText style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
          {message.text}
        </AppText>
      ) : null}
      <AppText style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
        {message.timestamp}
      </AppText>
    </View>
  );
}

function ChatMessageItem({
  message,
  professionalId,
  onImagePress,
}: {
  message: ChatMessage;
  professionalId: string;
  onImagePress: (uri: string) => void;
}) {
  if (message.kind === 'booking_request') {
    const request = getBookingRequest(professionalId);
    if (!request) return null;
    return (
      <View style={styles.rowUserFull}>
        <BookingRequestCard
          request={request}
          timestamp={message.timestamp}
          onImagePress={onImagePress}
        />
      </View>
    );
  }

  if (message.kind === 'system') {
    return (
      <View style={styles.systemWrap}>
        <AppText style={styles.systemText}>{message.text}</AppText>
      </View>
    );
  }

  return (
    <View style={message.sender === 'user' ? styles.rowUserBubble : styles.rowPro}>
      <MessageBubble message={message} onImagePress={onImagePress} />
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { professional } = useProfessional(id ?? '');
  const professionalId = id ?? '';
  const bookingRequest = useMemo(
    () => (professionalId ? getBookingRequest(professionalId) : undefined),
    [professionalId],
  );
  const initialMessages = useMemo(
    () => (professionalId ? getChatMessages(professionalId) : []),
    [professionalId],
  );
  const [draft, setDraft] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
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

  const remainingMs = useCountdown(bookingRequest?.deadline ?? null);
  const countdownLabel = formatCountdown(remainingMs);
  const isExpired = Boolean(bookingRequest && remainingMs <= 0);
  const canSend = draft.trim().length > 0 || Boolean(pendingImage);

  const pickComposerPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Accesso alle foto',
        'Consenti l\'accesso alla galleria per allegare immagini in chat.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text && !pendingImage) return;

    const timestamp = new Date().toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      kind: 'text',
      text,
      timestamp,
      imageUri: pendingImage ?? undefined,
    };

    appendChatMessage(professionalId, message);
    setMessages((current) => [...current, message]);
    setDraft('');
    setPendingImage(null);
  };

  if (!professional) {
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

      <FullScreenImageViewer
        uri={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </Pressable>

        <Pressable
          onPress={() => router.push(`/professionals/${professional.id}`)}
          style={({ pressed }) => [styles.headerMain, pressed && styles.headerMainPressed]}
        >
          <View style={styles.avatarRing}>
            <ProfileImage
              name={professional.name}
              imageUrl={professional.imageUrl}
              fallbackColor={professional.avatarColor}
              size={40}
              shape="circle"
            />
          </View>

          <View style={styles.headerCopy}>
            <View style={styles.nameRow}>
              <AppText style={styles.headerName} numberOfLines={1}>
                {professional.name}
              </AppText>
              {professional.verified ? (
                <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              ) : null}
            </View>
            <AppText style={styles.headerMeta} numberOfLines={1}>
              {formatTypicalResponseTime(professional.id)}
            </AppText>
          </View>
        </Pressable>
      </View>

      {bookingRequest ? (
        <View style={[styles.countdownBanner, isExpired && styles.countdownBannerExpired]}>
          <Ionicons
            name={isExpired ? 'time-outline' : 'timer-outline'}
            size={18}
            color={isExpired ? Colors.textSecondary : Colors.accent}
          />
          <View style={styles.countdownCopy}>
            <AppText style={styles.countdownTitle}>
              {isExpired ? 'Tempo scaduto' : 'In attesa di risposta'}
            </AppText>
            <AppText style={styles.countdownText}>
              {isExpired
                ? 'Stiamo proponendo la richiesta ad altri professionisti simili.'
                : `${professional.name.split(' ')[0]} ha ancora ${countdownLabel} per risponderti.`}
            </AppText>
          </View>
          {!isExpired ? (
            <View style={styles.countdownBadge}>
              <AppText style={styles.countdownBadgeText}>{countdownLabel}</AppText>
            </View>
          ) : null}
        </View>
      ) : null}

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
          <ChatMessageItem
            key={message.id}
            message={message}
            professionalId={professionalId}
            onImagePress={setFullscreenImage}
          />
        ))}
      </ScrollView>

      <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {pendingImage ? (
          <View style={styles.pendingPreviewRow}>
            <View style={styles.pendingPreviewWrap}>
              <Pressable onPress={() => setFullscreenImage(pendingImage)}>
                <Image source={{ uri: pendingImage }} style={styles.pendingPreview} contentFit="cover" />
              </Pressable>
              <Pressable
                onPress={() => setPendingImage(null)}
                hitSlop={6}
                style={styles.pendingRemoveBtn}
              >
                <Ionicons name="close" size={12} color={Colors.white} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable
            onPress={pickComposerPhoto}
            hitSlop={8}
            style={({ pressed }) => [styles.attachBtn, pressed && styles.attachBtnPressed]}
          >
            <Ionicons name="image-outline" size={21} color={Colors.primary} />
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
  headerMainPressed: {
    opacity: 0.85,
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
    color: Colors.primary,
    flexShrink: 1,
    includeFontPadding: false,
  },
  headerMeta: {
    fontSize: 11,
    lineHeight: 13,
    color: Colors.textSecondary,
    includeFontPadding: false,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 10,
    padding: 12,
    borderRadius: Design.radius.card,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  countdownBannerExpired: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  countdownCopy: {
    flex: 1,
    gap: 2,
  },
  countdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  countdownText: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  countdownBadge: {
    minWidth: 54,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  countdownBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  rowUserFull: {
    width: '100%',
    paddingLeft: 28,
  },
  rowUserBubble: {
    width: '100%',
    paddingLeft: 28,
    alignItems: 'flex-end',
  },
  rowPro: {
    width: '100%',
    paddingRight: 28,
    alignItems: 'flex-start',
  },
  systemWrap: {
    alignSelf: 'center',
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemText: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bubble: {
    maxWidth: '100%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
    maxWidth: '88%',
  },
  bubblePro: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 6,
    alignSelf: 'flex-start',
    maxWidth: '88%',
  },
  photoOnlyWrap: {
    gap: 4,
    maxWidth: '72%',
  },
  photoOnlyUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  photoOnlyPro: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  photoOnlyImage: {
    width: 200,
    height: 156,
    borderRadius: 16,
    backgroundColor: Colors.border,
    ...Design.shadow,
  },
  photoOnlyTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  photoOnlyTimeUser: {
    textAlign: 'right',
  },
  bubbleUserMixed: {
    maxWidth: '72%',
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'flex-end',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadow,
  },
  bubbleMixedImage: {
    width: '100%',
    height: 156,
    backgroundColor: Colors.border,
  },
  bubbleMixedBody: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 9,
    gap: 4,
    backgroundColor: Colors.accent,
  },
  bubbleImage: {
    width: 180,
    height: 140,
    borderRadius: 10,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.primary,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  pendingPreviewRow: {
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  pendingPreviewWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    ...Design.shadow,
  },
  pendingPreview: {
    width: '100%',
    height: '100%',
  },
  pendingRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(1, 13, 32, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: Colors.primary,
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
