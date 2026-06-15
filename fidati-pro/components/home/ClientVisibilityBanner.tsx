import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { useMyProfessionalProfile } from '@/hooks/useMyProfessionalProfile';
import { Colors } from '@/constants/colors';
import type { ClientVisibilityStatus } from '@/types';

function bannerCopy(status: Exclude<ClientVisibilityStatus, 'visible'>): { title: string; message: string } {
  if (status === 'pending_review') {
    return {
      title: 'Profilo in revisione',
      message: 'Hai inviato le modifiche: le stiamo ricontrollando. Per ora non sei visibile ai clienti.',
    };
  }
  return {
    title: 'Profilo non visibile ai clienti',
    message: 'Sistema i dettagli richiesti per tornare a ricevere nuove richieste.',
  };
}

export function ClientVisibilityBanner() {
  const { profile } = useMyProfessionalProfile();
  const status = profile?.clientVisibilityStatus ?? 'visible';

  if (!profile || status === 'visible') {
    return null;
  }

  const copy = bannerCopy(status);
  const icon = status === 'pending_review' ? 'time-outline' : 'eye-off-outline';

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(200)}
      style={styles.banner}
    >
      <Ionicons name={icon} size={14} color={Colors.pending} />
      <View style={styles.copy}>
        <AppText style={styles.title}>{copy.title}</AppText>
        <AppText style={styles.message}>{copy.message}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.pending,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
});
