import { Image } from 'expo-image';
import { useState } from 'react';
import { ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Design } from '@/constants/design';

type ImageShape = 'circle' | 'rounded';

interface ProfileImageProps {
  name: string;
  imageUrl?: string;
  fallbackColor?: string;
  size?: number;
  shape?: ImageShape;
  style?: ViewStyle | ImageStyle;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileImage({
  name,
  imageUrl,
  fallbackColor = '#94A3B8',
  size = 48,
  shape = 'circle',
  style,
}: ProfileImageProps) {
  const [failed, setFailed] = useState(false);
  const radius = shape === 'rounded' ? Design.radius.md : size / 2;
  const showFallback = !imageUrl || failed;

  if (showFallback) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: radius, backgroundColor: fallbackColor },
          style,
        ]}
      >
        <AppText style={{ color: '#FFFFFF', fontSize: size * 0.34, fontWeight: '700' }}>
          {getInitials(name)}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[{ width: size, height: size, borderRadius: radius }, style as ImageStyle]}
      contentFit="cover"
      transition={200}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
