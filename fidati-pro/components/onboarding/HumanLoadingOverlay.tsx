import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { HUMAN_LOADING_MESSAGES } from '@/constants/onboarding';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface HumanLoadingOverlayProps {
  visible: boolean;
}

export function HumanLoadingOverlay({ visible }: HumanLoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % HUMAN_LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.success} />
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} key={messageIndex}>
          <AppText style={styles.message}>{HUMAN_LOADING_MESSAGES[messageIndex]}</AppText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 246, 249, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    elevation: 200,
  },
  card: {
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 28,
    paddingVertical: 32,
    borderRadius: Design.radius.xl,
    backgroundColor: Colors.white,
    ...Design.shadow,
    maxWidth: 320,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.navy,
    textAlign: 'center',
    fontWeight: '600',
  },
});
