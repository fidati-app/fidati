import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, color, size = 48 }: AvatarProps) {
  const fontSize = size * 0.36;

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <AppText variant="label" style={{ color: '#FFFFFF', fontSize, fontWeight: '700' }}>
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
