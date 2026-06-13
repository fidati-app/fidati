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
  elettricisti: 'Cerca impianti, illuminazione, domotica...',
  idraulici: 'Cerca perdite, rubinetteria, scarichi, installazioni...',
  fabbri: 'Cerca aperture porte, serrature, pronto intervento...',
  giardinieri: 'Cerca potatura, manutenzione verde, terrazzi...',
  pulizie: 'Cerca pulizia profonda, uffici, post-cantiere...',
  imbianchini: 'Cerca tinteggiatura, esterni, ritocchi, carta da parati...',
  serramentisti: 'Cerca infissi, porte, tapparelle, regolazioni...',
  caldaie: 'Cerca caldaie, manutenzione, pronto intervento...',
  condizionatori: 'Cerca condizionatori, split, installazione...',
  'traslochi-sgomberi': 'Cerca traslochi, sgomberi, cantine, uffici...',
  antennisti: 'Cerca antenne TV, parabole, puntamento, digitale...',
  'montaggio-mobili': 'Cerca montaggio IKEA, cucine, fissaggi, mensole...',
  'tende-da-sole': 'Cerca installazione, teli, pergole, motorizzazione...',
};

export const CATEGORY_SUB_SERVICES: Record<CategorySlug, CategorySubService[]> = {
  elettricisti: [
    { id: 'ele-1', title: 'Impianto elettrico', icon: 'flash-outline', avgPrice: 90, bookings: 760 },
    { id: 'ele-2', title: 'Illuminazione', icon: 'bulb-outline', avgPrice: 65, bookings: 580 },
    { id: 'ele-3', title: 'Domotica', icon: 'wifi-outline', avgPrice: 140, bookings: 210 },
    { id: 'ele-4', title: 'Certificazioni', icon: 'document-text-outline', avgPrice: 120, bookings: 340 },
    { id: 'ele-5', title: 'Guasti urgenti', icon: 'warning-outline', avgPrice: 70, bookings: 890 },
  ],
  idraulici: [
    { id: 'idr-1', title: 'Perdite e tubature', icon: 'water-outline', avgPrice: 60, bookings: 920 },
    { id: 'idr-2', title: 'Rubinetteria', icon: 'funnel-outline', avgPrice: 75, bookings: 640 },
    { id: 'idr-3', title: 'Caldaia e boiler', icon: 'flame-outline', avgPrice: 130, bookings: 380 },
    { id: 'idr-4', title: 'Scarichi otturati', icon: 'alert-circle-outline', avgPrice: 55, bookings: 710 },
    { id: 'idr-5', title: 'Installazioni', icon: 'build-outline', avgPrice: 110, bookings: 290 },
  ],
  fabbri: [
    { id: 'fab-1', title: 'Aperture porte', icon: 'key-outline', avgPrice: 55, bookings: 840 },
    { id: 'fab-2', title: 'Sostituzione serrature', icon: 'lock-closed-outline', avgPrice: 75, bookings: 620 },
    { id: 'fab-3', title: 'Serrature blindate', icon: 'shield-checkmark-outline', avgPrice: 120, bookings: 310 },
    { id: 'fab-4', title: 'Pronto intervento', icon: 'time-outline', avgPrice: 65, bookings: 950 },
    { id: 'fab-5', title: 'Lavori in ferro', icon: 'hammer-outline', avgPrice: 90, bookings: 280 },
  ],
  giardinieri: [
    { id: 'gia-1', title: 'Potatura alberi', icon: 'leaf-outline', avgPrice: 80, bookings: 450 },
    { id: 'gia-2', title: 'Manutenzione giardino', icon: 'flower-outline', avgPrice: 65, bookings: 620 },
    { id: 'gia-3', title: 'Erba e siepi', icon: 'cut-outline', avgPrice: 50, bookings: 780 },
    { id: 'gia-4', title: 'Terrazzi e balconi', icon: 'sunny-outline', avgPrice: 55, bookings: 390 },
    { id: 'gia-5', title: 'Irrigazione', icon: 'rainy-outline', avgPrice: 95, bookings: 180 },
  ],
  pulizie: [
    { id: 'pul-1', title: 'Pulizia profonda casa', icon: 'home-outline', avgPrice: 85, bookings: 1240 },
    { id: 'pul-2', title: 'Pulizie ufficio', icon: 'business-outline', avgPrice: 120, bookings: 680 },
    { id: 'pul-3', title: 'Post-ristrutturazione', icon: 'construct-outline', avgPrice: 150, bookings: 420 },
    { id: 'pul-4', title: 'Sanificazione', icon: 'shield-checkmark-outline', avgPrice: 95, bookings: 310 },
    { id: 'pul-5', title: 'Lavaggio vetri', icon: 'sparkles-outline', avgPrice: 55, bookings: 890 },
    { id: 'pul-6', title: 'B&B e affitti brevi', icon: 'bed-outline', avgPrice: 70, bookings: 540 },
  ],
  imbianchini: [
    { id: 'imb-1', title: 'Tinteggiatura interni', icon: 'color-palette-outline', avgPrice: 85, bookings: 420 },
    { id: 'imb-2', title: 'Pittura esterni', icon: 'home-outline', avgPrice: 120, bookings: 260 },
    { id: 'imb-3', title: 'Ritocchi e stucco', icon: 'brush-outline', avgPrice: 55, bookings: 580 },
    { id: 'imb-4', title: 'Carta da parati', icon: 'layers-outline', avgPrice: 95, bookings: 190 },
    { id: 'imb-5', title: 'Decorazioni', icon: 'sparkles-outline', avgPrice: 110, bookings: 140 },
  ],
  serramentisti: [
    { id: 'ser-1', title: 'Infissi e finestre', icon: 'albums-outline', avgPrice: 70, bookings: 360 },
    { id: 'ser-2', title: 'Porte e cerniere', icon: 'lock-closed-outline', avgPrice: 65, bookings: 480 },
    { id: 'ser-3', title: 'Tapparelle', icon: 'reorder-four-outline', avgPrice: 55, bookings: 520 },
    { id: 'ser-4', title: 'Regolazione serramenti', icon: 'build-outline', avgPrice: 45, bookings: 640 },
    { id: 'ser-5', title: 'Vetrate e scorrevoli', icon: 'expand-outline', avgPrice: 95, bookings: 210 },
  ],
  caldaie: [
    { id: 'cal-1', title: 'Manutenzione caldaia', icon: 'flame-outline', avgPrice: 80, bookings: 540 },
    { id: 'cal-2', title: 'Pronto intervento', icon: 'warning-outline', avgPrice: 90, bookings: 410 },
    { id: 'cal-3', title: 'Installazione caldaia', icon: 'build-outline', avgPrice: 320, bookings: 180 },
    { id: 'cal-4', title: 'Controllo fumi', icon: 'shield-checkmark-outline', avgPrice: 65, bookings: 290 },
    { id: 'cal-5', title: 'Sostituzione caldaia', icon: 'swap-horizontal-outline', avgPrice: 450, bookings: 120 },
  ],
  condizionatori: [
    { id: 'con-1', title: 'Installazione split', icon: 'snow-outline', avgPrice: 250, bookings: 380 },
    { id: 'con-2', title: 'Pulizia split', icon: 'water-outline', avgPrice: 75, bookings: 620 },
    { id: 'con-3', title: 'Climatizzazione uffici', icon: 'business-outline', avgPrice: 180, bookings: 160 },
    { id: 'con-4', title: 'Ricarica gas', icon: 'thermometer-outline', avgPrice: 95, bookings: 340 },
    { id: 'con-5', title: 'Manutenzione impianti', icon: 'build-outline', avgPrice: 85, bookings: 280 },
  ],
  'traslochi-sgomberi': [
    { id: 'tra-1', title: 'Traslochi casa', icon: 'car-outline', avgPrice: 180, bookings: 420 },
    { id: 'tra-2', title: 'Sgombero cantine', icon: 'trash-outline', avgPrice: 120, bookings: 560 },
    { id: 'tra-3', title: 'Trasporto mobili', icon: 'cube-outline', avgPrice: 95, bookings: 380 },
    { id: 'tra-4', title: 'Svuotamento locali', icon: 'home-outline', avgPrice: 140, bookings: 290 },
    { id: 'tra-5', title: 'Traslochi ufficio', icon: 'business-outline', avgPrice: 220, bookings: 150 },
  ],
  antennisti: [
    { id: 'ant-1', title: 'Antenne TV', icon: 'radio-outline', avgPrice: 70, bookings: 480 },
    { id: 'ant-2', title: 'Parabole satellitari', icon: 'planet-outline', avgPrice: 110, bookings: 260 },
    { id: 'ant-3', title: 'Puntamento segnale', icon: 'navigate-outline', avgPrice: 55, bookings: 620 },
    { id: 'ant-4', title: 'Cavi e prese', icon: 'git-network-outline', avgPrice: 45, bookings: 340 },
    { id: 'ant-5', title: 'Digitale terrestre', icon: 'tv-outline', avgPrice: 65, bookings: 410 },
  ],
  'montaggio-mobili': [
    { id: 'mob-1', title: 'Montaggio mobili', icon: 'cube-outline', avgPrice: 45, bookings: 1120 },
    { id: 'mob-2', title: 'Cucine e armadi', icon: 'restaurant-outline', avgPrice: 85, bookings: 640 },
    { id: 'mob-3', title: 'Piccoli lavori', icon: 'construct-outline', avgPrice: 40, bookings: 1500 },
    { id: 'mob-4', title: 'Fissaggi e mensole', icon: 'hammer-outline', avgPrice: 35, bookings: 890 },
    { id: 'mob-5', title: 'Fissaggio TV', icon: 'tv-outline', avgPrice: 40, bookings: 720 },
  ],
  'tende-da-sole': [
    { id: 'ten-1', title: 'Installazione tende', icon: 'sunny-outline', avgPrice: 90, bookings: 280 },
    { id: 'ten-2', title: 'Sostituzione teli', icon: 'color-fill-outline', avgPrice: 75, bookings: 190 },
    { id: 'ten-3', title: 'Manutenzione tende', icon: 'build-outline', avgPrice: 55, bookings: 340 },
    { id: 'ten-4', title: 'Pergole', icon: 'grid-outline', avgPrice: 150, bookings: 120 },
    { id: 'ten-5', title: 'Motorizzazione', icon: 'settings-outline', avgPrice: 110, bookings: 95 },
  ],
};

