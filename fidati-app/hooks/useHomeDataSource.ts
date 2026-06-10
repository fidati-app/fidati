import { useEffect, useState } from 'react';

import {
  computeHomeDataSource,
  HomeDataSourceState,
  subscribeDataSource,
} from '@/lib/supabaseDebug';

const INITIAL_LOADING: HomeDataSourceState = {
  status: 'loading',
  pendingCount: 5,
};

export function useHomeDataSource(): HomeDataSourceState {
  const [state, setState] = useState<HomeDataSourceState>(() =>
    __DEV__ ? INITIAL_LOADING : { status: 'mock' },
  );

  useEffect(() => {
    if (!__DEV__) return;

    const update = () => setState(computeHomeDataSource());
    update();
    return subscribeDataSource(update);
  }, []);

  return state;
}
