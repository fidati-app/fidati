import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pagina non trovata' }} />
      <View style={styles.container}>
        <AppText style={styles.title}>Pagina non trovata</AppText>
        <Link href="/" style={styles.link}>
          <AppText style={styles.linkText}>Torna alla panoramica</AppText>
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
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  link: {},
  linkText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '700',
  },
});
