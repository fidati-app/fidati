import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { ProfileImage } from '@/components/ProfileImage';
import { BookingDateTimeFields } from '@/components/professionals/BookingDateTimeFields';
import { BookingNoteField } from '@/components/professionals/BookingNoteField';
import { BookingSection } from '@/components/professionals/BookingSection';
import { BookingSentModal } from '@/components/professionals/BookingSentModal';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { createBookingRequest } from '@/services/bookingRequests';
import { Professional, ServicePackage } from '@/types';

interface ProfessionalBookingBarProps {
  professional: Professional;
  selectedPackage?: ServicePackage;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PANEL_HEIGHT_RATIO = 0.85;
const ANIM_DURATION = 300;
const DRAG_CLOSE_THRESHOLD = 0.2;

export function ProfessionalBookingBar({
  professional,
  selectedPackage,
}: ProfessionalBookingBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const panelHeightMax = SCREEN_HEIGHT * PANEL_HEIGHT_RATIO;

  const [sheetMounted, setSheetMounted] = useState(false);
  const [sentModalVisible, setSentModalVisible] = useState(false);
  const [hasPickedDate, setHasPickedDate] = useState(false);
  const [hasPickedTime, setHasPickedTime] = useState(false);
  const [bookingDateTime, setBookingDateTime] = useState(() => {
    const initial = new Date();
    initial.setDate(initial.getDate() + 1);
    initial.setHours(10, 0, 0, 0);
    return initial;
  });
  const [bookingNote, setBookingNote] = useState('');
  const [bookingPhotos, setBookingPhotos] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [isClosing, setIsClosing] = useState(false);
  const sheetHandlersRef = useRef({
    closeSheet: () => {},
    snapOpen: () => {},
    isClosing: false,
    panelHeightMax,
  });

  const hasPackage = Boolean(selectedPackage);
  const priceAmount = hasPackage
    ? `${selectedPackage!.price}€`
    : `da ${professional.pricePerHour}€/h`;
  const priceTag = hasPackage ? 'Tot.' : 'Prezzo';
  const firstName = professional.name.split(' ')[0];
  const isFormComplete = hasPickedDate && hasPickedTime;

  const resetForm = () => {
    setHasPickedDate(false);
    setHasPickedTime(false);
    setShowValidationErrors(false);
    setBookingNote('');
    setBookingPhotos([]);
  };

  const runShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const runAnimation = useCallback(
    (open: boolean, onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: open ? 1 : 0,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(backdropAnim, {
          toValue: open ? 1 : 0,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsClosing(false);
          onDone?.();
        }
      });
    },
    [slideAnim, backdropAnim],
  );

  useEffect(() => {
    if (sheetMounted) {
      runAnimation(true);
    }
  }, [sheetMounted, runAnimation]);

