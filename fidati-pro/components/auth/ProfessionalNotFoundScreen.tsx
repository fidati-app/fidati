import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const LOGO = require('@/components/logo-fidatipro.png');

interface ProfessionalNotFoundScreenProps {
  onRetry: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function ProfessionalNotFoundScreen({
  onRetry,
  onSignOut,
}: ProfessionalNotFoundScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    await onRetry();
    setIsRetrying(false);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await onSignOut();
    setIsSigningOut(false);
    router.replace('/login');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />

      <View style={styles.iconWrap}>
        <Ionicons name="person-circle-outline" size={34} color={Colors.navy} />
      </View>

      <AppText style={styles.title}>Profilo professionista non trovato</AppText>
      <AppText style={styles.body}>
        Il tuo account non è ancora collegato a un profilo Fidati Pro.
      </AppText>

      <View style={styles.actions}>
        <PrimaryButton
          title="Riprova"
          onPress={handleRetry}
          loading={isRetrying}
          disabled={isRetrying || isSigningOut}
        />
        <PrimaryButton
          title="Esci"
          variant="outline"
          onPress={handleSignOut}
          loading={isSigningOut}
          disabled={isRetrying || isSigningOut}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Design.spacing.screen,
  },
  logo: {
    width: 148,
    height: 44,
    marginBottom: 28,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...Design.shadowSoft,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 28,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
});
