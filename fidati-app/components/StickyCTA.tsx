import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { AppText } from './AppText';

interface StickyCTAProps {
  pricePerHour: number;
  priceLabel?: string;
  buttonTitle: string;
  onPress: () => void;
}

export function StickyCTA({
  pricePerHour,
  priceLabel,
  buttonTitle,
  onPress,
}: StickyCTAProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.inner}>
        <View style={styles.priceBlock}>
          <AppText style={styles.price}>
            {priceLabel ?? `da ${pricePerHour}€/h`}
          </AppText>
          <AppText style={styles.sublabel}>
            {priceLabel ? 'Pacchetto selezionato' : 'Prezzo indicativo'}
          </AppText>
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onPress}
        >
          <AppText style={styles.buttonText}>{buttonTitle}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: Design.spacing.screen,
    paddingTop: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceBlock: {
    justifyContent: 'center',
    gap: 1,
    minWidth: 88,
    flexShrink: 0,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  sublabel: {
    fontSize: Design.font.micro,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 14,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Design.radius.button,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
});
