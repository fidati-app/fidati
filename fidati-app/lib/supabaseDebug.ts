export const LOG_PREFIX = '[Supabase]';

export interface QueryMeta {
  service: string;
  table: string;
}

export type HomeDataSourceState =
  | { status: 'loading'; pendingCount: number }
  | { status: 'db' }
  | { status: 'mock'; fallbackTables: string[] };

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
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
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

export function computeHomeDataSource(): HomeDataSourceState {
  let pendingCount = 0;
  let hasMock = false;

  for (const table of HOME_TABLES) {
    const value = homeFetchRegistry.get(table);
    if (value === 'mock') {
      hasMock = true;
    } else if (value !== 'db') {
      pendingCount += 1;
    }
  }

  if (!hasMock && mockFallbackRegistry.size > 0) {
    hasMock = true;
  }

  if (hasMock) {
    return { status: 'mock', fallbackTables: getMockFallbackTables() };
  }

  if (pendingCount > 0) {
    return { status: 'loading', pendingCount };
  }

  return { status: 'db' };
}

export function getHomeFetchRegistry(): Record<string, 'db' | 'mock' | undefined> {
  return Object.fromEntries(HOME_TABLES.map((table) => [table, homeFetchRegistry.get(table)]));
}

export function formatHomeDataSourceTitle(state: HomeDataSourceState): string {
  switch (state.status) {
    case 'loading':
      return `DB: ${state.pendingCount} query in attesa`;
    case 'db':
      return 'DB attivo';
    case 'mock':
      return 'Fallback mock:';
  }
}

export function subscribeDataSource(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function logQueryStart(meta: QueryMeta) {
  if (!__DEV__) return;
  console.log(`${LOG_PREFIX} QUERY → service=${meta.service} table=${meta.table}`);
}

export function logQuerySuccess(meta: QueryMeta, count: number) {
  if (!__DEV__) return;
  console.log(`${LOG_PREFIX} OK ✓ service=${meta.service} table=${meta.table} records=${count}`);
}

export function logQueryError(meta: QueryMeta, error: unknown) {
  if (!__DEV__) return;
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : String(error);
  console.warn(`${LOG_PREFIX} ERROR ✗ service=${meta.service} table=${meta.table} → ${message}`);
}

export function logFallback(meta: QueryMeta, reason: string) {
  if (!__DEV__) return;
  registerMockFallback(meta, reason);
  console.warn(
    `${LOG_PREFIX} MOCK FALLBACK → service=${meta.service} table=${meta.table} reason=${reason}`,
  );
}
