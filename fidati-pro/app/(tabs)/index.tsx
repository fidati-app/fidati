import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { AvailabilityBlockedModal } from '@/components/home/AvailabilityBlockedModal';
import { ClientVisibilityBanner } from '@/components/home/ClientVisibilityBanner';
import { ClientVisibilityCelebration } from '@/components/home/ClientVisibilityCelebration';
import { HomeDashboard } from '@/components/home/HomeDashboard';
import { ModificheAccettatePopup } from '@/components/home/ModificheAccettatePopup';
import { ProfileFixesPopup } from '@/components/home/ProfileFixesPopup';
import { VerificaOttenutaPopup } from '@/components/home/VerificaOttenutaPopup';
import { ProfileIncompleteBlockedModal } from '@/components/home/ProfileIncompleteBlockedModal';
import { VerificationReviewBlockedModal } from '@/components/home/VerificationReviewBlockedModal';
import { AvailabilityMenu, type AvailabilityToggleMode } from '@/components/ui/AvailabilityMenu';
import { TransientToast } from '@/components/ui/TransientToast';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useHomeVerificationUx } from '@/hooks/useHomeVerificationUx';
import { useHomeVisibilityUx } from '@/hooks/useHomeVisibilityUx';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { consumeVerificationSubmittedPopup } from '@/services/verificationSubmittedPopupStorage';
import { MOCK_REQUESTS } from '@/services/mockData';
import { ProfiloInviatoPopup } from '@/components/home/ProfiloInviatoPopup';

