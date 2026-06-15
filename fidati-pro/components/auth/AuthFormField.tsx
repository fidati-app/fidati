import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import type { RefObject } from 'react';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';
import { PASSWORD_TEXT_INPUT_PROPS } from '@/constants/passwordInput';

type AuthFieldIcon = keyof typeof Ionicons.glyphMap;

interface AuthFormFieldProps extends Pick<TextInputProps, 'autoComplete' | 'multiline' | 'onBlur' | 'onFocus'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: TextInputProps['keyboardType'];
  editable?: boolean;
  icon?: AuthFieldIcon;
  error?: string | null;
  loading?: boolean;
  containerRef?: RefObject<View | null>;
}

export function AuthFormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoComplete = 'off',
  editable = true,
  icon = secureTextEntry ? 'lock-closed-outline' : 'person-outline',
  multiline = false,
  onBlur,
  onFocus,
  error,
  loading = false,
  containerRef,
}: AuthFormFieldProps) {
  const hasError = Boolean(error);

  return (
    <View ref={containerRef} collapsable={false} style={styles.wrap}>
      <AppText style={styles.label}>{label}</AppText>
      <View
        style={[
          styles.field,
          !editable && styles.fieldDisabled,
          multiline && styles.fieldMultiline,
          hasError && styles.fieldError,
        ]}
      >
        <Ionicons name={icon} size={18} color={Colors.textSecondary} style={multiline ? styles.iconTop : undefined} />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...(secureTextEntry
            ? PASSWORD_TEXT_INPUT_PROPS
            : { autoComplete, autoCorrect: false, autoCapitalize })}
        />
        {loading ? <ActivityIndicator size="small" color={Colors.textMuted} /> : null}
      </View>
      {hasError ? <AppText style={styles.errorText}>{error}</AppText> : null}
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
  fieldError: {
    borderColor: Colors.error,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  fieldDisabled: {
    opacity: 0.7,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.navy,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 2,
    lineHeight: 16,
  },
});
