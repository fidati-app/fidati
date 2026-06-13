import { PROFESSIONAL_IMAGES } from '@/constants/images';
import { getCategoryCoverUrl } from '@/constants/categoryCatalog';
import { CategorySlug, Professional } from '@/types';

const EXTRA_BY_CATEGORY: Record<CategorySlug, string[]> = {
  elettricisti: [
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=600&fit=crop',
  ],
  idraulici: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
  ],
  fabbri: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
  ],
  giardinieri: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&h=600&fit=crop',
  ],
  pulizie: [
    'https://images.unsplash.com/photo-1527515637462-cff94eecc458?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1563453392213-326a5d1dd51b?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=900&h=600&fit=crop',
  ],
  imbianchini: [
    'https://images.unsplash.com/photo-1589939705382-5ae4810242a0?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=600&fit=crop',
  ],
  serramentisti: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
  ],
  caldaie: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
  ],
  condizionatori: [
    'https://images.unsplash.com/photo-1585771724944-230ac3de9884?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
  ],
  'traslochi-sgomberi': [
    'https://images.unsplash.com/photo-1600518468881-ce588ea7c948?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
  ],
  antennisti: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=600&fit=crop',
  ],
  'montaggio-mobili': [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=600&fit=crop',
  ],
  'tende-da-sole': [
    'https://images.unsplash.com/photo-1598928636138-d97944675141?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop',
  ],
};

export function getProfessionalGalleryImages(professional: Professional): string[] {
  const extras = EXTRA_BY_CATEGORY[professional.categorySlug];
  const proImages = PROFESSIONAL_IMAGES[professional.id as keyof typeof PROFESSIONAL_IMAGES];
  const categoryCover = getCategoryCoverUrl(professional.categorySlug);

  const pool = [
    professional.heroImageUrl,
    proImages?.hero ?? categoryCover,
    professional.imageUrl,
    extras[0],
    extras[1],
    extras[2],
    categoryCover,
  ];

  const unique = [...new Set(pool.filter(Boolean))];
  return unique.slice(0, 5);
}
