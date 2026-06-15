import { useEffect, useState } from 'react';

import { CATEGORY_SLUGS } from '@/constants/categoryCatalog';
import {
  fetchProfessionalById,
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
  const [isLoading, setIsLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      setProfessional(undefined);
      setIsLoading(false);
      return;
    }

    let active = true;
    setProfessional(undefined);
    setIsLoading(true);

    if (__DEV__) {
      console.log('[Fidati] useProfessional:load', { id });
    }

    fetchProfessionalById(id)
      .then((data) => {
        if (!active) return;
        if (__DEV__) {
          console.log('[Fidati] useProfessional:result', { id, found: Boolean(data) });
        }
        setProfessional(data ?? undefined);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { professional, isLoading };
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
