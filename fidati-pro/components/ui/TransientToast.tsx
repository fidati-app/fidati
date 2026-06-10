import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface TransientToastProps {
  visible: boolean;
  title: string;
  message: string;
  duration?: number;
  onHidden: () => void;
}

const ENTER_MS = 380;
const EXIT_MS = 320;
const ENTER_EASING = Easing.bezier(0.16, 1, 0.3, 1);
const EXIT_EASING = Easing.bezier(0.4, 0, 0.85, 1);

function delayedProgress(progress: number, start: number) {
  'worklet';
  if (progress <= start) return 0;
  return Math.min(1, (progress - start) / (1 - start));
}

export function TransientToast({
  visible,
  title,
  message,
  duration = 3000,
  onHidden,
}: TransientToastProps) {
  const progress = useSharedValue(0);
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  const containerStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: interpolate(p, [0, 0.35, 1], [0, 0.92, 1]),
      transform: [
        { translateY: interpolate(p, [0, 1], [-18, 0]) },
        { scale: interpolate(p, [0, 1], [0.92, 1]) },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const p = delayedProgress(progress.value, 0.12);
    return {
      opacity: p,
      transform: [{ scale: interpolate(p, [0, 1], [0.55, 1]) }],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const p = delayedProgress(progress.value, 0.22);
    return {
      opacity: p,
      transform: [{ translateX: interpolate(p, [0, 1], [-6, 0]) }],
    };
  });

  useEffect(() => {
    if (!visible) return;

    progress.value = 0;
    progress.value = withTiming(1, { duration: ENTER_MS, easing: ENTER_EASING });

    const hide = () => onHiddenRef.current();
    const exitAt = Math.max(0, duration - EXIT_MS);
    const timeout = setTimeout(() => {
      progress.value = withTiming(0, { duration: EXIT_MS, easing: EXIT_EASING }, (finished) => {
        if (finished) runOnJS(hide)();
      });
    }, exitAt);

    return () => clearTimeout(timeout);
  }, [visible, duration, progress]);

  if (!visible) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, containerStyle]}>
      <Animated.View style={iconStyle}>
        <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
      </Animated.View>
      <Animated.View style={[styles.textWrap, textStyle]}>
        <AppText style={styles.text} numberOfLines={2}>
          <AppText style={styles.title}>{title} </AppText>
          {message}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Design.spacing.screen,
    marginTop: 8,
    marginBottom: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Design.radius.md,
    backgroundColor: Colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    ...Design.shadowSoft,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
  },
  text: {
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
