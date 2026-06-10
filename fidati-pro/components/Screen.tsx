import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function Screen({
  children,
  scrollable = true,
  padded = true,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingStyle = padded ? { paddingHorizontal: Spacing.lg } : undefined;

  if (scrollable) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          { paddingBottom: insets.bottom + Spacing.xl },
          paddingStyle,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, paddingStyle, contentContainerStyle]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
