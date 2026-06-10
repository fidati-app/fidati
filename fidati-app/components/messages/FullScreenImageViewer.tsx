import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';

interface FullScreenImageViewerProps {
  uri: string | null;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

function resetZoomState(
  scale: SharedValue<number>,
  savedScale: SharedValue<number>,
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  savedTranslateX: SharedValue<number>,
  savedTranslateY: SharedValue<number>,
  animated: boolean,
) {
  'worklet';
  if (animated) {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  } else {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  }
  savedScale.value = 1;
  savedTranslateX.value = 0;
  savedTranslateY.value = 0;
}

export function FullScreenImageViewer({ uri, onClose }: FullScreenImageViewerProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [uri, scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      'worklet';
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= MIN_SCALE) {
        resetZoomState(
          scale,
          savedScale,
          translateX,
          translateY,
          savedTranslateX,
          savedTranslateY,
          true,
        );
        return;
      }
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      'worklet';
      if (scale.value > 1) {
        resetZoomState(
          scale,
          savedScale,
          translateX,
          translateY,
          savedTranslateX,
          savedTranslateY,
          true,
        );
        return;
      }
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      savedScale.value = DOUBLE_TAP_SCALE;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = () => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    onClose();
  };

  return (
    <Modal visible={Boolean(uri)} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.backdrop}>
          {uri ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View style={styles.imageStage}>
                <Animated.View style={[styles.imageWrap, animatedImageStyle]}>
                  <Image source={{ uri }} style={styles.image} contentFit="contain" />
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          ) : null}

          <Pressable
            onPress={handleClose}
            hitSlop={14}
            style={[styles.closeBtn, { top: insets.top + 10 }]}
          >
            <Ionicons name="close" size={28} color={Colors.primary} />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 13, 32, 0.97)',
  },
  imageStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
});
