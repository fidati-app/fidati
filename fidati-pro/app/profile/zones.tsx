import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfileProgress } from '@/contexts/ProfileProgressContext';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';

export default function ProfileZonesScreen() {
  const router = useRouter();
  const { completeStep } = useProfileProgress();
  const { profile } = useMyProfessionalProfile();

  if (!profile) {
    return null;
  }

  return (
    <ProfilePageShell title="Zone servite" subtitle="Aree in cui sei disponibile a lavorare">
      <View style={styles.card}>
        {profile.baseCity ? (
          <AppText style={styles.baseCity}>Città base: {profile.baseCity}</AppText>
        ) : null}
        <View style={styles.zones}>
          {profile.serviceZones.length > 0 ? (
            profile.serviceZones.map((zone) => (
              <View key={zone} style={styles.zonePill}>
                <Ionicons name="location-outline" size={14} color={Colors.navy} />
                <AppText style={styles.zoneText}>{zone}</AppText>
              </View>
            ))
          ) : (
            <AppText style={styles.empty}>Nessuna zona configurata.</AppText>
          )}
        </View>
      </View>
      <PrimaryButton
        title="Salva e segna come completato"
        onPress={() => {
          completeStep('zones');
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
    padding: 14,
    ...Design.shadowSoft,
  },
  zones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  baseCity: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 10,
  },
  empty: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Design.radius.full,
  },
  zoneText: { fontSize: 13, fontWeight: '600', color: Colors.navy },
});
