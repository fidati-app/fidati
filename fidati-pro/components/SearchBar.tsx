import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';

import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  size?: 'default' | 'slim';
  showChevron?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = 'Cerca...',
  value,
  onChangeText,
  size = 'default',
  showChevron = false,
  style,
}: SearchBarProps) {
  const isSlim = size === 'slim';

  return (
    <View style={[styles.container, isSlim && styles.slim, style]}>
      <Ionicons name="search" size={isSlim ? 16 : 18} color={Colors.textSecondary} />
      <TextInput
        style={[styles.input, isSlim && styles.slimInput]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
      />
      {showChevron ? (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Design.spacing.md,
    paddingVertical: 12,
    gap: Design.spacing.sm,
    ...Design.shadow,
  },
  slim: {
    paddingVertical: 10,
    borderRadius: Design.radius.md,
  },
  input: {
    flex: 1,
    fontSize: Design.font.body,
    color: Colors.chatText,
    padding: 0,
  },
  slimInput: {
    fontSize: Design.font.caption,
  },
});