  const panelHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, panelHeightMax],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const openSheet = () => {
    if (!selectedPackage || sheetMounted || isClosing) return;
    slideAnim.setValue(0);
    backdropAnim.setValue(0);
    resetForm();
    setSheetMounted(true);
  };

  const closeSheet = () => {
    if (!sheetMounted || isClosing) return;
    setIsClosing(true);
    runAnimation(false, () => {
      setSheetMounted(false);
      resetForm();
    });
  };

  const snapOpen = useCallback(() => {
    runAnimation(true);
  }, [runAnimation]);

  sheetHandlersRef.current = {
    closeSheet,
    snapOpen,
    isClosing,
    panelHeightMax,
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !sheetHandlersRef.current.isClosing,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !sheetHandlersRef.current.isClosing && gesture.dy > 4,
      onPanResponderGrant: () => {
        slideAnim.stopAnimation();
        backdropAnim.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy <= 0) return;
        const max = sheetHandlersRef.current.panelHeightMax;
        const progress = Math.max(0, 1 - gesture.dy / max);
        slideAnim.setValue(progress);
        backdropAnim.setValue(progress);
      },
      onPanResponderRelease: (_, gesture) => {
        const max = sheetHandlersRef.current.panelHeightMax;
        const shouldClose =
          gesture.dy > max * DRAG_CLOSE_THRESHOLD || gesture.vy > 0.75;
        if (shouldClose) {
          sheetHandlersRef.current.closeSheet();
        } else {
          sheetHandlersRef.current.snapOpen();
        }
      },
      onPanResponderTerminate: (_, gesture) => {
        const max = sheetHandlersRef.current.panelHeightMax;
        const shouldClose =
          gesture.dy > max * DRAG_CLOSE_THRESHOLD || gesture.vy > 0.75;
        if (shouldClose) {
          sheetHandlersRef.current.closeSheet();
        } else {
          sheetHandlersRef.current.snapOpen();
        }
      },
    }),
  ).current;

  const handleConfirm = () => {
    if (!selectedPackage) return;

    const bookingDate = bookingDateTime.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const bookingTime = bookingDateTime.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    createBookingRequest({
      professionalId: professional.id,
      professionalName: professional.name,
      imageUrl: professional.imageUrl,
      avatarColor: professional.avatarColor,
      packageTitle: selectedPackage.title,
      servicePrice: selectedPackage.price,
      bookingDate,
      bookingTime,
      note: bookingNote,
      photos: bookingPhotos,
    });

    setShowValidationErrors(false);
    closeSheet();
    setSentModalVisible(true);
  };

  const handleBookingAction = () => {
    if (!selectedPackage || isClosing) return;

    if (!sheetMounted) {
      openSheet();
      return;
    }

    if (!hasPickedDate || !hasPickedTime) {
      setShowValidationErrors(true);
      runShake();
      return;
    }

    handleConfirm();
  };

  const goToChat = () => {
    setSentModalVisible(false);
    router.replace(`/messages/${professional.id}`);
  };

  return (
    <>
      <BookingSentModal
        visible={sentModalVisible}
        professionalName={professional.name}
        packageTitle={selectedPackage?.title ?? 'Servizio'}
        onGoToChat={goToChat}
      />

      {sheetMounted ? (
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdropPress} onPress={closeSheet} />
        </Animated.View>
      ) : null}

      <View style={[styles.root, { zIndex: 20 }]}>
        {sheetMounted ? (
          <Animated.View style={[styles.panel, { height: panelHeight }]}>
            <View style={styles.panelHeader}>
              <View style={styles.dragArea} {...panResponder.panHandlers}>
                <View style={styles.handle} />
              </View>
              <Pressable
                onPress={closeSheet}
                hitSlop={12}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.panelScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.panelContent}
            >
              <AppText style={styles.panelTitle}>Conferma prenotazione</AppText>

              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <View style={styles.sections}>
                  <BookingSection title="Riepilogo">
                    <View style={styles.summaryTop}>
                      <ProfileImage
                        name={professional.name}
                        imageUrl={professional.imageUrl}
                        fallbackColor={professional.avatarColor}
                        size={44}
                        shape="circle"
                      />
                      <View style={styles.proCopy}>
                        <AppText style={styles.proName} numberOfLines={1}>
                          {professional.name}
                        </AppText>
                        <AppText style={styles.proCategory} numberOfLines={1}>
                          {professional.category}
                        </AppText>
                      </View>
                      {selectedPackage ? (
                        <AppText style={styles.summaryPrice}>{selectedPackage.price}€</AppText>
                      ) : null}
                    </View>

                    {selectedPackage ? (
                      <View style={styles.serviceRow}>
                        <AppText style={styles.packageTitle} numberOfLines={1}>
                          {selectedPackage.title}
                        </AppText>
                        <AppText style={styles.packageMeta} numberOfLines={1}>
                          · {selectedPackage.duration}
                        </AppText>
                      </View>
                    ) : null}
                  </BookingSection>

                  <BookingDateTimeFields
                    value={bookingDateTime}
                    onChange={setBookingDateTime}
                    hasPickedDate={hasPickedDate}
                    hasPickedTime={hasPickedTime}
                    showErrors={showValidationErrors}
                    onDatePicked={() => setHasPickedDate(true)}
                    onTimePicked={() => setHasPickedTime(true)}
                  />

                  <BookingNoteField
                    note={bookingNote}
                    photos={bookingPhotos}
                    onNoteChange={setBookingNote}
                    onPhotosChange={setBookingPhotos}
                  />
                </View>
              </Animated.View>

              <View style={styles.infoRow}>
                <Ionicons name="information-circle-outline" size={15} color={Colors.accent} />
                <AppText style={styles.infoText}>
                  <AppText style={styles.infoName}>{firstName}</AppText> risponde entro{' '}
                  <AppText style={styles.infoHighlight}>1 ora</AppText>, altrimenti proponiamo
                  altri professionisti simili.
                </AppText>
              </View>
            </ScrollView>

            <View style={[styles.sheetFooter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View style={styles.sheetPriceBlock}>
                <AppText style={styles.sheetPriceTag}>{priceTag}</AppText>
                <AppText style={styles.sheetPrice}>{priceAmount}</AppText>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.sheetButton,
                  !selectedPackage && styles.sheetButtonDisabled,
                  isFormComplete && styles.sheetButtonReady,
                  pressed && styles.sheetButtonPressed,
                ]}
                onPress={handleBookingAction}
                disabled={!selectedPackage || isClosing}
              >
                <AppText style={styles.sheetButtonText}>Conferma richiesta</AppText>
              </Pressable>
            </View>
          </Animated.View>
        ) : null}

        {!sheetMounted ? (
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.priceBlock}>
              <View style={styles.priceRow}>
                <AppText style={styles.priceTag}>{priceTag}</AppText>
                <AppText style={styles.price}>{priceAmount}</AppText>
              </View>
              <AppText style={styles.sublabel}>
                {hasPackage ? 'Pacchetto selezionato' : 'Prezzo indicativo'}
              </AppText>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                !selectedPackage && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBookingAction}
              disabled={!selectedPackage || isClosing}
            >
              <AppText style={styles.buttonText}>Prenota ora</AppText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 15,
  },
  backdropPress: {
    flex: 1,
  },
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderTopLeftRadius: Design.radius.sheet,
    borderTopRightRadius: Design.radius.sheet,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: Design.spacing.screen,
    position: 'relative',
    zIndex: 2,
    backgroundColor: Colors.background,
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 12,
  },
  dragArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: -6,
    marginBottom: -4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  closeBtn: {
    position: 'absolute',
    right: Design.spacing.screen,
    top: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  closeBtnPressed: {
    opacity: 0.75,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sections: {
    gap: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  proName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  proCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
    flexShrink: 0,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  packageTitle: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  packageMeta: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  infoName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  sheetPriceBlock: {
    minWidth: 72,
    gap: 1,
  },
  sheetPriceTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sheetPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  sheetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: Design.radius.button,
    paddingVertical: 13,
    minHeight: 46,
  },
  sheetButtonReady: {
    backgroundColor: Colors.accent,
  },
  sheetButtonDisabled: {
    opacity: 0.45,
  },
  sheetButtonPressed: {
    opacity: 0.92,
  },
  sheetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 12,
  },
  priceBlock: {
    justifyContent: 'center',
    gap: 1,
    minWidth: 88,
    flexShrink: 0,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  sublabel: {
    fontSize: Design.font.micro,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 14,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Design.radius.button,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
});
