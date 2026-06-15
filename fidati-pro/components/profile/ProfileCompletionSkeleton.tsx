import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { PROFILE_STEP_TOTAL } from '@/constants/profileSteps';

interface ProfileCompletionSkeletonProps {
  variant?: 'full' | 'compact';
  stepCount?: number;
}

function SkeletonBlock({
  style,
  pulse,
}: {
  style: object | object[];
  pulse: Animated.Value;
}) {
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.85],
  });

  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

export function ProfileCompletionSkeleton({
  variant = 'full',
  stepCount = PROFILE_STEP_TOTAL,
}: ProfileCompletionSkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  if (variant === 'compact') {
    return (
      <View style={styles.compactWrap}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.compactRow}>
            <SkeletonBlock pulse={pulse} style={styles.compactDot} />
            <SkeletonBlock pulse={pulse} style={styles.compactLine} />
          </View>
        ))}
        <SkeletonBlock pulse={pulse} style={styles.compactFooterLine} />
      </View>
    );
  }

  return (
    <View style={styles.fullWrap}>
      <View style={styles.summaryCard}>
        <SkeletonBlock pulse={pulse} style={styles.ring} />
        <View style={styles.summaryCopy}>
          <SkeletonBlock pulse={pulse} style={styles.titleLine} />
          <SkeletonBlock pulse={pulse} style={styles.subLine} />
          <SkeletonBlock pulse={pulse} style={[styles.subLine, styles.subLineShort]} />
        </View>
      </View>

      <View style={styles.stepsCard}>
        {Array.from({ length: stepCount }).map((_, index) => (
          <View key={index} style={[styles.stepRow, index > 0 && styles.stepRowBorder]}>
            <SkeletonBlock pulse={pulse} style={styles.stepIcon} />
            <View style={styles.stepCopy}>
              <SkeletonBlock pulse={pulse} style={styles.stepTitle} />
              <SkeletonBlock pulse={pulse} style={styles.stepSub} />
            </View>
            <SkeletonBlock pulse={pulse} style={styles.stepAction} />
          </View>
        ))}
      </View>

      <SkeletonBlock pulse={pulse} style={styles.cta} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.border,
    borderRadius: 8,
  },
  fullWrap: {
    gap: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Design.shadowSoft,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  summaryCopy: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 16,
    width: '78%',
    borderRadius: 6,
  },
  subLine: {
    height: 12,
    width: '100%',
    borderRadius: 6,
  },
  subLineShort: {
    width: '62%',
  },
  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  stepRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  stepCopy: {
    flex: 1,
    gap: 6,
  },
  stepTitle: {
    height: 14,
    width: '72%',
    borderRadius: 6,
  },
  stepSub: {
    height: 11,
    width: '54%',
    borderRadius: 6,
  },
  stepAction: {
    width: 68,
    height: 28,
    borderRadius: 8,
  },
  cta: {
    height: 48,
    borderRadius: Design.radius.md,
  },
  compactWrap: {
    gap: 6,
    marginTop: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  compactLine: {
    flex: 1,
    height: 11,
    borderRadius: 6,
  },
  compactFooterLine: {
    marginTop: 4,
    height: 11,
    width: '68%',
    borderRadius: 6,
  },
});
