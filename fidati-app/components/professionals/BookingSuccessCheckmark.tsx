import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

export function BookingSuccessCheckmark() {
  const circleScale = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    circleScale.setValue(0);
    circleOpacity.setValue(0);
    checkScale.setValue(0);
    checkOpacity.setValue(0);
    ringScale.setValue(0.6);
    ringOpacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(circleScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.35,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0.35,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 420,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [checkOpacity, checkScale, circleOpacity, circleScale, ringOpacity, ringScale]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: circleOpacity,
            transform: [{ scale: circleScale }],
          },
        ]}
      >
        <Animated.View
          style={{
            opacity: checkOpacity,
            transform: [{ scale: checkScale }],
          }}
        >
          <Ionicons name="checkmark" size={34} color={Colors.white} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
