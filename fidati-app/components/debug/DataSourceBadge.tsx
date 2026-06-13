import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useServiceZone } from '@/context/ServiceZoneContext';
import { useHomeDataSource } from '@/hooks/useHomeDataSource';
import {
  formatHomeDataSourceTitle,
  formatQueryElapsed,
  formatQueryStatus,
  getQueryElapsedMs,
  getWaitingHomeTables,
  isQuerySlow,
  setDebugQueryContext,
  TrackedQuery,
} from '@/lib/supabaseDebug';

function queriesToShow(state: ReturnType<typeof useHomeDataSource>): TrackedQuery[] {
  if (state.status === 'loading') {
    const pending = state.queries.filter((query) => query.status === 'pending');
    const errors = state.queries.filter((query) => query.status === 'error');

    if (pending.length > 0 || errors.length > 0) {
      return [...pending, ...errors];
    }

    const startedAt = Date.now();
    return getWaitingHomeTables().map((table) => ({
      id: `waiting-${table}`,
      label: `home:${table}`,
      meta: {
        service: 'home',
        table,
        name: 'init',
        source: 'HomeMarketplaceProvider',
      },
      status: 'pending' as const,
      startedAt,
    }));
  }

  return state.queries.filter(
    (query) => query.status === 'error' || (query.status === 'pending' && isQuerySlow(query)),
  );
}

function QueryDebugLine({ query }: { query: TrackedQuery }) {
  const elapsed = getQueryElapsedMs(query);
  const slow = query.status === 'pending' && isQuerySlow(query);
  const status = query.status === 'pending' && slow ? 'LENTA' : formatQueryStatus(query.status);

  return (
    <View style={styles.queryBlock}>
      <AppText style={[styles.queryName, slow && styles.querySlow]} numberOfLines={1}>
        - {query.label}
      </AppText>
      <AppText style={styles.queryDetail} numberOfLines={1}>
        tabella: {query.meta.table}
      </AppText>
      <AppText
        style={[styles.queryDetail, query.status === 'error' && styles.queryErrorText]}
        numberOfLines={1}
      >
        stato: {status}
      </AppText>
      {query.meta.context
        ? Object.entries(query.meta.context).map(([key, value]) =>
            value?.trim() ? (
              <AppText key={key} style={styles.queryDetail} numberOfLines={1}>
                {key}: {value}
              </AppText>
            ) : null,
          )
        : null}
      <AppText style={styles.queryDetail} numberOfLines={1}>
        tempo: {formatQueryElapsed(elapsed)}
        {query.recordCount != null && query.status === 'success' ? ` · ${query.recordCount} rec` : ''}
      </AppText>
      {query.meta.source ? (
        <AppText style={styles.queryDetail} numberOfLines={2}>
          source: {query.meta.source}
        </AppText>
      ) : null}
      {query.errorMessage ? (
        <AppText style={styles.queryErrorText} numberOfLines={3}>
          errore: {query.errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}

export function DataSourceBadge() {
  if (!__DEV__) return null;

  const state = useHomeDataSource();
  const { selectedCity } = useServiceZone();

  useEffect(() => {
    setDebugQueryContext({ citta: selectedCity ?? '' });
  }, [selectedCity]);

  const visibleQueries = queriesToShow(state);
  const showDetails = visibleQueries.length > 0 || state.status === 'mock';

  const badgeStyle =
    state.status === 'db'
      ? styles.badgeDb
      : state.status === 'loading'
        ? styles.badgeLoading
        : styles.badgeMock;

  const hasSlowPending = visibleQueries.some(
    (query) => query.status === 'pending' && isQuerySlow(query),
  );

  return (
    <View
      style={[
        styles.badge,
        badgeStyle,
        hasSlowPending && styles.badgeSlow,
        showDetails && styles.badgeExpanded,
      ]}
      pointerEvents="none"
    >
      <AppText style={styles.title}>{formatHomeDataSourceTitle(state)}</AppText>

      {state.status === 'mock'
        ? state.fallbackTables.map((table) => (
            <AppText key={table} style={styles.item}>
              - {table}
            </AppText>
          ))
        : null}

      {showDetails && visibleQueries.length > 0 ? (
        <ScrollView style={styles.queryList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {visibleQueries.map((query) => (
            <QueryDebugLine key={query.id} query={query} />
          ))}
        </ScrollView>
      ) : null}
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
    maxWidth: 240,
    gap: 1,
  },
  badgeExpanded: {
    maxWidth: 280,
    maxHeight: 220,
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
  badgeSlow: {
    backgroundColor: 'rgba(249, 115, 22, 0.95)',
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
  queryList: {
    marginTop: 2,
    maxHeight: 180,
  },
  queryBlock: {
    marginTop: 4,
    paddingTop: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.35)',
    gap: 1,
  },
  queryName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  querySlow: {
    color: '#FEF3C7',
  },
  queryDetail: {
    fontSize: 8,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    paddingLeft: 6,
    lineHeight: 11,
  },
  queryErrorText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FEE2E2',
    paddingLeft: 6,
    lineHeight: 11,
  },
});
