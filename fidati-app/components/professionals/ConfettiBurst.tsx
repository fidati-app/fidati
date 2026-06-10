import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

const CONFETTI_COLORS = [
  Colors.accent,
  '#34D399',
  '#FBBF24',
  '#60A5FA',
  '#F472B6',
  Colors.primary,
] as const;

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  drift: number;
  rotation: number;
  fallDistance: number;
}

interface ConfettiBurstProps {
  active: boolean;
}

export function ConfettiBurst({ active }: ConfettiBurstProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: 8 + Math.random() * 84,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 5 + Math.random() * 5,
        delay: Math.random() * 180,
        drift: -28 + Math.random() * 56,
        rotation: Math.random() * 360,
        fallDistance: 120 + Math.random() * 40,
      })),
    [],
  );

  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((anim) => anim.setValue(0));
      return;
    }

    const animations = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 900 + particles[index].delay * 0.4,
        delay: particles[index].delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );

    Animated.stagger(18, animations).start();
  }, [active, anims, particles]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {particles.map((particle, index) => {
        const progress = anims[index];
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, particle.fallDistance],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.drift],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [`${particle.rotation}deg`, `${particle.rotation + 220}deg`],
        });
        const scale = progress.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.4, 1, 0.85],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: `${particle.left}%`,
                width: particle.size,
                height: particle.size * 1.6,
                backgroundColor: particle.color,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
