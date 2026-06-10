import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import MaskedView from '@react-native-masked-view/masked-view';
import { useContext, useEffect, useState, type ReactNode } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/constants/colors';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<
  string,
  { label: string; icon: IoniconName; iconOutline: IoniconName }
> = {
  index: { label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  categories: { label: 'Categorie', icon: 'grid', iconOutline: 'grid-outline' },
  bookings: { label: 'Prenotazioni', icon: 'calendar', iconOutline: 'calendar-outline' },
  messages: { label: 'Messaggi', icon: 'chatbubble', iconOutline: 'chatbubble-outline' },
  profile: { label: 'Profilo', icon: 'person', iconOutline: 'person-outline' },
};

const VERTICAL_PAD = 10;
const ACTIVE_SCALE = 1.12;
const BAR_TOP_RADIUS = 20;
const BAR_BORDER_HEIGHT = 2;

function buildGreenTopStrokePath(width: number): string {
  const r = BAR_TOP_RADIUS;

  return [
    `M 0 ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `L ${width - r} 0`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
  ].join(' ');
}

interface CustomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (route: string) => void;
  };
}

interface TabBarItemProps {
  focused: boolean;
  label: string;
  icon: IoniconName;
  iconOutline: IoniconName;
  onPress: () => void;
}

function GreenTopBorder({ width }: { width: number }) {
  if (width <= 0) {
    return null;
  }

  const pad = BAR_BORDER_HEIGHT;

  return (
    <View style={styles.greenTopBorder} pointerEvents="none">
      <Svg
        width={width}
        height={BAR_TOP_RADIUS + pad}
        viewBox={`${-pad / 2} ${-pad / 2} ${width + pad} ${BAR_TOP_RADIUS + pad}`}
      >
        <Path
          d={buildGreenTopStrokePath(width)}
          fill="none"
          stroke={Colors.accent}
          strokeWidth={BAR_BORDER_HEIGHT}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function RoundedTopClip({
  height,
  radius,
  children,
}: {
  height: number;
  radius: number;
  children: ReactNode;
}) {
  const clipStyle = {
    width: '100%' as const,
    height,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    overflow: 'hidden' as const,
  };

  if (Platform.OS === 'web') {
    return <View style={clipStyle}>{children}</View>;
  }

  return (
    <MaskedView
      style={[styles.masked, { height }]}
      maskElement={
        <View
          style={[
            styles.mask,
            {
              height,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            },
          ]}
        />
      }
    >
      {children}
    </MaskedView>
  );
}

function TabBarItem({ focused, label, icon, iconOutline, onPress }: TabBarItemProps) {
  const scale = useSharedValue(focused ? ACTIVE_SCALE : 1);
  const tint = focused ? Colors.accent : Colors.textSecondary;

  useEffect(() => {
    scale.value = withTiming(focused ? ACTIVE_SCALE : 1, { duration: 200 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && !focused && styles.itemPressed]}
    >
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        <Ionicons name={focused ? icon : iconOutline} size={22} color={tint} />
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={[styles.label, { color: tint }, focused && styles.labelActive]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const bottomInset = insets.bottom;
  const barHeight = VERTICAL_PAD * 2 + 22 + 4 + 14 + BAR_BORDER_HEIGHT + bottomInset;
  const [barWidth, setBarWidth] = useState(() => Dimensions.get('window').width);

  return (
    <View
      style={[styles.barWrap, { height: barHeight }]}
      pointerEvents="box-none"
      onLayout={(event) => {
        onHeightChange?.(event.nativeEvent.layout.height);
      }}
    >
      <RoundedTopClip height={barHeight} radius={BAR_TOP_RADIUS}>
        <View
          style={[styles.bar, { height: barHeight }]}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (width > 0 && width !== barWidth) {
              setBarWidth(width);
            }
          }}
        >
          <GreenTopBorder width={barWidth} />
          <View
            style={[
              styles.barContent,
              {
                paddingTop: BAR_BORDER_HEIGHT + VERTICAL_PAD,
                paddingBottom: VERTICAL_PAD + bottomInset,
              },
            ]}
          >
            {state.routes.map((route, index) => {
              const config = TAB_CONFIG[route.name];
              if (!config) return null;

              const focused = state.index === index;

              return (
                <TabBarItem
                  key={route.key}
                  focused={focused}
                  label={config.label}
                  icon={config.icon}
                  iconOutline={config.iconOutline}
                  onPress={() => {
                    if (!focused) {
                      navigation.navigate(route.name);
                    }
                  }}
                />
              );
            })}
          </View>
        </View>
      </RoundedTopClip>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    zIndex: 10,
  },
  masked: {
    width: '100%',
  },
  mask: {
    width: '100%',
    backgroundColor: '#000000',
  },
  bar: {
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.card,
    borderTopLeftRadius: BAR_TOP_RADIUS,
    borderTopRightRadius: BAR_TOP_RADIUS,
  },
  greenTopBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_TOP_RADIUS + BAR_BORDER_HEIGHT,
    zIndex: 1,
  },
  barContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  itemPressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  labelActive: {
    fontWeight: '600',
  },
});
