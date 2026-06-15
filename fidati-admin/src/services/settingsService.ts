import { supabase } from '@/lib/supabase';
import type { ServiceCategoryRow, CityCatalogRow, DefaultServiceRow } from '@/types';

export type VerificationRules = {
  min_work_photos: number;
  max_work_photos: number;
  require_document: boolean;
  require_selfie: boolean;
};

export type CommissionDefault = {
  percent: number;
  min_eur: number;
  max_eur: number;
};

export type MessageTemplates = {
  verification_approved: string;
  verification_rejected: string;
  verification_changes_requested: string;
  account_banned: string;
};

export async function fetchPlatformSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from('platform_settings').select('value').eq('key', key).maybeSingle();
  if (error || !data) return fallback;
  return (data.value as T) ?? fallback;
}

export async function savePlatformSetting(key: string, value: unknown) {
  const { error } = await supabase.rpc('update_platform_setting', { p_key: key, p_value: value });
  if (error) throw error;
}

export async function fetchDefaultServices(categoryId?: string): Promise<DefaultServiceRow[]> {
  let query = supabase
    .from('services')
    .select('id, category_id, title, from_price, sort_order, is_active, service_categories(name, slug)')
    .order('sort_order');

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query.limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as DefaultServiceRow[];
}

export async function createDefaultService(input: {
  category_id: string;
  title: string;
  from_price: number;
  sort_order?: number;
}) {
  const { data, error } = await supabase
    .from('services')
    .insert({
      category_id: input.category_id,
      title: input.title.trim(),
      from_price: input.from_price,
      sort_order: input.sort_order ?? 0,
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'create_default_service',
    p_target_type: 'service',
    p_target_id: data.id,
    p_metadata: input,
  });
  return data.id as string;
}

export async function updateDefaultService(
  id: string,
  patch: { title?: string; from_price?: number; is_active?: boolean; sort_order?: number },
) {
  const { error } = await supabase.from('services').update(patch).eq('id', id);
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'update_default_service',
    p_target_type: 'service',
    p_target_id: id,
    p_metadata: patch,
  });
}

export async function deleteDefaultService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'delete_default_service',
    p_target_type: 'service',
    p_target_id: id,
    p_metadata: {},
  });
}

export async function fetchCities(): Promise<CityCatalogRow[]> {
  const { data, error } = await supabase
    .from('city_catalog')
    .select('id, name, province, region, is_active, sort_order')
    .order('sort_order')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCity(input: { name: string; province?: string; region?: string }) {
  const { data, error } = await supabase
    .from('city_catalog')
    .insert({
      name: input.name.trim(),
      province: input.province?.trim() || null,
      region: input.region?.trim() || 'Puglia',
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'create_city',
    p_target_type: 'city',
    p_target_id: data.id,
    p_metadata: input,
  });
}

export async function updateCity(id: string, patch: { name?: string; province?: string; is_active?: boolean; sort_order?: number }) {
  const { error } = await supabase.from('city_catalog').update(patch).eq('id', id);
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'update_city',
    p_target_type: 'city',
    p_target_id: id,
    p_metadata: patch,
  });
}

export async function createServiceCategory(input: { name: string; slug: string; sort_order?: number }) {
  const { data, error } = await supabase
    .from('service_categories')
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: 'construct-outline',
      sort_order: input.sort_order ?? 99,
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'create_category',
    p_target_type: 'service_category',
    p_target_id: data.id,
    p_metadata: input,
  });
}

export async function fetchCategoriesWithCount(): Promise<ServiceCategoryRow[]> {
  await supabase.rpc('sync_service_category_counts').then(() => undefined, () => undefined);
  const { data, error } = await supabase
    .from('service_categories')
    .select('id, slug, name, professional_count, is_active, sort_order, icon')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function searchCities(query: string, limit = 15): Promise<CityCatalogRow[]> {
  const { data, error } = await supabase.rpc('search_city_catalog', {
    p_query: query.trim(),
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as CityCatalogRow[];
}
