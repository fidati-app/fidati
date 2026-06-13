import { CategorySlug } from '@/types';

import { getCategoryCoverUrl } from './categoryCatalog';

/** Icona brand — stessa risorsa del pulsante «Scopri la garanzia» in fondo Home. */
export const FIDATI_BRAND_ICON = require('@/components/logo_icona.png');

export const PROFESSIONAL_IMAGES = {
  '1': {
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  },
  '2': {
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '3': {
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '4': {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  },
  '5': {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
  '6': {
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1527515637462-cff94eecc458?w=800&h=600&fit=crop',
  },
  '7': {
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  },
  '8': {
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '9': {
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '10': {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '11': {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '12': {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  },
  '13': {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  },
  '14': {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
  '15': {
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
} as const;

export const USER_IMAGE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face';

export const CATEGORY_COVER_IMAGES = {
  elettricisti: getCategoryCoverUrl('elettricisti'),
  idraulici: getCategoryCoverUrl('idraulici'),
  fabbri: getCategoryCoverUrl('fabbri'),
  giardinieri: getCategoryCoverUrl('giardinieri'),
  pulizie: getCategoryCoverUrl('pulizie'),
  imbianchini: getCategoryCoverUrl('imbianchini'),
  serramentisti: getCategoryCoverUrl('serramentisti'),
  caldaie: getCategoryCoverUrl('caldaie'),
  condizionatori: getCategoryCoverUrl('condizionatori'),
  'traslochi-sgomberi': getCategoryCoverUrl('traslochi-sgomberi'),
  antennisti: getCategoryCoverUrl('antennisti'),
  'montaggio-mobili': getCategoryCoverUrl('montaggio-mobili'),
  'tende-da-sole': getCategoryCoverUrl('tende-da-sole'),
} as const satisfies Record<CategorySlug, string>;
