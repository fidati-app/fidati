import { CategoryIcon, CategorySlug } from '@/types';

export interface CategorySubService {
  id: string;
  title: string;
  icon: CategoryIcon;
  avgPrice: number;
  bookings: number;
}

export interface CategoryOffer {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
}

export const CATEGORY_SEARCH_PLACEHOLDERS: Record<CategorySlug, string> = {
  pulizie: 'Cerca pulizia profonda, uffici, post-cantiere...',
  idraulici: 'Cerca perdite, rubinetteria, caldaia, scarichi...',
  elettricisti: 'Cerca impianti, illuminazione, domotica...',
  giardinieri: 'Cerca potatura, manutenzione verde, terrazzi...',
  tuttofare: 'Cerca montaggi, riparazioni, piccoli lavori...',
};

export const CATEGORY_SUB_SERVICES: Record<CategorySlug, CategorySubService[]> = {
  pulizie: [
    { id: 'pul-1', title: 'Pulizia profonda casa', icon: 'home-outline', avgPrice: 85, bookings: 1240 },
    { id: 'pul-2', title: 'Pulizie ufficio', icon: 'business-outline', avgPrice: 120, bookings: 680 },
    { id: 'pul-3', title: 'Post-ristrutturazione', icon: 'construct-outline', avgPrice: 150, bookings: 420 },
    { id: 'pul-4', title: 'Sanificazione', icon: 'shield-checkmark-outline', avgPrice: 95, bookings: 310 },
    { id: 'pul-5', title: 'Lavaggio vetri', icon: 'sparkles-outline', avgPrice: 55, bookings: 890 },
    { id: 'pul-6', title: 'B&B e affitti brevi', icon: 'bed-outline', avgPrice: 70, bookings: 540 },
  ],
  idraulici: [
    { id: 'idr-1', title: 'Perdite e tubature', icon: 'water-outline', avgPrice: 60, bookings: 920 },
    { id: 'idr-2', title: 'Rubinetteria', icon: 'funnel-outline', avgPrice: 75, bookings: 640 },
    { id: 'idr-3', title: 'Caldaia e boiler', icon: 'flame-outline', avgPrice: 130, bookings: 380 },
    { id: 'idr-4', title: 'Scarichi otturati', icon: 'alert-circle-outline', avgPrice: 55, bookings: 710 },
    { id: 'idr-5', title: 'Installazioni', icon: 'build-outline', avgPrice: 110, bookings: 290 },
  ],
  elettricisti: [
    { id: 'ele-1', title: 'Impianto elettrico', icon: 'flash-outline', avgPrice: 90, bookings: 760 },
    { id: 'ele-2', title: 'Illuminazione', icon: 'bulb-outline', avgPrice: 65, bookings: 580 },
    { id: 'ele-3', title: 'Domotica', icon: 'wifi-outline', avgPrice: 140, bookings: 210 },
    { id: 'ele-4', title: 'Certificazioni', icon: 'document-text-outline', avgPrice: 120, bookings: 340 },
    { id: 'ele-5', title: 'Guasti urgenti', icon: 'warning-outline', avgPrice: 70, bookings: 890 },
  ],
  giardinieri: [
    { id: 'gia-1', title: 'Potatura alberi', icon: 'leaf-outline', avgPrice: 80, bookings: 450 },
    { id: 'gia-2', title: 'Manutenzione giardino', icon: 'flower-outline', avgPrice: 65, bookings: 620 },
    { id: 'gia-3', title: 'Erba e siepi', icon: 'cut-outline', avgPrice: 50, bookings: 780 },
    { id: 'gia-4', title: 'Terrazzi e balconi', icon: 'sunny-outline', avgPrice: 55, bookings: 390 },
    { id: 'gia-5', title: 'Irrigazione', icon: 'rainy-outline', avgPrice: 95, bookings: 180 },
  ],
  tuttofare: [
    { id: 'tut-1', title: 'Montaggio mobili', icon: 'cube-outline', avgPrice: 45, bookings: 1120 },
    { id: 'tut-2', title: 'Riparazioni casa', icon: 'hammer-outline', avgPrice: 55, bookings: 980 },
    { id: 'tut-3', title: 'Piccoli lavori', icon: 'construct-outline', avgPrice: 40, bookings: 1500 },
    { id: 'tut-4', title: 'Tinteggiatura', icon: 'color-palette-outline', avgPrice: 85, bookings: 420 },
    { id: 'tut-5', title: 'Serramenti', icon: 'lock-closed-outline', avgPrice: 70, bookings: 360 },
  ],
};

