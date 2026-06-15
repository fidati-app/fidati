import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAdminChangeRequests } from '@/contexts/AdminChangeRequestsContext';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: IoniconName; iconOutline: IoniconName }> = {
  index: { label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  requests: { label: 'Richieste', icon: 'briefcase', iconOutline: 'briefcase-outline' },
  agenda: { label: 'Agenda', icon: 'calendar', iconOutline: 'calendar-outline' },
  messages: { label: 'Messaggi', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline' },
  profile: { label: 'Profilo', icon: 'person', iconOutline: 'person-outline' },
};

type TabRoute = { key: string; name: string; params?: object };

interface ProTabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: { navigate: (route: string, params?: object) => void };
  descriptors?: Record<string, unknown>;
}

export function ProTabBar({ state, navigation }: ProTabBarProps) {
  const insets = useSafeAreaInsets();
  const barHeight = 56 + insets.bottom;
  const { requests } = useAdminChangeRequests();
  const pendingAdminCount = requests.filter((r) => !r.isInReview).length;

  return (
    <View style={[styles.wrap, { height: barHeight }]}>
      <LinearGradient
        colors={[...Colors.heroGradient]}
        locations={[0, 0.55, 1]}
        style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}
      >
        <View style={styles.topAccent} />
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) return null;
          const focused = state.index === index;
          const tint = focused ? Colors.accent : 'rgba(255, 255, 255, 0.48)';
          const showAdminBadge =
            pendingAdminCount > 0 && (route.name === 'index' || route.name === 'profile');
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                if (!focused) navigation.navigate(route.name);
              }}
              style={styles.item}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={focused ? config.icon : config.iconOutline} size={21} color={tint} />
                {showAdminBadge ? (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {pendingAdminCount > 9 ? '9+' : pendingAdminCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, { color: tint }, focused && styles.labelActive]} numberOfLines={1}>
                {config.label}
              </Text>
              {focused ? <View style={styles.indicator} /> : null}
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accent,
    opacity: 0.85,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  iconWrap: {
    position: 'relative',
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.navy,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
