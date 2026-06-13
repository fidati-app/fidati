import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';

const LOGO = require('@/components/logo-fidatipro.png');

interface AuthLoadingScreenProps {
  caption?: string;
}

export function AuthLoadingScreen({
  caption = 'Verifica accesso in corso…',
}: AuthLoadingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Fidati Pro" />
      <ActivityIndicator size="small" color={Colors.success} style={styles.spinner} />
      <AppText style={styles.caption}>{caption}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 160,
    height: 48,
    marginBottom: 28,
  },
  spinner: {
    marginBottom: 12,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: -0.1,
  },
});
