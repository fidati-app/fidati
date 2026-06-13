import { Category, CategorySlug, Professional, ServiceCity } from '@/types';

export function professionalOperatesInCity(
  professional: Professional,
  city: ServiceCity,
): boolean {
  return Array.isArray(professional.serviceAreas) && professional.serviceAreas.includes(city);
}

export function filterProfessionalsByCity(
  professionals: Professional[],
  city: string | null,
): Professional[] {
  if (!city?.trim()) return [];
  const normalized = city.trim();
  return professionals.filter(
    (professional) =>
      Array.isArray(professional.serviceAreas) &&
      professional.serviceAreas.some(
        (area) => area.toLowerCase() === normalized.toLowerCase(),
      ),
  );
}

export function filterProfessionalsByCategory(
  filteredProfessionals: Professional[],
  categorySlug: CategorySlug,
): Professional[] {
  return filteredProfessionals.filter(
    (professional) => professional.categorySlug === categorySlug,
  );
}

export function countProfessionalsByCategory(
  professionals: Professional[],
): Partial<Record<CategorySlug, number>> {
  const counts: Partial<Record<CategorySlug, number>> = {};

  for (const professional of professionals) {
    counts[professional.categorySlug] = (counts[professional.categorySlug] ?? 0) + 1;
  }

  return counts;
}

export function countProfessionalsByCategoryInCity(
  professionals: Professional[],
  city: string | null,
): Partial<Record<CategorySlug, number>> {
  const inCity = filterProfessionalsByCity(professionals, city);
  const counts: Partial<Record<CategorySlug, number>> = {};

  for (const professional of inCity) {
    counts[professional.categorySlug] = (counts[professional.categorySlug] ?? 0) + 1;
  }

  return counts;
}

export function countProfessionalsInCity(
  professionals: Professional[],
  city: string | null,
): number {
  return filterProfessionalsByCity(professionals, city).length;
}

export function getCategoryCountInCity(
  professionals: Professional[],
  city: string | null,
  slug: CategorySlug,
): number {
  return filterProfessionalsByCity(professionals, city).filter(
    (professional) => professional.categorySlug === slug,
  ).length;
}

export function categoryHasProsInZone(
  slug: CategorySlug,
  categoryCounts: Partial<Record<CategorySlug, number>>,
): boolean {
  return (categoryCounts[slug] ?? 0) > 0;
}

export function filterCategoriesWithProsInZone(
  categories: Category[],
  categoryCounts: Partial<Record<CategorySlug, number>>,
): Category[] {
  return categories.filter((category) => categoryHasProsInZone(category.slug, categoryCounts));
}
