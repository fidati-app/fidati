export const LOG_PREFIX = '[Supabase]';

export const SLOW_QUERY_THRESHOLD_MS = 5000;

export interface QueryMeta {
  service: string;
  table: string;
  /** Operazione logica, es. list / listByCategory / packagesBatch */
  name?: string;
  /** Hook o funzione chiamante, es. useProfessionals() */
  source?: string;
  /** Contesto opzionale (città, slug, …) */
  context?: Record<string, string>;
}

export type QueryStatus = 'pending' | 'success' | 'error';

export interface TrackedQuery {
  id: string;
  label: string;
  meta: QueryMeta;
  status: QueryStatus;
  startedAt: number;
  endedAt?: number;
  recordCount?: number;
  errorMessage?: string;
}

export type HomeDataSourceState =
  | { status: 'loading'; pendingCount: number; queries: TrackedQuery[] }
  | { status: 'db'; queries: TrackedQuery[] }
  | { status: 'mock'; fallbackTables: string[]; queries: TrackedQuery[] };

const HOME_TABLES = [
  'service_categories',
  'home_popular_services',
  'home_offers',
  'reviews',
  'professionals',
] as const;

interface MockFallbackEntry {
  service: string;
  table: string;
  reason: string;
}

const homeFetchRegistry = new Map<string, 'db' | 'mock'>();
const mockFallbackRegistry = new Map<string, MockFallbackEntry>();
const trackedQueries = new Map<string, TrackedQuery>();
const listeners = new Set<() => void>();

let querySeq = 0;
let globalQueryContext: Record<string, string> = {};

const MAX_TRACKED = 40;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function mergeContext(meta: QueryMeta): Record<string, string> | undefined {
  const merged = { ...globalQueryContext, ...meta.context };
  const keys = Object.keys(merged).filter((key) => merged[key]?.trim());
  return keys.length > 0 ? Object.fromEntries(keys.map((key) => [key, merged[key]!])) : undefined;
}

export function setDebugQueryContext(context: Record<string, string>) {
  if (!__DEV__) return;
  globalQueryContext = context;
}

export function queryLabel(meta: QueryMeta): string {
  const shortService = meta.service.replace(/Service$/, '');
  const op = meta.name ?? meta.table;
  return `${shortService}:${op}`;
}

function trimTrackedQueries() {
  if (trackedQueries.size <= MAX_TRACKED) return;
  for (const [id, query] of trackedQueries) {
    if (trackedQueries.size <= MAX_TRACKED) break;
    if (query.status !== 'pending') trackedQueries.delete(id);
  }
}

function resolveTrackedQuery(queryId: string | undefined, meta: QueryMeta): TrackedQuery | undefined {
  if (queryId && trackedQueries.has(queryId)) {
    return trackedQueries.get(queryId);
  }

  const label = queryLabel(meta);
  const entries = [...trackedQueries.values()].reverse();

  for (const query of entries) {
    if (query.status === 'pending' && query.label === label) return query;
  }

  for (const query of entries) {
    if (query.status === 'pending' && query.meta.table === meta.table) return query;
  }

  return undefined;
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return String(error);
}

export function registerMockFallback(meta: QueryMeta, reason: string) {
  if (!__DEV__) return;
  mockFallbackRegistry.set(meta.table, {
    service: meta.service,
    table: meta.table,
    reason,
  });
  notifyListeners();
}

export function registerHomeFetch(table: string, source: 'db' | 'mock') {
  if (!__DEV__) return;
  if (!(HOME_TABLES as readonly string[]).includes(table)) return;
  homeFetchRegistry.set(table, source);
  notifyListeners();
}

export function getTrackedQueries(): TrackedQuery[] {
  return [...trackedQueries.values()];
}

export function getPendingQueries(): TrackedQuery[] {
  return getTrackedQueries().filter((query) => query.status === 'pending');
}

export function getQueryElapsedMs(query: TrackedQuery, now = Date.now()): number {
  return (query.endedAt ?? now) - query.startedAt;
}

export function isQuerySlow(query: TrackedQuery, now = Date.now()): boolean {
  return getQueryElapsedMs(query, now) >= SLOW_QUERY_THRESHOLD_MS;
}

