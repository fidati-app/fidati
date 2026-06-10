import { CategorySlug } from '@/types';

export const CATEGORY_COLORS: Record<CategorySlug, string> = {
  pulizie: '#10B981',
  idraulici: '#3B82F6',
  elettricisti: '#F59E0B',
  giardinieri: '#22C55E',
  tuttofare: '#64748B',
};

const OVERLAY_ALPHA = 0.62;
const OVERLAY_ALPHA_COMPACT = 0.58;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCategoryOverlayColor(slug: CategorySlug, compact = false): string {
  return hexToRgba(CATEGORY_COLORS[slug], compact ? OVERLAY_ALPHA_COMPACT : OVERLAY_ALPHA);
}

export function getCategoryBorderColor(slug: CategorySlug, alpha = 0.45): string {
  return hexToRgba(CATEGORY_COLORS[slug], alpha);
}

export function getCategoryTintColors(slug: CategorySlug) {
  const color = CATEGORY_COLORS[slug];
  return {
    backgroundColor: hexToRgba(color, 0.12),
    borderColor: hexToRgba(color, 0.28),
    textColor: color,
  };
}
