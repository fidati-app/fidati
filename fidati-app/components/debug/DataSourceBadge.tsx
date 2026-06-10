import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { formatHomeDataSourceTitle } from '@/lib/supabaseDebug';
import { useHomeDataSource } from '@/hooks/useHomeDataSource';

export function DataSourceBadge() {
  if (!__DEV__) return null;

  const state = useHomeDataSource();

  const badgeStyle =
    state.status === 'db'
      ? styles.badgeDb
      : state.status === 'loading'
        ? styles.badgeLoading
        : styles.badgeMock;

  return (
    <View style={[styles.badge, badgeStyle]} pointerEvents="none">
      <AppText style={styles.title}>{formatHomeDataSourceTitle(state)}</AppText>
      {state.status === 'mock'
        ? state.fallbackTables.map((table) => (
            <AppText key={table} style={styles.item}>
              - {table}
            </AppText>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    opacity: 0.94,
    maxWidth: 200,
    gap: 1,
  },
  badgeDb: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  badgeLoading: {
    backgroundColor: 'rgba(234, 179, 8, 0.95)',
  },
  badgeMock: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  item: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.1,
    paddingLeft: 2,
  },
});
