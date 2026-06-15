import { supabase } from '@/lib/supabase';

type Filter = { column: string; value: string | boolean | number };

export async function safeCount(
  table: string,
  filters?: Filter[],
  inFilter?: { column: string; values: string[] },
): Promise<number> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    for (const f of filters ?? []) query = query.eq(f.column, f.value);
    if (inFilter) query = query.in(inFilter.column, inFilter.values);
    const { count, error } = await query;
    if (error) {
      console.warn(`[safeCount] ${table}:`, error.message);
      return 0;
    }
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function safeSum(table: string, column: string): Promise<number> {
  try {
    const { data, error } = await supabase.from(table).select(column).limit(5000);
    if (error) {
      console.warn(`[safeSum] ${table}:`, error.message);
      return 0;
    }
    return (data ?? []).reduce((sum, row) => {
      const rec = row as unknown as Record<string, unknown>;
      return sum + Number(rec[column] ?? 0);
    }, 0);
  } catch {
    return 0;
  }
}

export async function safeSelect<T>(
  table: string,
  select: string,
  options?: {
    limit?: number;
    order?: { column: string; ascending?: boolean };
    filters?: Filter[];
    inFilter?: { column: string; values: string[] };
  },
): Promise<T[]> {
  try {
    let query = supabase.from(table).select(select);
    for (const f of options?.filters ?? []) query = query.eq(f.column, f.value);
    if (options?.inFilter) query = query.in(options.inFilter.column, options.inFilter.values);
    if (options?.order) query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    if (options?.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) {
      console.warn(`[safeSelect] ${table}:`, error.message);
      return [];
    }
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}
