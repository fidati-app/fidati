import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { Spacing } from '@/constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  size?: 'default' | 'large' | 'slim';
  iconPosition?: 'left' | 'right';
  showChevron?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = 'Cerca un servizio o professionista...',
  value,
  onChangeText,
  size = 'default',
  iconPosition = 'left',
  showChevron = false,
  style,
}: SearchBarProps) {
  const isLarge = size === 'large';
  const isSlim = size === 'slim';

  const icon = (
    <View style={isLarge ? styles.iconCircle : undefined}>
      <Ionicons
        name="search"
        size={isLarge ? 17 : isSlim ? 16 : 18}
        color={isLarge ? Colors.white : Colors.textSecondary}
      />
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isLarge && styles.large,
        isSlim && styles.slim,
        style,
      ]}
    >
      {iconPosition === 'left' && icon}
      <TextInput
        style={[styles.input, isLarge && styles.largeInput, isSlim && styles.slimInput]}
        placeholder={placeholder}
        placeholderTextColor={isLarge ? '#94A3B8' : Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      {iconPosition === 'right' && icon}
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    ...Design.shadow,
  },
  large: {
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 0,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slim: {
    paddingVertical: 10,
    borderRadius: Design.radius.button,
  },
  input: {
    flex: 1,
    fontSize: Design.font.body,
    color: Colors.text,
    padding: 0,
  },
  largeInput: {
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 10,
  },
  slimInput: {
    fontSize: Design.font.caption,
  },
});
