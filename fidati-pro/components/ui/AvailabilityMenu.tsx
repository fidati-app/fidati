import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export type AvailabilityToggleMode =
  | 'available'
  | 'unavailable'
  | 'verification_review'
  | 'profile_incomplete'
  | 'hidden_changes'
  | 'pending_review';

interface AvailabilityMenuProps {
  available: boolean;
  mode?: AvailabilityToggleMode;
  onChange: (available: boolean) => void;
  onReviewPress?: () => void;
  onIncompletePress?: () => void;
  onHiddenChangesPress?: () => void;
  onPendingReviewPress?: () => void;
}

type Anchor = { x: number; y: number; width: number; height: number };

const MENU_MIN_WIDTH = 272;
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.in(Easing.cubic);

export function AvailabilityMenu({
  available,
  mode,
  onChange,
  onReviewPress,
  onIncompletePress,
  onHiddenChangesPress,
  onPendingReviewPress,
}: AvailabilityMenuProps) {
  const toggleMode: AvailabilityToggleMode =
    mode ?? (available ? 'available' : 'unavailable');
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor>({ x: 0, y: 0, width: 0, height: 0 });

  const progress = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (open) {
      progress.value = withTiming(1, { duration: 200, easing: OPEN_EASING });
      backdropOpacity.value = withTiming(1, { duration: 200, easing: OPEN_EASING });
    } else {
      progress.value = 0;
      backdropOpacity.value = 0;
    }
  }, [open, progress, backdropOpacity]);

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -12 }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const openMenu = () => {
    if (toggleMode === 'verification_review') {
      onReviewPress?.();
      return;
    }
    if (toggleMode === 'profile_incomplete') {
      onIncompletePress?.();
      return;
    }
    if (toggleMode === 'hidden_changes') {
      onHiddenChangesPress?.();
      return;
    }
    if (toggleMode === 'pending_review') {
      onPendingReviewPress?.();
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const closeMenu = () => {
    progress.value = withTiming(0, { duration: 160, easing: CLOSE_EASING });
    backdropOpacity.value = withTiming(0, { duration: 160, easing: CLOSE_EASING });
    setTimeout(() => setOpen(false), 170);
  };

  const select = (value: boolean) => {
    onChange(value);
    closeMenu();
  };

  const menuWidth = Math.max(anchor.width, MENU_MIN_WIDTH);
  const screenWidth = Dimensions.get('window').width;
  const menuLeft = Math.max(12, Math.min(anchor.x, screenWidth - menuWidth - 12));

  const triggerStyle =
    toggleMode === 'verification_review' ||
    toggleMode === 'profile_incomplete' ||
    toggleMode === 'hidden_changes' ||
    toggleMode === 'pending_review'
      ? styles.triggerReview
      : toggleMode === 'available'
        ? styles.triggerOn
        : styles.triggerOff;

  const dotStyle =
    toggleMode === 'verification_review' ||
    toggleMode === 'profile_incomplete' ||
    toggleMode === 'hidden_changes' ||
    toggleMode === 'pending_review'
      ? styles.dotReview
      : toggleMode === 'available'
        ? styles.dotOn
        : styles.dotOff;

  return (
    <View style={styles.wrap}>
      <View ref={triggerRef} collapsable={false}>
      <Pressable
        onPress={openMenu}
        hitSlop={6}
        accessibilityLabel={
          toggleMode === 'verification_review'
            ? 'Profilo in revisione'
            : toggleMode === 'profile_incomplete'
              ? 'Profilo incompleto'
              : toggleMode === 'hidden_changes'
                ? 'Modifiche richieste'
                : toggleMode === 'pending_review'
                  ? 'Correzioni in revisione'
                  : 'Cambia disponibilità'
        }
        style={[styles.trigger, triggerStyle]}
      >
        <View style={[styles.dot, dotStyle]} />
        {toggleMode === 'verification_review' ||
        toggleMode === 'profile_incomplete' ||
        toggleMode === 'hidden_changes' ||
        toggleMode === 'pending_review' ? (
          <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.9)" />
        ) : (
          <Animated.View style={chevronAnimatedStyle}>
            <Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.9)" />
          </Animated.View>
        )}
      </Pressable>
      </View>

      <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.menu,
              {
                top: anchor.y + anchor.height + 8,
                left: menuLeft,
                width: menuWidth,
              },
              menuAnimatedStyle,
            ]}
          >
            <View>
              <AppText style={styles.menuTitle}>Disponibilità</AppText>

              <Pressable
                style={[styles.menuItem, available && styles.menuItemActiveOn]}
                onPress={() => select(true)}
              >
                <View style={[styles.menuDot, styles.menuDotOn]} />
                <AppText
                  style={[styles.menuLabel, available && styles.menuLabelActiveOn]}
                  numberOfLines={2}
                >
                  Disponibile oggi
                </AppText>
                {available ? (
                  <Ionicons name="checkmark" size={16} color={Colors.accent} />
                ) : (
                  <View style={styles.menuCheckSpacer} />
                )}
              </Pressable>

              <View style={styles.menuDivider} />

              <Pressable
                style={[styles.menuItem, !available && styles.menuItemActiveOff]}
                onPress={() => select(false)}
              >
                <View style={[styles.menuDot, styles.menuDotOff]} />
                <AppText
                  style={[styles.menuLabel, styles.menuLabelOff, !available && styles.menuLabelActiveOff]}
                  numberOfLines={2}
                >
                  Non disponibile oggi
                </AppText>
                {!available ? (
                  <Ionicons name="checkmark" size={16} color={Colors.error} />
                ) : (
                  <View style={styles.menuCheckSpacer} />
                )}
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 20,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 42,
    paddingHorizontal: 11,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
  },
  triggerOn: {
    borderColor: 'rgba(16, 185, 129, 0.55)',
  },
  triggerOff: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  triggerReview: {
    borderColor: 'rgba(245, 158, 11, 0.55)',
    paddingHorizontal: 12,
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotOn: {
    backgroundColor: Colors.accent,
  },
  dotOff: {
    backgroundColor: Colors.error,
  },
  dotReview: {
    backgroundColor: Colors.pending,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 37, 74, 0.35)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    overflow: 'hidden',
    ...Design.shadow,
  },
  menuTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemActiveOn: {
    backgroundColor: Colors.successSoft,
  },
  menuItemActiveOff: {
    backgroundColor: Colors.errorSoft,
  },
  menuDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  menuDotOn: {
    backgroundColor: Colors.accent,
  },
  menuDotOff: {
    backgroundColor: Colors.error,
  },
  menuLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    lineHeight: 18,
  },
  menuLabelActiveOn: {
    fontWeight: '700',
    color: Colors.navy,
  },
  menuLabelOff: {
    color: Colors.error,
  },
  menuLabelActiveOff: {
    fontWeight: '700',
    color: Colors.error,
  },
  menuCheckSpacer: {
    width: 16,
    flexShrink: 0,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
});
