import { ReactNode, RefObject, useCallback, useRef } from 'react';
import {
  Keyboard,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

/** Spazio tra input e tastiera. */
const GAP_ABOVE_KEYBOARD = 14;
/** Margine minimo sotto l'header compatto. */
const SAFE_TOP = 12;
const EXTRA_BOTTOM_PADDING = 40;
const FOOTER_HEIGHT = 88;

interface OnboardingStepScrollProps {
  children: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  contentRef?: RefObject<View | null>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollViewLayout?: (event: LayoutChangeEvent) => void;
  keyboardHeight?: number;
  footerRevealed?: boolean;
}

export function OnboardingStepScroll({
  children,
  scrollRef: externalRef,
  contentRef: externalContentRef,
  onScroll,
  onScrollViewLayout,
  keyboardHeight: keyboardHeightProp,
  footerRevealed = false,
}: OnboardingStepScrollProps) {
  const internalRef = useRef<ScrollView>(null);
  const internalContentRef = useRef<View>(null);
  const scrollRef = externalRef ?? internalRef;
  const contentRef = externalContentRef ?? internalContentRef;
  const internalKeyboardHeight = useKeyboardHeight();
  const keyboardHeight = keyboardHeightProp ?? internalKeyboardHeight;
  const footerPad = footerRevealed ? FOOTER_HEIGHT : 0;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: SAFE_TOP,
          paddingBottom: keyboardHeight + footerPad + EXTRA_BOTTOM_PADDING,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={onScroll}
      onLayout={onScrollViewLayout}
      scrollEventThrottle={16}
      nestedScrollEnabled
    >
      <View ref={contentRef} collapsable={false} style={styles.contentInner}>
        {children}
      </View>
    </ScrollView>
  );
}

export function useOnboardingScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const scrollYRef = useRef(0);
  const scrollViewHeightRef = useRef(0);
  const keyboardHeight = useKeyboardHeight();

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const onScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
    scrollViewHeightRef.current = event.nativeEvent.layout.height;
  }, []);

  const scrollFieldIntoView = useCallback(
    (fieldRef: RefObject<View | null>, kbHeight: number, footerRevealed = false) => {
      const field = fieldRef.current;
      const content = contentRef.current;
      const scroll = scrollRef.current;
      const viewHeight = scrollViewHeightRef.current;
      if (!field || !content || !scroll || viewHeight <= 0) return;

      field.measureLayout(
        content,
        (_left, top, _width, height) => {
          const scrollY = scrollYRef.current;
          const footerOverlap = footerRevealed ? FOOTER_HEIGHT : 0;
          const keyboardOverlap = kbHeight > 0 ? Math.max(0, kbHeight - footerOverlap) : 0;
          const visibleHeight = viewHeight - keyboardOverlap;
          const maxFieldBottom = visibleHeight - GAP_ABOVE_KEYBOARD;

          const fieldTop = top - scrollY;
          const fieldBottom = top + height - scrollY;

          if (kbHeight > 0 && fieldTop >= SAFE_TOP && fieldBottom <= maxFieldBottom) {
            return;
          }

          let newScrollY = scrollY;

          if (kbHeight > 0 && fieldBottom > maxFieldBottom) {
            newScrollY += fieldBottom - maxFieldBottom;
          }

          const adjustedTop = top - newScrollY;
          if (adjustedTop < SAFE_TOP) {
            newScrollY = Math.max(0, top - SAFE_TOP);
          }

          if (Math.abs(newScrollY - scrollY) < 2) return;

          scroll.scrollTo({ y: newScrollY, animated: true });
        },
        () => {},
      );
    },
    [],
  );

  const scrollToField = useCallback(
    (fieldRef: RefObject<View | null>, footerRevealed = false) => {
      const run = (kb: number) => {
        requestAnimationFrame(() => scrollFieldIntoView(fieldRef, kb, footerRevealed));
      };

      if (keyboardHeight > 0) {
        setTimeout(() => run(keyboardHeight), Platform.OS === 'ios' ? 80 : 40);
        return;
      }

      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const sub = Keyboard.addListener(showEvent, (event) => {
        run(event.endCoordinates.height);
        sub.remove();
      });

      setTimeout(() => sub.remove(), 600);
    },
    [keyboardHeight, scrollFieldIntoView],
  );

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, Platform.OS === 'ios' ? 120 : 80);
  }, []);

  return {
    scrollRef,
    contentRef,
    scrollToField,
    scrollToEnd,
    onScroll,
    onScrollViewLayout,
    keyboardHeight,
  };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  contentInner: {
    flexGrow: 1,
  },
});
