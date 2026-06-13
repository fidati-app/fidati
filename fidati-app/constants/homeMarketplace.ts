import { OFFICIAL_CATEGORY_CATALOG } from '@/constants/categoryCatalog';
import { FIDATI_BRAND_ICON } from '@/constants/images';
import { CategoryIcon } from '@/types';
import { ImageSource } from 'expo-image';

export interface PopularService {
  id: string;
  title: string;
  icon: CategoryIcon;
  slug: string;
  rating: number;
  completedJobs: number;
  avgPrice: number;
  imageUrl: string;
}

export interface HomeServiceTile {
  id: string;
  title: string;
  icon: CategoryIcon;
  slug: string;
}


export interface HomeReview {
  id: string;
  clientName: string;
  rating: number;
  text: string;
  service: string;
}

export interface HomeOffer {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
}

export interface UrgentProfessional {
  professionalId: string;
  badge: 'Entro 1 ora' | 'Oggi' | 'Entro 2 ore';
}

export interface HomePromoBanner {
  id: string;
  title: string;
  subtitle: string;
  iconBg: string;
  icon?: CategoryIcon;
  iconColor?: string;
  /** Icona brand al posto di Ionicons (es. Garanzia Fidati). */
  imageSource?: ImageSource;
}

export interface GuaranteeItem {
  id: string;
  icon: CategoryIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  proof: string;
}

export interface TrustStat {
  id: string;
  value: string;
  label: string;
}

export interface HowItWorksStep {
  id: string;
  step: number;
  icon: CategoryIcon;
  label: string;
  description: string;
  iconColor: string;
  iconBg: string;
  accentLine: string;
}

export const POPULAR_SERVICES: PopularService[] = OFFICIAL_CATEGORY_CATALOG.map((category, index) => ({
  id: `ps${index + 1}`,
  title: category.name,
  icon: category.icon,
  slug: category.slug,
  rating: 4.7 + (index % 3) * 0.1,
  completedJobs: category.homeCount,
  avgPrice: 25 + (index % 6) * 5,
  imageUrl: category.coverFallback,
}));

export const HOME_SERVICES_CASA: HomeServiceTile[] = [
  { id: 'c1', title: 'Pulizie domestiche', icon: 'sparkles-outline', slug: 'pulizie' },
  { id: 'c2', title: "Perdite d'acqua", icon: 'water-outline', slug: 'idraulici' },
  { id: 'c3', title: 'Scarichi otturati', icon: 'funnel-outline', slug: 'idraulici' },
  { id: 'c4', title: 'Impianti luce', icon: 'bulb-outline', slug: 'elettricisti' },
  { id: 'c5', title: 'Cura giardino', icon: 'leaf-outline', slug: 'giardinieri' },
  { id: 'c6', title: 'Montaggio mobili', icon: 'hammer-outline', slug: 'montaggio-mobili' },
  { id: 'c7', title: 'Imbiancatura', icon: 'color-palette-outline', slug: 'imbianchini' },
  { id: 'c8', title: 'Serrature', icon: 'key-outline', slug: 'fabbri' },
  { id: 'c9', title: 'Climatizzatori', icon: 'snow-outline', slug: 'condizionatori' },
  { id: 'c10', title: 'Traslochi', icon: 'car-outline', slug: 'traslochi-sgomberi' },
];

export const HOME_SERVICES_AZIENDA: HomeServiceTile[] = [
  { id: 'a1', title: 'Pulizie uffici', icon: 'business-outline', slug: 'pulizie' },
  { id: 'a2', title: 'Sanificazione', icon: 'shield-checkmark-outline', slug: 'pulizie' },
  { id: 'a3', title: 'Videosorveglianza', icon: 'videocam-outline', slug: 'elettricisti' },
  { id: 'a4', title: 'Antincendio', icon: 'flame-outline', slug: 'elettricisti' },
  { id: 'a5', title: 'Impianti elettrici', icon: 'flash-outline', slug: 'elettricisti' },
  { id: 'a6', title: 'Cablaggio rete', icon: 'git-network-outline', slug: 'elettricisti' },
  { id: 'a7', title: 'Condizionatori', icon: 'snow-outline', slug: 'condizionatori' },
  { id: 'a8', title: 'Facchinaggio', icon: 'cube-outline', slug: 'traslochi-sgomberi' },
  { id: 'a9', title: 'Facility management', icon: 'settings-outline', slug: 'pulizie' },
  { id: 'a10', title: 'Manutenzione caldaie', icon: 'flame-outline', slug: 'caldaie' },
];

