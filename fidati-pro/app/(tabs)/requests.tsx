import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RequestCard } from '@/components/requests/RequestCard';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { ProHeroHeader } from '@/components/ui/ProHeroHeader';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_REQUESTS } from '@/services/mockData';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pending = MOCK_REQUESTS.filter((r) => r.status === 'pending');
  const others = MOCK_REQUESTS.filter((r) => r.status !== 'pending');

  return (
    <>
      <StatusBar style="light" />
      <Screen padded={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <ProHeroHeader
          title="Richieste"
          subtitle={`${pending.length} nuove · rispondi entro 60 min`}
          icon="briefcase"
        />

        <View style={styles.body}>
          {pending.length > 0 ? (
            <>
              <View style={styles.sectionLabel}>
                <View style={styles.orangeDot} />
                <AppText style={styles.sectionLabelText}>In attesa di risposta</AppText>
              </View>
              <View style={styles.stack}>
                {pending.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onPress={() => router.push(`/requests/${request.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}

          {others.length > 0 ? (
            <>
              <View style={[styles.sectionLabel, { marginTop: 8 }]}>
                <AppText style={styles.sectionLabelText}>Gestite di recente</AppText>
              </View>
              <View style={styles.stack}>
                {others.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    compact
                    onPress={() => router.push(`/requests/${request.id}`)}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
    gap: 12,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pending,
  },
  sectionLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stack: { gap: 12 },
});
