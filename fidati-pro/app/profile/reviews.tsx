import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { ReviewCard } from '@/components/profile/ProfileSections';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { myProfessionalToProProfile } from '@/services/professionalsMeService';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

export default function ProfileReviewsScreen() {
  const { profile: myProfessional } = useMyProfessionalProfile();

  if (!myProfessional) {
    return null;
  }

  const profile = myProfessionalToProProfile(myProfessional);

  return (
    <ProfilePageShell
      title="Recensioni"
      subtitle={`${profile.reviewCount} recensioni · ${profile.rating.toFixed(2)} media`}
    >
      <View style={styles.list}>
        {profile.reviews.length > 0 ? (
          profile.reviews.map((review) => (
            <View key={review.id} style={styles.reviewWrap}>
              <ReviewCard {...review} />
            </View>
          ))
        ) : (
          <AppText style={styles.empty}>Nessuna recensione ancora disponibile.</AppText>
        )}
      </View>
    </ProfilePageShell>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  reviewWrap: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    ...Design.shadowSoft,
  },
  empty: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
