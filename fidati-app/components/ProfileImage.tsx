import { Image, ImageContentPosition } from 'expo-image';
import { useMemo, useState } from 'react';
import { ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

import { Design } from '@/constants/design';
import { withFaceCrop } from '@/utils/imageUrl';
import { AppText } from './AppText';
import { getInitials } from './Avatar';

type ImageShape = 'circle' | 'rounded';

interface ProfileImageProps {
  name: string;
  imageUrl?: string;
  fallbackColor?: string;
  size?: number;
  shape?: ImageShape;
  /** Riempie il contenitore padre (altezza/larghezza 100%, cover) */
  fill?: boolean;
  /** Ritaglio Unsplash centrato sui volti per le dimensioni del contenitore */
  faceCrop?: { width: number; height: number };
  contentPosition?: ImageContentPosition;
  style?: ViewStyle | ImageStyle;
  borderRadius?: number;
}

export function ProfileImage({
  name,
  imageUrl,
  fallbackColor = '#94A3B8',
  size = 48,
  shape = 'circle',
  fill = false,
  faceCrop,
  contentPosition = 'center',
  style,
  borderRadius,
}: ProfileImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = useMemo(() => {
    if (!imageUrl || !faceCrop) return imageUrl;
    return withFaceCrop(imageUrl, faceCrop.width, faceCrop.height);
  }, [faceCrop, imageUrl]);
  const radius =
    borderRadius ?? (shape === 'rounded' && !fill ? Design.radius.button : size / 2);
  const showFallback = !resolvedUrl || failed;

  if (showFallback) {
    const fallbackSize = fill
      ? styles.fillWrap
      : { width: size, height: size, borderRadius: radius };

    return (
      <View
        style={[
          styles.fallback,
          fallbackSize,
          { backgroundColor: fallbackColor },
          !fill && { borderRadius: radius },
          style,
        ]}
      >
        <AppText
          style={{
            color: '#FFFFFF',
            fontSize: (fill ? 48 : size) * 0.34,
            fontWeight: '700',
          }}
        >
          {getInitials(name)}
        </AppText>
      </View>
    );
  }

  const imageStyle = fill
    ? [StyleSheet.absoluteFillObject, style as ImageStyle]
    : [{ width: size, height: size, borderRadius: radius }, style as ImageStyle];

  if (fill) {
    return (
      <View style={[styles.fillWrap, style as ViewStyle]}>
        <Image
          source={{ uri: resolvedUrl }}
          style={styles.fillImage}
          contentFit="cover"
          contentPosition={contentPosition}
          transition={200}
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolvedUrl }}
      style={imageStyle}
      contentFit="cover"
      contentPosition={contentPosition}
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
  fillWrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
});
