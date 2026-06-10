import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pagina non trovata' }} />
      <View style={styles.container}>
        <AppText variant="title">Pagina non trovata</AppText>
        <Link href="/" style={styles.link}>
          <AppText variant="body" color={Colors.accent}>
            Torna alla home
          </AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    gap: 16,
  },
  link: {
    paddingVertical: 12,
  },
});
