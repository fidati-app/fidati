import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/auth/AuthTextField';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const LOGO = require('@/components/logo-fidatipro.png');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);
    setIsResetting(true);

    const result = await resetPassword(email);
    setIsResetting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setInfo('Ti abbiamo inviato un link per reimpostare la password.');
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[...Colors.heroGradient]}
        style={[styles.hero, { paddingTop: insets.top + 28 }]}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
        <AppText style={styles.heroTitle}>Area professionisti</AppText>
        <AppText style={styles.heroSubtitle}>Accedi per gestire richieste, agenda e profilo</AppText>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="nome@email.com"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isSubmitting}
          />

          <AuthTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            editable={!isSubmitting}
          />

          {error ? (
            <View style={styles.feedbackError}>
              <AppText style={styles.feedbackErrorText}>{error}</AppText>
            </View>
          ) : null}

          {info ? (
            <View style={styles.feedbackInfo}>
              <AppText style={styles.feedbackInfoText}>{info}</AppText>
            </View>
          ) : null}

          <PrimaryButton
            title="Accedi"
            onPress={handleSignIn}
            loading={isSubmitting}
            disabled={isSubmitting || isResetting}
            style={styles.cta}
          />

          <Pressable
            onPress={handleResetPassword}
            disabled={isSubmitting || isResetting}
            hitSlop={8}
            style={({ pressed }) => [styles.resetLink, pressed && styles.pressed]}
          >
            <AppText style={styles.resetText}>
              {isResetting ? 'Invio in corso…' : 'Password dimenticata?'}
            </AppText>
          </Pressable>

          <PrimaryButton
            title="Registrati come professionista"
            variant="outline"
            onPress={() => router.push('/register')}
            disabled={isSubmitting || isResetting}
            style={styles.registerCta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 6,
  },
  logo: {
    width: 148,
    height: 44,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 320,
  },
  form: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 24,
    gap: 14,
  },
  feedbackError: {
    backgroundColor: Colors.errorSoft,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackErrorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    lineHeight: 18,
  },
  feedbackInfo: {
    backgroundColor: Colors.successSoft,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedbackInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.success,
    lineHeight: 18,
  },
  cta: {
    marginTop: 4,
  },
  resetLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  registerCta: {
    marginTop: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
  },
});
