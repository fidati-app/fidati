import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppText } from '@/components/AppText';
import { ProfileImage } from '@/components/ProfileImage';
import { Screen } from '@/components/Screen';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { MOCK_USER } from '@/services/mockData';

const MENU_ITEMS = [
  { icon: 'person-outline' as const, label: 'Il mio profilo', href: '/profile/edit' },
  { icon: 'card-outline' as const, label: 'Metodi di pagamento', href: '/profile/payments' },
  { icon: 'notifications-outline' as const, label: 'Notifiche', href: '/profile/notifications' },
  { icon: 'shield-checkmark-outline' as const, label: 'Privacy e sicurezza', href: '/profile/privacy' },
  { icon: 'help-circle-outline' as const, label: 'Assistenza', href: '/profile/support' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  return (
    <>
      <StatusBar style="light" />
      <Screen
        scrollable
        padded={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: tabBarHeight + 28,
        }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <ProfileImage
          name={MOCK_USER.name}
          imageUrl={MOCK_USER.imageUrl}
          fallbackColor={MOCK_USER.avatarColor}
          size={84}
          style={styles.avatarBorder}
        />
        <AppText style={styles.name}>{MOCK_USER.name}</AppText>
        <AppText style={styles.email}>{MOCK_USER.email}</AppText>
        <AppText style={styles.member}>
          Membro da {MOCK_USER.memberSince}
        </AppText>
      </View>

      <View style={styles.statsCard}>
        <StatItem value={String(MOCK_USER.stats.bookings)} label="Prenotazioni" />
        <View style={styles.statDivider} />
        <StatItem value={String(MOCK_USER.stats.completed)} label="Completate" />
        <View style={styles.statDivider} />
        <StatItem value={MOCK_USER.stats.rating.toFixed(1)} label="Valutazione" />
      </View>

      <View style={styles.body}>
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={Colors.accent} />
              </View>
              <AppText style={styles.menuLabel}>{item.label}</AppText>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.proCard}>
          <View style={styles.proIcon}>
            <Ionicons name="person-add-outline" size={22} color={Colors.accent} />
          </View>
          <View style={styles.proContent}>
            <AppText style={styles.proTitle}>Diventa professionista</AppText>
            <AppText style={styles.proSubtitle}>
              Offri i tuoi servizi e trova nuovi clienti
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.accent} />
        </Pressable>
      </View>
      </Screen>
    </>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingBottom: 52,
    paddingHorizontal: Design.spacing.screen,
  },
  avatarBorder: {
    borderWidth: 3,
    borderColor: Colors.accent,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
    lineHeight: 28,
    includeFontPadding: false,
  },
  email: {
    fontSize: Design.font.caption,
    color: 'rgba(255,255,255,0.75)',
  },
  member: {
    fontSize: Design.font.micro,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Design.spacing.screen,
    marginTop: -28,
    borderRadius: Design.radius.card,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Design.shadow,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Design.font.micro,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  body: {
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 24,
    paddingBottom: 8,
  },
  menu: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...Design.shadow,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Design.font.body,
    fontWeight: '500',
    color: Colors.text,
  },
  pressed: {
    backgroundColor: Colors.background,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: Design.radius.card,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  proIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proContent: {
    flex: 1,
    gap: 2,
  },
  proTitle: {
    fontSize: Design.font.title,
    fontWeight: '700',
    color: Colors.primary,
  },
  proSubtitle: {
    fontSize: Design.font.caption,
    color: Colors.textSecondary,
  },
});
