import { Platform, type TextInputProps } from 'react-native';

/** Disattiva Strong Password / autofill su iOS e Android. */
export const PASSWORD_TEXT_INPUT_PROPS: Pick<
  TextInputProps,
  | 'autoComplete'
  | 'textContentType'
  | 'importantForAutofill'
  | 'autoCorrect'
  | 'autoCapitalize'
  | 'spellCheck'
> = {
  autoComplete: 'off',
  // "none" non basta su iOS: oneTimeCode evita "Choose your password".
  textContentType: Platform.OS === 'ios' ? 'oneTimeCode' : 'none',
  importantForAutofill: 'no',
  autoCorrect: false,
  autoCapitalize: 'none',
  spellCheck: false,
};
