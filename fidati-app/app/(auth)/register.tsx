import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Logo } from '@/components/Logo';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[Colors.primary, '#021A38']}
        style={[styles.hero, { paddingTop: insets.top + Spacing.xxl }]}
      >
        <Logo size="lg" />
        <AppText variant="hero" color={Colors.white} style={styles.heroTitle}>
          Unisciti a Fidati
        </AppText>
        <AppText variant="caption" color="rgba(255,255,255,0.7)">
          Crea il tuo account gratuito
        </AppText>
      </LinearGradient>

      <View style={styles.form}>
        <AppText variant="label" style={styles.label}>Nome completo</AppText>
        <SearchBar placeholder="Mario Rossi" />
        <AppText variant="label" style={[styles.label, styles.labelSpacing]}>Email</AppText>
        <SearchBar placeholder="nome@email.com" />
        <AppText variant="label" style={[styles.label, styles.labelSpacing]}>Password</AppText>
        <SearchBar placeholder="Minimo 8 caratteri" />
        <PrimaryButton title="Registrati" onPress={() => router.replace('/(tabs)')} style={styles.cta} />
        <PrimaryButton
          title="Hai già un account? Accedi"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    gap: 6,
  },
  heroTitle: {
    fontSize: 28,
    marginTop: 10,
  },
  form: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    marginLeft: Spacing.xs,
  },
  labelSpacing: {
    marginTop: Spacing.md,
  },
  cta: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
});
