import { ReactNode, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface RevealContinueFooterProps {
  visible: boolean;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  hint?: ReactNode;
}

const DURATION_MS = 280;

export function RevealContinueFooter({
  visible,
  title,
  onPress,
  disabled,
  loading,
  hint,
}: RevealContinueFooterProps) {
  const insets = useSafeAreaInsets();
  const latchedRef = useRef(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  if (visible) {
    latchedRef.current = true;
  }

  const show = latchedRef.current;

  useEffect(() => {
    if (!show) return;
    opacity.value = withTiming(1, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [show, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!show) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          paddingBottom: insets.bottom + 16,
        },
        animatedStyle,
      ]}
    >
      {hint}
      <PrimaryButton title={title} onPress={onPress} disabled={disabled} loading={loading} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
    gap: 8,
  },
});