export function formatQueryElapsed(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function getMockFallbackTables(): string[] {
  const tables = new Set<string>();

  for (const table of HOME_TABLES) {
    if (homeFetchRegistry.get(table) === 'mock') {
      tables.add(table);
    }
  }

  for (const table of mockFallbackRegistry.keys()) {
    tables.add(table);
  }

  return [...tables].sort();
}

export function getMockFallbackDetails(): MockFallbackEntry[] {
  return getMockFallbackTables().map((table) => {
    const entry = mockFallbackRegistry.get(table);
    if (entry) return entry;
    return {
      service: 'unknown',
      table,
      reason: 'fallback home',
    };
  });
}

export function getWaitingHomeTables(): string[] {
  return HOME_TABLES.filter((table) => {
    const value = homeFetchRegistry.get(table);
    return value !== 'db' && value !== 'mock';
  });
}

export function computeHomeDataSource(now = Date.now()): HomeDataSourceState {
  const queries = getTrackedQueries();
  const pendingQueries = queries.filter((query) => query.status === 'pending');
  const tablePendingCount = HOME_TABLES.filter((table) => {
    const value = homeFetchRegistry.get(table);
    return value !== 'db' && value !== 'mock';
  }).length;

  const pendingCount = Math.max(pendingQueries.length, tablePendingCount);
  let hasMock = false;

  for (const table of HOME_TABLES) {
    if (homeFetchRegistry.get(table) === 'mock') {
      hasMock = true;
    }
  }

  if (!hasMock && mockFallbackRegistry.size > 0) {
    hasMock = true;
  }

  if (hasMock) {
    return { status: 'mock', fallbackTables: getMockFallbackTables(), queries };
  }

  if (pendingCount > 0) {
    return { status: 'loading', pendingCount, queries };
  }

  return { status: 'db', queries };
}

export function getHomeFetchRegistry(): Record<string, 'db' | 'mock' | undefined> {
  return Object.fromEntries(HOME_TABLES.map((table) => [table, homeFetchRegistry.get(table)]));
}

export function formatHomeDataSourceTitle(state: HomeDataSourceState): string {
  switch (state.status) {
    case 'loading':
      return `DB ${state.pendingCount} query in attesa`;
    case 'db':
      return 'DB attivo';
    case 'mock':
      return 'Fallback mock:';
  }
}

export function formatQueryStatus(status: QueryStatus): string {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'success':
      return 'success';
    case 'error':
      return 'error';
  }
}

export function subscribeDataSource(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function logQueryStart(meta: QueryMeta): string {
  if (!__DEV__) return '';

  const id = `q${++querySeq}`;
  const context = mergeContext(meta);
  const entry: TrackedQuery = {
    id,
    label: queryLabel(meta),
    meta: { ...meta, context },
    status: 'pending',
    startedAt: Date.now(),
  };

  trackedQueries.set(id, entry);
  trimTrackedQueries();
  notifyListeners();

  console.log(
    `${LOG_PREFIX} QUERY → ${entry.label} table=${meta.table}${meta.source ? ` source=${meta.source}` : ''}`,
  );

  return id;
}

export function logQuerySuccess(meta: QueryMeta, count: number, queryId?: string) {
  if (!__DEV__) return;

  const entry = resolveTrackedQuery(queryId, meta);
  if (entry) {
    entry.status = 'success';
    entry.endedAt = Date.now();
    entry.recordCount = count;
    notifyListeners();
  }

  console.log(`${LOG_PREFIX} OK ✓ ${queryLabel(meta)} table=${meta.table} records=${count}`);
}

export function logQueryError(meta: QueryMeta, error: unknown, queryId?: string) {
  if (!__DEV__) return;

  const message = extractErrorMessage(error);
  const entry = resolveTrackedQuery(queryId, meta);

  if (entry) {
    entry.status = 'error';
    entry.endedAt = Date.now();
    entry.errorMessage = message;
    notifyListeners();
  }

  console.warn(`${LOG_PREFIX} ERROR ✗ ${queryLabel(meta)} table=${meta.table} → ${message}`);
}

export function logFallback(meta: QueryMeta, reason: string) {
  if (!__DEV__) return;
  registerMockFallback(meta, reason);
  console.warn(
    `${LOG_PREFIX} MOCK FALLBACK → ${queryLabel(meta)} table=${meta.table} reason=${reason}`,
  );
}
