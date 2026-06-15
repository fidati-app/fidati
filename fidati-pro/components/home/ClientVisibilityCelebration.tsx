import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

type Props = {
  active: boolean;
  onComplete: () => void;
};

const EASING = Easing.out(Easing.cubic);

export function ClientVisibilityCelebration({ active, onComplete }: Props) {
  const progress = useSharedValue(0);
  const checkScale = useSharedValue(0.6);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      checkScale.value = 0.6;
      return;
    }

    progress.value = withTiming(1, { duration: 280, easing: EASING });
    checkScale.value = withDelay(
      120,
      withSequence(
        withTiming(1.08, { duration: 220, easing: EASING }),
        withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
      ),
    );

    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [active, onComplete, progress, checkScale]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }, { scale: 0.96 + progress.value * 0.04 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!active) return null;

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(200)} style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.pill, pillStyle]}>
        <Animated.View style={[styles.checkCircle, checkStyle]}>
          <Ionicons name="checkmark" size={18} color={Colors.white} />
        </Animated.View>
        <View style={styles.copy}>
          <AppText style={styles.title}>Sei di nuovo online</AppText>
          <AppText style={styles.sub}>I clienti possono trovarti di nuovo</AppText>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    ...Design.shadowSoft,
    maxWidth: 340,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.navy,
  },
  sub: {
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});
