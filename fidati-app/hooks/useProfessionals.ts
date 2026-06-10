import { useEffect, useMemo, useState } from 'react';

import {
  fetchProfessionalByLegacyId,
  fetchProfessionals,
  fetchProfessionalsByCategory,
} from '@/services/professionalsService';
import {
  getAvailableToday,
  getProfessionalById,
  getProfessionalsByCategory,
  getRecommendedProfessionals,
  MOCK_PROFESSIONALS,
} from '@/services/mockData';
import { CategorySlug, Professional } from '@/types';

export function useRecommendedProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>(
    () => getRecommendedProfessionals(),
  );

  useEffect(() => {
    let active = true;
    fetchProfessionals().then((data) => {
      if (!active) return;
      const recommended = [...data]
        .filter((p) => p.availableToday)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
      if (recommended.length > 0) setProfessionals(recommended);
    });
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

export function useAvailableToday() {
  const [professionals, setProfessionals] = useState<Professional[]>(() => getAvailableToday());

  useEffect(() => {
    let active = true;
    fetchProfessionals().then((data) => {
      if (!active) return;
      const available = data.filter((p) => p.availableToday);
      if (available.length > 0) setProfessionals(available);
    });
    return () => {
      active = false;
    };
  }, []);

  return professionals;
}

export function useProfessionalsByCategory(slug: string) {
  const fallback = useMemo(() => getProfessionalsByCategory(slug), [slug]);
  const [professionals, setProfessionals] = useState<Professional[]>(fallback);

  useEffect(() => {
    setProfessionals(fallback);
    let active = true;
    fetchProfessionalsByCategory(slug).then((data) => {
      if (active) setProfessionals(data);
    });
    return () => {
      active = false;
    };
  }, [slug, fallback]);

  return professionals;
}

export function useProfessional(id: string) {
  const fallback = useMemo(() => getProfessionalById(id), [id]);
  const [professional, setProfessional] = useState<Professional | undefined>(fallback);

  useEffect(() => {
    setProfessional(fallback);
    if (!id) return;
    let active = true;
    fetchProfessionalByLegacyId(id).then((data) => {
      if (active && data) setProfessional(data);
    });
    return () => {
      active = false;
    };
  }, [id, fallback]);

  return professional;
}

export function useAllProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);

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
  return ['pulizie', 'idraulici', 'elettricisti', 'giardinieri', 'tuttofare'].includes(slug);
}