export const HOME_PROMO_BANNERS: HomePromoBanner[] = [
  {
    id: 'b1',
    imageSource: FIDATI_BRAND_ICON,
    iconBg: 'rgba(16, 185, 129, 0.14)',
    title: 'Garanzia Fidati',
    subtitle: 'Affidabilità e qualità al centro di ogni intervento.',
  },
  {
    id: 'b2',
    icon: 'flash',
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.18)',
    title: 'Interventi rapidi',
    subtitle: 'Disponibilità entro 1 ora',
  },
  {
    id: 'b3',
    icon: 'star',
    iconColor: '#FBBF24',
    iconBg: 'rgba(251, 191, 36, 0.18)',
    title: 'Migliaia di recensioni',
    subtitle: 'Confronta e scegli con fiducia',
  },
];

export const FIDATI_TRUST_STATS: TrustStat[] = [
  { id: 'ts1', value: '2.400+', label: 'professionisti' },
  { id: 'ts2', value: '18.000+', label: 'interventi' },
  { id: 'ts3', value: '4,8★', label: 'valutazione media' },
];

export const FIDATI_GUARANTEE: GuaranteeItem[] = [
  {
    id: 'g1',
    icon: 'shield-checkmark',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Professionisti verificati',
    description: 'Identità e competenze controllate prima di ogni attivazione',
    proof: 'Verifica continua',
  },
  {
    id: 'g2',
    icon: 'star',
    iconColor: '#FBBF24',
    iconBg: 'rgba(251, 191, 36, 0.12)',
    title: 'Recensioni reali',
    description: 'Solo da clienti che hanno completato un intervento',
    proof: '12.000+ recensioni',
  },
  {
    id: 'g3',
    icon: 'lock-closed',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.12)',
    title: 'Pagamenti sicuri',
    description: 'Transazioni protette e tracciate in app',
    proof: 'Protezione totale',
  },
];

export const FIDATI_HOW_IT_WORKS: HowItWorksStep[] = [
  {
    id: 's1',
    step: 1,
    icon: 'search-outline',
    label: 'Cerca il servizio',
    description: 'Scegli tra pulizie, idraulici, elettricisti e molto altro',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    accentLine: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 's2',
    step: 2,
    icon: 'people-outline',
    label: 'Confronta i professionisti',
    description: 'Valutazioni, recensioni e prezzi sempre visibili',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.12)',
    accentLine: 'rgba(59, 130, 246, 0.35)',
  },
  {
    id: 's3',
    step: 3,
    icon: 'calendar-outline',
    label: 'Prenota in pochi secondi',
    description: 'Conferma data, orario e pagamento in un tap',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    accentLine: 'rgba(16, 185, 129, 0.35)',
  },
];

export const URGENT_PROFESSIONALS: UrgentProfessional[] = [
  { professionalId: '2', badge: 'Entro 1 ora' },
  { professionalId: '3', badge: 'Oggi' },
  { professionalId: '5', badge: 'Entro 2 ore' },
  { professionalId: '1', badge: 'Oggi' },
];

export const NEW_PROFESSIONAL_IDS = ['6', '3', '1', '2'];

export const HOME_REVIEWS: HomeReview[] = [
  {
    id: 'r1',
    clientName: 'Giulia M.',
    rating: 5,
    text: 'Precisa, puntuale e professionale.',
    service: 'Pulizie domestiche',
  },
  {
    id: 'r2',
    clientName: 'Marco T.',
    rating: 5,
    text: 'Intervento rapido, problema risolto in un\'ora.',
    service: 'Idraulico',
  },
  {
    id: 'r3',
    clientName: 'Elena R.',
    rating: 4.8,
    text: 'Giardino impeccabile, consigli utili sulla manutenzione.',
    service: 'Giardinaggio',
  },
  {
    id: 'r4',
    clientName: 'Andrea P.',
    rating: 5,
    text: 'Montaggio perfetto e area lasciata pulita.',
    service: 'Montaggio mobili',
  },
];

export const HOME_OFFERS: HomeOffer[] = [
  {
    id: 'o1',
    title: 'Prima pulizia',
    highlight: '-20%',
    subtitle: 'Sui primi 2 interventi in app',
  },
  {
    id: 'o2',
    title: 'Giardiniere',
    highlight: 'da 29€',
    subtitle: 'Manutenzione base fino a 80 mq',
  },
  {
    id: 'o3',
    title: 'Controllo elettrico',
    highlight: 'da 39€',
    subtitle: 'Verifica impianto e sicurezza',
  },
  {
    id: 'o4',
    title: 'Idraulico express',
    highlight: '-15%',
    subtitle: 'Prenotazione entro le 12:00',
  },
];
