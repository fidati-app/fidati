import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const LOGO = require('@/components/logo-fidatipro.png');

interface SupabaseConfigErrorScreenProps {
  message: string;
}

export function SupabaseConfigErrorScreen({ message }: SupabaseConfigErrorScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
      <AppText style={styles.title}>Configurazione mancante</AppText>
      <AppText style={styles.body}>{message}</AppText>
      <AppText style={styles.hint}>
        Crea il file `.env` in fidati-pro con EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY,
        poi riavvia Expo con `npx expo start -c`.
      </AppText>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
