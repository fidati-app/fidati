import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    slug: 'pulizie',
    name: 'Pulizie',
    icon: 'sparkles-outline',
    description:
      'Professionisti per pulizie domestiche, uffici e post-ristrutturazione.',
    professionalCount: 128,
    homeCount: 1240,
  },
  {
    id: '2',
    slug: 'idraulici',
    name: 'Idraulici',
    icon: 'water-outline',
    description:
      'Riparazioni, installazioni e manutenzione idraulica.',
    professionalCount: 94,
    homeCount: 860,
  },
  {
    id: '3',
    slug: 'elettricisti',
    name: 'Elettricisti',
    icon: 'flash-outline',
    description:
      'Impianti elettrici, illuminazione e domotica certificata.',
    professionalCount: 76,
    homeCount: 1120,
  },
  {
    id: '4',
    slug: 'giardinieri',
    name: 'Giardinieri',
    icon: 'leaf-outline',
    description:
      'Cura del verde, potature e manutenzione giardini.',
    professionalCount: 52,
    homeCount: 780,
  },
  {
    id: '5',
    slug: 'tuttofare',
    name: 'Tuttofare',
    icon: 'construct-outline',
    description:
      'Piccoli lavori domestici, montaggi e riparazioni.',
    professionalCount: 110,
    homeCount: 1500,
  },
];

export const QUICK_FILTERS = [
  { id: 'casa', label: 'Casa', icon: 'home-outline' as const },
  { id: 'azienda', label: 'Azienda', icon: 'business-outline' as const },
  { id: 'urgente', label: 'Urgente', icon: 'time-outline' as const },
  { id: 'vicino', label: 'Vicino a me', icon: 'location-outline' as const },
  { id: 'oggi', label: 'Oggi', icon: 'today-outline' as const },
  { id: 'verificati', label: 'Verificati', icon: 'shield-checkmark-outline' as const },
  { id: 'top', label: 'Top', icon: 'star-outline' as const },
  { id: 'economico', label: 'Economico', icon: 'pricetag-outline' as const },
];
