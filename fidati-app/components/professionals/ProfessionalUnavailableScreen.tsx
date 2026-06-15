import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Spacing } from '@/constants/theme';

export function ProfessionalUnavailableScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={Colors.text} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={36} color={Colors.primary} />
        </View>
        <AppText variant="title" style={styles.title}>
          Questo professionista al momento non è disponibile
        </AppText>
        <AppText style={styles.body}>
          Stiamo verificando alcuni dettagli del profilo. Torna più tardi o scegli un altro professionista.
        </AppText>
        <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
          <AppText style={styles.ctaText}>Trova altri professionisti</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    ...Design.shadow,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 14,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(7, 37, 74, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    color: Colors.text,
  },
  body: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
  cta: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: Design.radius.button,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
