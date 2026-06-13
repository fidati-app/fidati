import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  autoComplete?: 'email' | 'password' | 'off';
  editable?: boolean;
}

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete = 'off',
  editable = true,
}: AuthTextFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.field, !editable && styles.fieldDisabled]}>
        <Ionicons
          name={secureTextEntry ? 'lock-closed-outline' : 'mail-outline'}
          size={18}
          color={Colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          autoCorrect={false}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.navy,
    marginLeft: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Design.shadowSoft,
  },
  fieldDisabled: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.navy,
    padding: 0,
  },
});
