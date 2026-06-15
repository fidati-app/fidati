import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface ProfilePageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Se false, il contenuto gestisce scroll/tastiera internamente (es. fix flow zone). */
  scroll?: boolean;
}

export function ProfilePageShell({ title, subtitle, children, scroll = true }: ProfilePageShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText style={styles.title}>{title}</AppText>
          {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
        </View>
      </View>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.contentFlex, { paddingBottom: insets.bottom }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Design.spacing.screen,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 16,
    gap: 14,
  },
  contentFlex: {
    flex: 1,
    paddingTop: 0,
  },
});
