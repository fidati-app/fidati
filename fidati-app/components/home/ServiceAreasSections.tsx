import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORY_COLORS, getCategoryTintColors } from '@/constants/categoryColors';
import {
  HOME_SERVICES_AZIENDA,
  HOME_SERVICES_CASA,
  HomeServiceTile,
} from '@/constants/homeMarketplace';
import { Colors } from '@/constants/colors';
import { CategorySlug } from '@/types';

type AreaTab = 'casa' | 'azienda';

const TAB_INDICATOR_WIDTH = 52;
const TAB_INDICATOR_HEIGHT = 4;

const TABS: { id: AreaTab; emoji: string; label: string }[] = [
  { id: 'casa', emoji: '🏠', label: 'Per la tua casa' },
  { id: 'azienda', emoji: '🏢', label: 'Per la tua azienda' },
];

const SERVICES_BY_TAB: Record<AreaTab, HomeServiceTile[]> = {
  casa: HOME_SERVICES_CASA,
  azienda: HOME_SERVICES_AZIENDA,
};

function ServiceRow({ service }: { service: HomeServiceTile }) {
  const router = useRouter();
  const slug = service.slug as CategorySlug;
  const accent = CATEGORY_COLORS[slug] ?? Colors.accent;
  const tint = getCategoryTintColors(slug);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/service/${service.slug}`)}
    >
      <View style={[styles.rowIcon, { backgroundColor: tint.backgroundColor }]}>
        <Ionicons name={service.icon} size={14} color={accent} />
      </View>
      <Text style={styles.rowLabel} numberOfLines={1} ellipsizeMode="tail">
        {service.title}
      </Text>
      <Ionicons name="chevron-forward" size={13} color="rgba(255, 255, 255, 0.38)" />
    </Pressable>
  );
}

function ServiceList({ tab }: { tab: AreaTab }) {
  const services = SERVICES_BY_TAB[tab];

  return (
    <Animated.View
      key={tab}
      entering={FadeInDown.duration(260).springify().damping(22)}
      exiting={FadeOutUp.duration(180)}
      style={styles.listWrap}
    >
      <View style={styles.list}>
        {services.map((service, index) => (
          <View key={service.id}>
            <ServiceRow service={service} />
            {index < services.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

interface AreaTabButtonProps {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
}

function AreaTabButton({ emoji, label, active, onPress }: AreaTabButtonProps) {
  const indicatorWidth = useSharedValue(active ? TAB_INDICATOR_WIDTH : 0);

  useEffect(() => {
    indicatorWidth.value = withTiming(active ? TAB_INDICATOR_WIDTH : 0, { duration: 280 });
  }, [active, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.value,
    opacity: indicatorWidth.value > 0 ? 1 : 0,
  }));

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabEmoji, !active && styles.tabInactive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, !active && styles.tabInactive]}>{label}</Text>
      <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
    </Pressable>
  );
}

export function ServiceAreasSections() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AreaTab>('casa');

  return (
    <View style={styles.wrap}>
      <View style={styles.shadowShell}>
        <View style={styles.container}>
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <AreaTabButton
                key={tab.id}
                emoji={tab.emoji}
                label={tab.label}
                active={activeTab === tab.id}
                onPress={() => setActiveTab(tab.id)}
              />
            ))}
          </View>

          <ServiceList tab={activeTab} />

          <Pressable
            style={({ pressed }) => [styles.footerLink, pressed && styles.rowPressed]}
            onPress={() => router.push('/(tabs)/categories')}
          >
            <Text style={styles.footerText}>Scopri tutti i servizi →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 36,
    marginBottom: 40,
  },
  shadowShell: {
    borderRadius: 30,
    shadowColor: '#010D20',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  container: {
    backgroundColor: Colors.sectionNavy,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 0,
  },
  tabEmoji: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 7,
    color: Colors.white,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 18,
    textAlign: 'center',
    color: Colors.white,
  },
  tabInactive: {
    opacity: 0.5,
  },
  tabIndicator: {
    marginTop: 8,
    height: TAB_INDICATOR_HEIGHT,
    borderRadius: 99,
    backgroundColor: Colors.accent,
  },
  listWrap: {
    width: '100%',
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    paddingHorizontal: 0,
    minHeight: 40,
    backgroundColor: 'transparent',
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    letterSpacing: -0.22,
    lineHeight: 18,
    includeFontPadding: false,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: -0.15,
    includeFontPadding: false,
  },
});
