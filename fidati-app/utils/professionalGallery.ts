import { CATEGORY_COVER_IMAGES, PROFESSIONAL_IMAGES } from '@/constants/images';
import { CategorySlug, Professional } from '@/types';

const EXTRA_BY_CATEGORY: Record<CategorySlug, string[]> = {
  pulizie: [
    'https://images.unsplash.com/photo-1527515637462-cff94eecc458?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563453392213-326a5d1dd51b?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=900&h=600&fit=crop',
  ],
  idraulici: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
  ],
  elettricisti: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=600&fit=crop',
  ],
  giardinieri: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=600&fit=crop',
  ],
  tuttofare: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=600&fit=crop',
  ],
};

export function getProfessionalGalleryImages(professional: Professional): string[] {
  const extras = EXTRA_BY_CATEGORY[professional.categorySlug];
  const proImages = PROFESSIONAL_IMAGES[professional.id as keyof typeof PROFESSIONAL_IMAGES];

  const pool = [
    professional.heroImageUrl,
    proImages?.hero ?? CATEGORY_COVER_IMAGES[professional.categorySlug],
    professional.imageUrl,
    extras[0],
    extras[1],
    extras[2],
    CATEGORY_COVER_IMAGES[professional.categorySlug],
  ];

  const unique = [...new Set(pool.filter(Boolean))];
  return unique.slice(0, 5);
}
