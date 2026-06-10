import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { useProfileProgress } from '@/contexts/ProfileProgressContext';
import { MOCK_PRO_PROFILE } from '@/services/mockData';

export default function ProfilePortfolioScreen() {
  const router = useRouter();
  const { completeStep } = useProfileProgress();

  return (
    <ProfilePageShell title="Portfolio" subtitle="Mostra i tuoi migliori lavori">
      <View style={styles.grid}>
        {MOCK_PRO_PROFILE.portfolio.map((item) => (
          <View key={item.id} style={styles.tile}>
            <Image source={{ uri: item.coverImage }} style={styles.image} contentFit="cover" />
            <View style={styles.tileCopy}>
              <AppText style={styles.tileTitle} numberOfLines={1}>
                {item.title}
              </AppText>
              <AppText style={styles.tileSub} numberOfLines={1}>
                {item.subtitle}
              </AppText>
            </View>
          </View>
        ))}
      </View>
      <PrimaryButton
        title="Salva e segna come completato"
        onPress={() => {
          completeStep('portfolio');
          router.back();
        }}
      />
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  tile: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Design.shadowSoft,
  },
  image: { width: '100%', height: 140 },
  tileCopy: { padding: 12, gap: 2 },
  tileTitle: { fontSize: 14, fontWeight: '700', color: Colors.navy },
  tileSub: { fontSize: 11, color: Colors.textSecondary },
});
