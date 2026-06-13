import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface HomeCategoriesExpandButtonProps {
  expanded: boolean;
  extraCount: number;
  onPress: () => void;
  /** true se il genitore ha già padding orizzontale (es. Home) */
  embedded?: boolean;
}

export function HomeCategoriesExpandButton({
  expanded,
  extraCount,
  onPress,
  embedded = false,
}: HomeCategoriesExpandButtonProps) {
  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Mostra meno categorie' : 'Vedi tutte le categorie'}
      >
        <View style={styles.textBlock}>
          <View style={styles.titleRow}>
            <AppText style={styles.label}>
              {expanded ? 'Mostra meno' : 'Vedi tutte le categorie'}
            </AppText>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.accent}
            />
          </View>
          {!expanded && extraCount > 0 ? (
            <AppText style={styles.hint}>Altri {extraCount} servizi disponibili</AppText>
          ) : expanded ? (
            <AppText style={styles.hint}>Riduci elenco categorie</AppText>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Design.spacing.screen,
    marginTop: 12,
    marginBottom: 22,
  },
  wrapEmbedded: {
    paddingHorizontal: 0,
  },
  button: {
    minHeight: 48,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.24)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 18,
    paddingVertical: 11,
    justifyContent: 'center',
    ...Design.shadow,
  },
  pressed: {
    opacity: 0.9,
  },
  textBlock: {
    alignItems: 'center',
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: -0.15,
    includeFontPadding: false,
  },
  hint: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
});
