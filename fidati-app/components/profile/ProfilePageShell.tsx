import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ProfilePageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ProfilePageShell({ title, subtitle, children }: ProfilePageShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/profile');
            }
          }}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText style={styles.headerTitle}>{title}</AppText>
          {subtitle ? <AppText style={styles.headerSubtitle}>{subtitle}</AppText> : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 8,
    ...Design.shadow,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: 14,
    gap: 12,
  },
});
