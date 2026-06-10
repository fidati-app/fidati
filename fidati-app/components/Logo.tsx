import { Image } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface LogoProps {
  light?: boolean;
  /** Logo scuro per sfondi chiari */
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Occupa tutta la larghezza del contenitore (ideale in hero) */
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  sm: { width: 130, height: 44 },
  md: { width: 165, height: 54 },
  lg: { width: 210, height: 72 },
  xl: { width: 280, height: 96 },
  '2xl': { width: 420, height: 144 },
} as const;

export function Logo({ size = 'md', fullWidth = false, inverted = false, style }: LogoProps) {
  const { width, height } = SIZES[size];

  const dimensions = fullWidth
    ? { width: '100%' as const, height: SIZES.lg.height }
    : { width, height };

  const source = inverted ? require('./logo_inverso.png') : require('./logo_fidati.png');

  return (
    <View style={[styles.container, dimensions, style]}>
      <Image
        source={source}
        style={styles.image}
        contentFit="contain"
        contentPosition="left center"
        transition={150}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
