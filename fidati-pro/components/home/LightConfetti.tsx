import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#10B981', '#FBBF24', '#60A5FA', '#F472B6', '#A78BFA'];

type Props = {
  active: boolean;
};

const PIECES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: 8 + (index * 17) % 92,
  color: COLORS[index % COLORS.length],
  delay: (index % 6) * 70,
  size: 5 + (index % 3),
}));

export function LightConfetti({ active }: Props) {
  if (!active) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      {PIECES.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  left,
  color,
  delay,
  size,
}: {
  left: number;
  color: string;
  delay: number;
  size: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.85,
    transform: [
      { translateY: progress.value * 72 },
      { rotate: `${progress.value * 180}deg` },
      { scale: 1 - progress.value * 0.35 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        style,
        {
          left: `${left}%`,
          width: size,
          height: size,
          backgroundColor: color,
        },
      ]}
    />
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
