import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Design } from '@/constants/design';

interface HomeCarouselProps {
  children: ReactNode;
  gap?: number;
}

export function HomeCarousel({ children, gap = 12 }: HomeCarouselProps) {
  return (
    <View style={styles.bleed}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={[styles.content, { gap }]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -Design.spacing.screen,
  },
  content: {
    paddingHorizontal: Design.spacing.screen,
    paddingRight: Design.spacing.screen + 8,
  },
});
