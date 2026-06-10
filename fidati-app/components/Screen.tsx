import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function Screen({
  children,
  scrollable = true,
  padded = true,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = padded ? { paddingHorizontal: Spacing.lg } : undefined;

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.screen, Platform.OS === 'web' && styles.screenWeb, style]}
        contentContainerStyle={[
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.xl },
          paddingStyle,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.xl },
        paddingStyle,
        style,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenWeb: {
    overscrollBehavior: 'none',
  },
});
