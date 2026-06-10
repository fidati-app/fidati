import { Colors } from './colors';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

export const Typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.8, lineHeight: 34 },
  display: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
  micro: { fontSize: 11, fontWeight: '500' as const },
} as const;

export const Shadow = {
  soft: {
    shadowColor: '#010D20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#010D20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#010D20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const IconSizes = {
  sm: 18,
  md: 22,
  lg: 28,
} as const;