export const CATEGORY_OFFERS: Record<CategorySlug, CategoryOffer[]> = {
  elettricisti: [
    { id: 'o1', title: 'Check impianto', highlight: '59€', subtitle: 'Sicurezza e messa a norma' },
    { id: 'o2', title: 'LED pack', highlight: '-25%', subtitle: 'Sostituzione punti luce' },
    { id: 'o3', title: 'Prima visita', highlight: 'Gratis', subtitle: 'Sopralluogo senza impegno' },
    { id: 'o4', title: 'Domotica base', highlight: '-18%', subtitle: 'Kit smart home starter' },
    { id: 'o5', title: 'Weekend', highlight: '-10%', subtitle: 'Interventi sabato mattina' },
  ],
  idraulici: [
    { id: 'o1', title: 'Controllo impianto', highlight: '49€', subtitle: 'Diagnosi a prezzo fisso' },
    { id: 'o2', title: 'Urgenza serale', highlight: '-15%', subtitle: 'Dopo le 18:00' },
    { id: 'o3', title: 'Perdita rapida', highlight: '39€', subtitle: 'Intervento entro 2 ore' },
    { id: 'o4', title: 'Caldaia check', highlight: '69€', subtitle: 'Manutenzione annuale' },
    { id: 'o5', title: 'Doppio intervento', highlight: '-12%', subtitle: 'Due lavori nello stesso giorno' },
  ],
  fabbri: [
    { id: 'o1', title: 'Apertura urgente', highlight: '49€', subtitle: 'Porta chiusa o bloccata' },
    { id: 'o2', title: 'Serratura nuova', highlight: 'da 69€', subtitle: 'Sostituzione e collaudo' },
    { id: 'o3', title: 'Primo intervento', highlight: '-15%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Notturno', highlight: '-10%', subtitle: 'Servizio h24 su richiesta' },
    { id: 'o5', title: 'Blindata', highlight: 'da 99€', subtitle: 'Upgrade sicurezza porta' },
  ],
  giardinieri: [
    { id: 'o1', title: 'Prima potatura', highlight: '-15%', subtitle: 'Giardini fino a 200 mq' },
    { id: 'o2', title: 'Stagionale', highlight: '4×', subtitle: 'Manutenzione trimestrale' },
    { id: 'o3', title: 'Erba + siepi', highlight: 'da 45€', subtitle: 'Pacchetto completo' },
    { id: 'o4', title: 'Primavera', highlight: '-20%', subtitle: 'Rinverdimento e concime' },
    { id: 'o5', title: 'Balcone', highlight: '29€', subtitle: 'Cura terrazzi e vasi' },
  ],
  pulizie: [
    { id: 'o1', title: 'Prima pulizia', highlight: '-20%', subtitle: 'Appartamenti fino a 80 mq' },
    { id: 'o2', title: 'Pacchetto mensile', highlight: '3×', subtitle: 'Pulizie programmate' },
    { id: 'o3', title: 'Fine settimana', highlight: '-10%', subtitle: 'Sabato e domenica' },
    { id: 'o4', title: 'Post-cantiere', highlight: 'da 99€', subtitle: 'Sgombero e sanificazione' },
    { id: 'o5', title: 'Referral', highlight: '15€', subtitle: 'Invita un amico su Fidati' },
  ],
  imbianchini: [
    { id: 'o1', title: 'Prima stanza', highlight: '-15%', subtitle: 'Tinteggiatura fino a 15 mq' },
    { id: 'o2', title: 'Pacchetto casa', highlight: '3×', subtitle: 'Più ambienti insieme' },
    { id: 'o3', title: 'Esterni', highlight: 'da 89€', subtitle: 'Balconi e facciate' },
    { id: 'o4', title: 'Primavera', highlight: '-10%', subtitle: 'Interventi marzo–maggio' },
    { id: 'o5', title: 'Ritocchi', highlight: '39€', subtitle: 'Piccole riparazioni a parete' },
  ],
  serramentisti: [
    { id: 'o1', title: 'Regolazione', highlight: '39€', subtitle: 'Porte e infissi singoli' },
    { id: 'o2', title: 'Doppio infisso', highlight: '-12%', subtitle: 'Due finestre nello stesso giorno' },
    { id: 'o3', title: 'Prima visita', highlight: 'Gratis', subtitle: 'Sopralluogo e preventivo' },
    { id: 'o4', title: 'Tapparelle', highlight: 'da 45€', subtitle: 'Riparazione e sostituzione' },
    { id: 'o5', title: 'Weekend', highlight: '-10%', subtitle: 'Interventi sabato mattina' },
  ],
  caldaie: [
    { id: 'o1', title: 'Check caldaia', highlight: '69€', subtitle: 'Manutenzione annuale' },
    { id: 'o2', title: 'Pronto intervento', highlight: '-15%', subtitle: 'Guasto entro 24 ore' },
    { id: 'o3', title: 'Controllo fumi', highlight: '59€', subtitle: 'Verifica e certificazione' },
    { id: 'o4', title: 'Sostituzione', highlight: '-10%', subtitle: 'Nuova caldaia a condensazione' },
    { id: 'o5', title: 'Pacchetto inverno', highlight: '2×', subtitle: 'Manutenzione + assistenza' },
  ],
  condizionatori: [
    { id: 'o1', title: 'Pulizia split', highlight: '59€', subtitle: 'Singola unità interna' },
    { id: 'o2', title: 'Prima installazione', highlight: '-10%', subtitle: 'Condizionatore mono split' },
    { id: 'o3', title: 'Pacchetto estate', highlight: '2×', subtitle: 'Due split insieme' },
    { id: 'o4', title: 'Ricarica gas', highlight: '79€', subtitle: 'Controllo e ricarica' },
    { id: 'o5', title: 'Urgenza', highlight: '-15%', subtitle: 'Intervento rapido' },
  ],
  'traslochi-sgomberi': [
    { id: 'o1', title: 'Monolocale', highlight: 'da 120€', subtitle: 'Trasloco completo' },
    { id: 'o2', title: 'Sgombero cantina', highlight: '89€', subtitle: 'Fino a 15 mq' },
    { id: 'o3', title: 'Primo trasloco', highlight: '-10%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Weekend', highlight: '-8%', subtitle: 'Sabato e domenica' },
    { id: 'o5', title: 'Ufficio', highlight: 'da 180€', subtitle: 'Trasloco postazioni e arredi' },
  ],
  antennisti: [
    { id: 'o1', title: 'Puntamento', highlight: '49€', subtitle: 'Segnale TV ottimizzato' },
    { id: 'o2', title: 'Nuova antenna', highlight: 'da 89€', subtitle: 'Installazione inclusa' },
    { id: 'o3', title: 'Primo intervento', highlight: '-12%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Sat + TV', highlight: '-10%', subtitle: 'Antenna e parabola insieme' },
    { id: 'o5', title: 'Weekend', highlight: '-8%', subtitle: 'Interventi sabato mattina' },
  ],
  'montaggio-mobili': [
    { id: 'o1', title: 'Ore pacchetto', highlight: '5h', subtitle: 'Prezzo bloccato' },
    { id: 'o2', title: 'Montaggio IKEA', highlight: 'da 35€', subtitle: 'Mobili e complementi' },
    { id: 'o3', title: 'Primo intervento', highlight: '-15%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Doppio lavoro', highlight: '-10%', subtitle: 'Due piccoli interventi' },
    { id: 'o5', title: 'Fissaggio TV', highlight: '29€', subtitle: 'Staffa e collaudo inclusi' },
  ],
  'tende-da-sole': [
    { id: 'o1', title: 'Balcone', highlight: 'da 79€', subtitle: 'Installazione tenda fino a 3 mq' },
    { id: 'o2', title: 'Nuovo telo', highlight: '-12%', subtitle: 'Sostituzione con materiali base' },
    { id: 'o3', title: 'Prima installazione', highlight: '-10%', subtitle: 'Nuovi clienti Fidati' },
    { id: 'o4', title: 'Primavera', highlight: '-15%', subtitle: 'Interventi marzo–maggio' },
    { id: 'o5', title: 'Motorizzazione', highlight: 'da 99€', subtitle: 'Upgrade tenda esistente' },
  ],
};
