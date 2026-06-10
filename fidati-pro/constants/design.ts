export const Design = {
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    full: 999,
  },
  shadow: {
    shadowColor: '#07254A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowSoft: {
    shadowColor: '#07254A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  spacing: {
    screen: 20,
    md: 16,
    sm: 12,
  },
  font: {
    display: 28,
    title: 18,
    body: 15,
    caption: 13,
    micro: 11,
  },
} as const;
