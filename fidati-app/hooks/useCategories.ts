import { useEffect, useState } from 'react';

import { CATEGORIES } from '@/constants/categories';
import { fetchCategories } from '@/services/categoriesService';
import { Category } from '@/types';

export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    let active = true;
    fetchCategories().then((data) => {
      if (active) setCategories(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
