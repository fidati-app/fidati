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

import { AuthFormField } from '@/components/auth/AuthFormField';
import { CategoryPicker } from '@/components/auth/CategoryPicker';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PRO_SERVICE_CITIES } from '@/constants/proCategories';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { createProfessionalProfile } from '@/services/proRegistrationService';
import {
  clearPendingRegistration,
  savePendingRegistration,
} from '@/services/pendingRegistrationStorage';
import {
  parsePriceFrom,
  validateRegistrationStep1,
  validateRegistrationStep2,
} from '@/utils/registrationValidation';

const LOGO = require('@/components/logo-fidatipro.png');

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [serviceAreasRaw, setServiceAreasRaw] = useState('');
  const [priceFromRaw, setPriceFromRaw] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    setError(null);
    const validationError = validateRegistrationStep1({
      name,
      email,
      password,
      confirmPassword,
      phone,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setError(null);
    setSuccessMessage(null);

    const step1Error = validateRegistrationStep1({
      name,
      email,
      password,
      confirmPassword,
      phone,
    });
    if (step1Error) {
      setError(step1Error);
      setStep(1);
      return;
    }

    const step2Error = validateRegistrationStep2({
      categorySlug,
      baseCity,
      serviceAreasRaw,
      priceFromRaw,
      description,
    });
    if (step2Error) {
      setError(step2Error);
      return;
    }

    setIsSubmitting(true);

    const profileInput = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      categorySlug,
      baseCity: baseCity.trim(),
      serviceAreasRaw,
      priceFrom: parsePriceFrom(priceFromRaw),
      description: description.trim(),
    };

    const signUpResult = await signUp(email, password);
    if (signUpResult.error) {
      setIsSubmitting(false);
      setError(signUpResult.error);
      return;
    }

    const authUserId = signUpResult.userId;
    if (!authUserId) {
      setIsSubmitting(false);
      setError('Registrazione non completata. Riprova.');
      return;
    }

    try {
      const pendingPayload = {
        ...profileInput,
        authUserId,
        savedAt: new Date().toISOString(),
      };

      if (signUpResult.needsEmailConfirmation) {
        await savePendingRegistration(pendingPayload);
        setIsSubmitting(false);
        setSuccessMessage(
          'Registrazione completata. Controlla la tua email per confermare l’account.',
        );
        return;
      }

      await savePendingRegistration(pendingPayload);
      await createProfessionalProfile(authUserId, profileInput);
      await clearPendingRegistration();
      setIsSubmitting(false);
      router.replace('/(tabs)');
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Impossibile creare il profilo professionista. Riprova.',
      );
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[...Colors.heroGradient]}
        style={[styles.hero, { paddingTop: insets.top + 20 }]}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
        <AppText style={styles.heroTitle}>Registrati come professionista</AppText>
        <AppText style={styles.heroSubtitle}>
          {step === 1 ? 'Step 1 di 2 · Account' : 'Step 2 di 2 · Dati professionali'}
        </AppText>
        <View style={styles.steps}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
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
          {successMessage ? (
            <View style={styles.successBlock}>
              <AppText style={styles.successTitle}>Quasi fatto!</AppText>
              <AppText style={styles.successBody}>{successMessage}</AppText>
              <PrimaryButton
                title="Vai al login"
                onPress={() => router.replace('/login')}
                style={styles.cta}
              />
            </View>
          ) : step === 1 ? (
            <>
              <AuthFormField
                label="Nome professionista / attività"
                value={name}
                onChangeText={setName}
                placeholder="Es. Mario Rossi · Elettricista"
                autoCapitalize="words"
                icon="briefcase-outline"
                editable={!isSubmitting}
              />
              <AuthFormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="nome@email.com"
                keyboardType="email-address"
                autoComplete="email"
                icon="mail-outline"
                editable={!isSubmitting}
              />
              <AuthFormField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimo 6 caratteri"
                secureTextEntry
                autoComplete="password"
                editable={!isSubmitting}
              />
              <AuthFormField
                label="Conferma password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ripeti la password"
                secureTextEntry
                autoComplete="password"
                editable={!isSubmitting}
              />
              <AuthFormField
                label="Telefono"
                value={phone}
                onChangeText={setPhone}
                placeholder="+39 333 123 4567"
                keyboardType="phone-pad"
                icon="call-outline"
                editable={!isSubmitting}
              />
              <PrimaryButton title="Continua" onPress={handleContinue} style={styles.cta} />
            </>
          ) : (
            <>
              <CategoryPicker
                value={categorySlug}
                onChange={setCategorySlug}
                disabled={isSubmitting}
              />

              <AuthFormField
                label="Città base"
                value={baseCity}
                onChangeText={setBaseCity}
                placeholder="Es. Barletta"
                autoCapitalize="words"
                icon="business-outline"
                editable={!isSubmitting}
              />

              <View style={styles.cityHints}>
                {PRO_SERVICE_CITIES.map((city) => (
                  <Pressable
                    key={city}
                    disabled={isSubmitting}
                    onPress={() => {
                      setBaseCity(city);
                      if (!serviceAreasRaw.trim()) {
                        setServiceAreasRaw(city);
                      }
                    }}
                    style={styles.cityHintChip}
                  >
                    <AppText style={styles.cityHintText}>{city}</AppText>
                  </Pressable>
                ))}
              </View>

              <AuthFormField
                label="Zone operative"
                value={serviceAreasRaw}
                onChangeText={setServiceAreasRaw}
                placeholder="Es. Barletta, Andria, Trani"
                autoCapitalize="words"
                icon="map-outline"
                editable={!isSubmitting}
              />
              <AppText style={styles.hint}>
                Inserisci almeno una città. Se includi Barletta, comparirai nell’app clienti quando
                viene selezionata Barletta (dopo verifica).
              </AppText>

              <AuthFormField
                label="Prezzo da (€/h)"
                value={priceFromRaw}
                onChangeText={setPriceFromRaw}
                placeholder="Es. 45"
                keyboardType="decimal-pad"
                icon="pricetag-outline"
                editable={!isSubmitting}
              />

              <AuthFormField
                label="Breve descrizione"
                value={description}
                onChangeText={setDescription}
                placeholder="Presentati in poche righe…"
                autoCapitalize="sentences"
                icon="document-text-outline"
                multiline
                editable={!isSubmitting}
              />

              <View style={styles.rowActions}>
                <PrimaryButton
                  title="Indietro"
                  variant="outline"
                  onPress={() => setStep(1)}
                  disabled={isSubmitting}
                  style={styles.halfButton}
                />
                <PrimaryButton
                  title="Registrati"
                  onPress={handleRegister}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.halfButton}
                />
              </View>
            </>
          )}

          {error ? (
            <View style={styles.feedbackError}>
              <AppText style={styles.feedbackErrorText}>{error}</AppText>
            </View>
          ) : null}

          {!successMessage ? (
            <Pressable
              onPress={() => router.replace('/login')}
              hitSlop={8}
              style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
            >
              <AppText style={styles.backLinkText}>Hai già un account? Accedi</AppText>
            </Pressable>
          ) : null}
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
  flex: { flex: 1 },
  hero: {
    paddingHorizontal: Design.spacing.screen,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 4,
  },
  logo: {
    width: 132,
    height: 40,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  stepDotActive: {
    backgroundColor: Colors.success,
  },
  stepLine: {
    width: 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepLineActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.75)',
  },
  form: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 22,
    gap: 14,
  },
  cityHints: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -6,
  },
  cityHintChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Design.radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.navy,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
    marginTop: -6,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  cta: {
    marginTop: 4,
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
  successBlock: {
    gap: 12,
    backgroundColor: Colors.successSoft,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    padding: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.navy,
  },
  successBody: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  backLink: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
  },
  pressed: {
    opacity: 0.7,
  },
});
