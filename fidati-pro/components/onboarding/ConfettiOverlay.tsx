import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COLORS = ['#10B981', '#3B82F6', '#FBBF24', '#F472B6', '#8B5CF6'];

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startX = (index * 37) % SCREEN_W;
    translateX.value = startX;
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(
      index * 50,
      withRepeat(
        withSequence(
          withTiming(SCREEN_H * 0.55, { duration: 2200 + index * 80, easing: Easing.out(Easing.quad) }),
          withTiming(-20, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    rotate.value = withRepeat(withTiming(360, { duration: 1800 + index * 60 }), -1, false);
  }, [index, opacity, rotate, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        style,
        {
          backgroundColor: COLORS[index % COLORS.length],
          width: 6 + (index % 3) * 2,
          height: 10 + (index % 4) * 2,
        },
      ]}
    />
  );
}

export function ConfettiOverlay() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {Array.from({ length: 24 }).map((_, index) => (
        <ConfettiPiece key={index} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
