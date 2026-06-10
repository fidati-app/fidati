import { StyleSheet, View } from 'react-native';

import { ProfilePageShell } from '@/components/profile/ProfilePageShell';
import { ReviewCard } from '@/components/profile/ProfileSections';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_PRO_PROFILE } from '@/services/mockData';

export default function ProfileReviewsScreen() {
  const profile = MOCK_PRO_PROFILE;

  return (
    <ProfilePageShell
      title="Recensioni"
      subtitle={`${profile.reviewCount} recensioni · ${profile.rating} media`}
    >
      <View style={styles.list}>
        {profile.reviews.map((review) => (
          <View key={review.id} style={styles.reviewWrap}>
            <ReviewCard {...review} />
          </View>
        ))}
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
});
