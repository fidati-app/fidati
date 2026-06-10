import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

interface BookingSectionProps {
  title: string;
  badge?: 'required' | 'optional';
  children: ReactNode;
}

export function BookingSection({ title, badge, children }: BookingSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        {badge === 'required' ? (
          <View style={[styles.badge, styles.badgeRequired]}>
            <AppText style={[styles.badgeText, styles.badgeTextRequired]}>Obbligatorio</AppText>
          </View>
        ) : null}
        {badge === 'optional' ? (
          <View style={[styles.badge, styles.badgeOptional]}>
            <AppText style={[styles.badgeText, styles.badgeTextOptional]}>Opzionale</AppText>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Design.radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeRequired: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeOptional: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextRequired: {
    color: Colors.accent,
  },
  badgeTextOptional: {
    color: Colors.textSecondary,
  },
});