export const CATEGORY_OFFERS: Record<CategorySlug, CategoryOffer[]> = {
  pulizie: [
    { id: 'o1', title: 'Prima pulizia', highlight: '-20%', subtitle: 'Appartamenti fino a 80 mq' },
    { id: 'o2', title: 'Pacchetto mensile', highlight: '3×', subtitle: 'Pulizie programmate' },
    { id: 'o3', title: 'Fine settimana', highlight: '-10%', subtitle: 'Sabato e domenica' },
    { id: 'o4', title: 'Post-cantiere', highlight: 'da 99€', subtitle: 'Sgombero e sanificazione' },
    { id: 'o5', title: 'Referral', highlight: '15€', subtitle: 'Invita un amico su Fidati' },
  ],
  idraulici: [
    { id: 'o1', title: 'Controllo impianto', highlight: '49€', subtitle: 'Diagnosi a prezzo fisso' },
    { id: 'o2', title: 'Urgenza serale', highlight: '-15%', subtitle: 'Dopo le 18:00' },
    { id: 'o3', title: 'Perdita rapida', highlight: '39€', subtitle: 'Intervento entro 2 ore' },
    { id: 'o4', title: 'Caldaia check', highlight: '69€', subtitle: 'Manutenzione annuale' },
    { id: 'o5', title: 'Doppio intervento', highlight: '-12%', subtitle: 'Due lavori nello stesso giorno' },
  ],
  elettricisti: [
    { id: 'o1', title: 'Check impianto', highlight: '59€', subtitle: 'Sicurezza e messa a norma' },
    { id: 'o2', title: 'LED pack', highlight: '-25%', subtitle: 'Sostituzione punti luce' },
    { id: 'o3', title: 'Prima visita', highlight: 'Gratis', subtitle: 'Sopralluogo senza impegno' },
    { id: 'o4', title: 'Domotica base', highlight: '-18%', subtitle: 'Kit smart home starter' },
    { id: 'o5', title: 'Weekend', highlight: '-10%', subtitle: 'Interventi sabato mattina' },
  ],
  giardinieri: [
    { id: 'o1', title: 'Prima potatura', highlight: '-15%', subtitle: 'Giardini fino a 200 mq' },
    { id: 'o2', title: 'Stagionale', highlight: '4×', subtitle: 'Manutenzione trimestrale' },
    { id: 'o3', title: 'Erba + siepi', highlight: 'da 45€', subtitle: 'Pacchetto completo' },
    { id: 'o4', title: 'Primavera', highlight: '-20%', subtitle: 'Rinverdimento e concime' },
    { id: 'o5', title: 'Balcone', highlight: '29€', subtitle: 'Cura terrazzi e vasi' },
  ],
  tuttofare: [
    { id: 'o1', title: 'Ore pacchetto', highlight: '5h', subtitle: 'Prezzo bloccato' },
    { id: 'o2', title: 'Montaggio IKEA', highlight: 'da 35€', subtitle: 'Mobili e complementi' },
    { id: 'o3', title: 'Primo intervento', highlight: '-15%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Doppio lavoro', highlight: '-10%', subtitle: 'Due piccoli interventi' },
    { id: 'o5', title: 'Fissaggio TV', highlight: '29€', subtitle: 'Staffa e collaudo inclusi' },
  ],
};