const LOGO = require('@/components/logo-fidatipro.png');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useMyProfessionalProfile();
  const availabilityInitializedRef = useRef(false);
  const [available, setAvailable] = useState(true);
  const [showAvailableToast, setShowAvailableToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<'available' | 'online' | 'verified'>('available');
  const [incompleteModalVisible, setIncompleteModalVisible] = useState(false);
  const [submittedPopupVisible, setSubmittedPopupVisible] = useState(false);

  useEffect(() => {
    if (!profile || availabilityInitializedRef.current) return;
    availabilityInitializedRef.current = true;
    setAvailable(profile.availableToday);
  }, [profile?.id]);

  const {
    isVerificationPending,
    approvedPopupVisible,
    verifiedCardVisible,
    isVerificationReviewModalVisible,
    handleApprovedPopupDismiss,
    dismissVerifiedCard,
    markVerifiedCardSeenForSession,
    showVerificationReviewModal,
    dismissVerificationReviewModal,
  } = useHomeVerificationUx();

  const {
    visibilityStatus,
    isClientVisible,
    acceptedPopupVisible,
    celebrating,
    blockedReason,
    handleAcceptedDismiss,
    handleCelebrationComplete,
    handleAvailabilityChange,
    handleBlockedFixNow,
    dismissBlockedModal,
    showVisibilityBlockedModal,
  } = useHomeVisibilityUx();

  useEffect(() => {
    if (!profile) return;
    if (profile.clientVisibilityStatus !== 'visible') {
      setAvailable(false);
    } else if (availabilityInitializedRef.current) {
      setAvailable(profile.availableToday);
    }
  }, [profile?.clientVisibilityStatus, profile?.availableToday, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      void consumeVerificationSubmittedPopup().then((show) => {
        if (show) setSubmittedPopupVisible(true);
      });
      return () => {
        markVerifiedCardSeenForSession();
      };
    }, [markVerifiedCardSeenForSession]),
  );

  const onAcceptedDismiss = useCallback(() => {
    handleAcceptedDismiss();
    setAvailable(true);
    setToastVariant('online');
    setShowAvailableToast(true);
  }, [handleAcceptedDismiss]);

  const onApprovedDismiss = useCallback(() => {
    handleApprovedPopupDismiss();
    setAvailable(true);
    setToastVariant('verified');
    setShowAvailableToast(true);
  }, [handleApprovedPopupDismiss]);

  const onAvailabilityChange = useCallback(
    (value: boolean) => {
      if (visibilityStatus !== 'visible') {
        showVisibilityBlockedModal(
          visibilityStatus === 'pending_review' ? 'pending_review' : 'hidden_changes',
        );
        return;
      }
      if (isVerificationPending) {
        showVerificationReviewModal();
        return;
      }
      if (profile?.verificationStatus === 'unverified') {
        setIncompleteModalVisible(true);
        return;
      }
      handleAvailabilityChange(value, setAvailable, setShowAvailableToast, available);
    },
    [
      available,
      handleAvailabilityChange,
      isVerificationPending,
      profile?.verificationStatus,
      showVerificationReviewModal,
      showVisibilityBlockedModal,
      visibilityStatus,
    ],
  );

  const pendingRequests = useMemo(
    () => MOCK_REQUESTS.filter((r) => r.status === 'pending').length,
    [],
  );

  if (!profile) {
    return null;
  }

  const isProfileIncomplete = profile.verificationStatus === 'unverified';

  const toggleMode: AvailabilityToggleMode =
    visibilityStatus === 'hidden_changes'
      ? 'hidden_changes'
      : visibilityStatus === 'pending_review'
        ? 'pending_review'
        : isVerificationPending
          ? 'verification_review'
          : isProfileIncomplete
            ? 'profile_incomplete'
            : available
              ? 'available'
              : 'unavailable';

  const showUnavailableBanner =
    isClientVisible && !available && !isVerificationPending && !isProfileIncomplete;

  return (
    <>
      <StatusBar style="light" />
      <ProfileFixesPopup />
      <ProfiloInviatoPopup
        visible={submittedPopupVisible}
        onDismiss={() => setSubmittedPopupVisible(false)}
      />
      <ModificheAccettatePopup visible={acceptedPopupVisible} onDismiss={onAcceptedDismiss} />
      <VerificaOttenutaPopup visible={approvedPopupVisible} onDismiss={onApprovedDismiss} />
      <VerificationReviewBlockedModal
        visible={isVerificationReviewModalVisible}
        onDismiss={dismissVerificationReviewModal}
      />
      <ProfileIncompleteBlockedModal
        visible={incompleteModalVisible}
        onDismiss={() => setIncompleteModalVisible(false)}
      />
      <AvailabilityBlockedModal
        visible={blockedReason !== null}
        reason={blockedReason}
        onDismiss={dismissBlockedModal}
        onFixNow={handleBlockedFixNow}
      />
      <View style={styles.screen}>
        <LinearGradient
          colors={[...Colors.heroGradient]}
          locations={[0, 0.55, 1]}
          style={[styles.hero, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.glow} />
          <View style={styles.headerTop}>
            <AvailabilityMenu
              available={available}
              mode={toggleMode}
              onChange={onAvailabilityChange}
              onReviewPress={showVerificationReviewModal}
              onIncompletePress={() => setIncompleteModalVisible(true)}
              onHiddenChangesPress={() => showVisibilityBlockedModal('hidden_changes')}
              onPendingReviewPress={() => showVisibilityBlockedModal('pending_review')}
            />
            <View style={styles.logoWrap}>
              <Image source={LOGO} style={styles.logo} contentFit="contain" />
            </View>
            <Pressable style={styles.notifBtn} hitSlop={8}>
              <Ionicons name="notifications-outline" size={21} color={Colors.white} />
              {pendingRequests > 0 ? (
                <View style={styles.notifDot}>
                  <AppText style={styles.notifDotText}>{pendingRequests}</AppText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 112 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {celebrating ? (
            <View style={styles.scrollBanner}>
              <ClientVisibilityCelebration active onComplete={handleCelebrationComplete} />
            </View>
          ) : null}

          {showUnavailableBanner ? (
            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(160)}
              style={styles.scrollBanner}
            >
              <View style={styles.unavailableBanner}>
                <Ionicons name="notifications-off-outline" size={14} color={Colors.error} />
                <AppText style={styles.unavailableText} numberOfLines={2}>
                  <AppText style={styles.unavailableTitle}>Non disponibile. </AppText>
                  Non riceverai nuove richieste finché non torni disponibile.
                </AppText>
              </View>
            </Animated.View>
          ) : null}

          <View style={styles.scrollBanner}>
            <ClientVisibilityBanner />
          </View>

          <HomeDashboard
            showVerificationReviewCard={isVerificationPending}
            showProfileIncompleteCard={isProfileIncomplete && !isVerificationPending}
            showVerifiedCelebrationCard={verifiedCardVisible && !isVerificationPending}
            onDismissVerifiedCard={dismissVerifiedCard}
          />
        </ScrollView>

        <TransientToast
          visible={showAvailableToast}
          title={
            toastVariant === 'online'
              ? 'Sei di nuovo online.'
              : toastVariant === 'verified'
                ? 'Verifica ottenuta.'
                : 'Ora sei disponibile.'
          }
          message={
            toastVariant === 'online'
              ? 'Il tuo profilo è visibile ai clienti.'
              : toastVariant === 'verified'
                ? 'I clienti della tua zona possono trovarti.'
                : 'Potrai ricevere nuove richieste.'
          }
          onHidden={() => {
            setShowAvailableToast(false);
            setToastVariant('available');
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollBanner: {
    paddingHorizontal: Design.spacing.screen,
    marginTop: 8,
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Design.radius.md,
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  unavailableTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.error,
  },
  unavailableText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 48,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pending,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#031f42',
  },
  notifDotText: { fontSize: 9, fontWeight: '800', color: Colors.white },
});
