import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';

interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
  labelSize?: number;
}

export function ProgressRing({
  percent,
  size = 76,
  stroke = 7,
  label,
  labelSize = 17,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const progress = useSharedValue(clamped);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const ringStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const rotation = (p / 100) * 360 - 90;
    return {
      transform: [{ rotate: `${rotation}deg` }],
      borderRightColor: p > 12 ? Colors.success : '#E8EDF2',
      borderBottomColor: p > 37 ? Colors.success : '#E8EDF2',
      borderLeftColor: p > 62 ? Colors.success : '#E8EDF2',
      borderTopColor: p > 87 ? Colors.success : '#E8EDF2',
    };
  });

  const centerLabel = label ?? `${clamped}%`;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.track,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.progress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: stroke,
          },
          ringStyle,
        ]}
      />
      <AppText style={[styles.label, { fontSize: labelSize }]}>{centerLabel}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    borderColor: '#E8EDF2',
  },
  progress: {
    position: 'absolute',
    borderColor: Colors.success,
  },
  label: {
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.5,
  },
});
