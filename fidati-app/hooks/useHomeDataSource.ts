import { useEffect, useState } from 'react';

import {
  computeHomeDataSource,
  HomeDataSourceState,
  subscribeDataSource,
} from '@/lib/supabaseDebug';

const INITIAL_LOADING: HomeDataSourceState = {
  status: 'loading',
  pendingCount: 5,
  queries: [],
};

export function useHomeDataSource(): HomeDataSourceState {
  const [state, setState] = useState<HomeDataSourceState>(() =>
    __DEV__ ? INITIAL_LOADING : { status: 'mock', fallbackTables: [], queries: [] },
  );

  useEffect(() => {
    if (!__DEV__) return;

    const update = () => setState(computeHomeDataSource());
    update();

    const unsubscribe = subscribeDataSource(update);
    const tick = setInterval(update, 250);

    return () => {
      unsubscribe();
      clearInterval(tick);
    };
  }, []);

  return state;
}
