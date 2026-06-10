import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfileProgress } from '@/contexts/ProfileProgressContext';
import { MOCK_PRO_PROFILE } from '@/services/mockData';

export default function ProfileServicesScreen() {
  const router = useRouter();
  const { completeStep } = useProfileProgress();

  return (
    <ProfilePageShell title="Servizi e prezzi" subtitle="Gestisci listino e durata dei servizi">
      <View style={styles.card}>
        {MOCK_PRO_PROFILE.services.map((service, index) => (
          <View key={service.id} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={styles.copy}>
              <AppText style={styles.title}>{service.title}</AppText>
              <AppText style={styles.meta}>{service.duration}</AppText>
            </View>
            <AppText style={styles.price}>da {service.priceFrom}€</AppText>
          </View>
        ))}
      </View>
      <PrimaryButton
        title="Salva e segna come completato"
        onPress={() => {
          completeStep('services');
          router.back();
        }}
      />
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    ...Design.shadowSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  meta: { fontSize: 11, color: Colors.textMuted },
  price: { fontSize: 14, fontWeight: '800', color: Colors.navy },
});
