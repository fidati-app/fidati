import { CATEGORIES } from '@/constants/categories';
import {
  getOfficialCategoryName,
  normalizeOfficialCategories,
  resolveCategorySlug,
} from '@/constants/categoryCatalog';
import { supabase } from '@/lib/supabase';
import { Category, CategoryIcon, CategorySlug } from '@/types';

import { withMockFallback } from './supabaseUtils';

interface CategoryRow {
  id: string;
  legacy_id: string | null;
  slug: string;
  name: string;
  icon: string;
  description: string;
  professional_count: number;
  home_count: number;
  sort_order: number;
}

function mapCategory(row: CategoryRow): Category {
  const slug = resolveCategorySlug(row.slug);
  return {
    id: row.legacy_id ?? row.id,
    slug,
    name: getOfficialCategoryName(slug),
    icon: row.icon as CategoryIcon,
    description: row.description,
    professionalCount: row.professional_count,
    homeCount: row.home_count,
  };
}

const META = {
  service: 'categoriesService',
  table: 'service_categories',
  name: 'list',
  source: 'useCategories()',
};

export async function fetchCategories(): Promise<Category[]> {
  return withMockFallback(
    META,
    async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return normalizeOfficialCategories((data as CategoryRow[]).map(mapCategory));
    },
    CATEGORIES,
  );
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
