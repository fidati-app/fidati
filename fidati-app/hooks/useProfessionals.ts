import { useEffect, useState } from 'react';

import { CATEGORY_SLUGS } from '@/constants/categoryCatalog';
import {
  fetchProfessionalByLegacyId,
  fetchProfessionals,
  fetchProfessionalsByCategory,
} from '@/services/professionalsService';
import { CategorySlug, Professional } from '@/types';

export function useRecommendedProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    let active = true;
    fetchProfessionals().then((data) => {
      if (!active) return;
      const recommended = [...data]
        .filter((p) => p.availableToday)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      setProfessionals(recommended);
    });
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

export function useAvailableToday() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    let active = true;
    fetchProfessionals().then((data) => {
      if (!active) return;
      setProfessionals(data.filter((p) => p.availableToday));
    });
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

export function useProfessionalsByCategory(slug: string) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    let active = true;
    fetchProfessionalsByCategory(slug).then((data) => {
      if (active) setProfessionals(data);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  return professionals;
}

export function useProfessional(id: string) {
  const [professional, setProfessional] = useState<Professional | undefined>();

  useEffect(() => {
    if (!id) {
      setProfessional(undefined);
      return;
    }
    let active = true;
    setProfessional(undefined);
    fetchProfessionalByLegacyId(id).then((data) => {
      if (active) setProfessional(data ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return professional;
}

export function useAllProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    let active = true;
    fetchProfessionals().then((data) => {
      if (active) setProfessionals(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug);
}
