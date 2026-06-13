/**
 * Generates supabase/seed.sql from fidati-app mock constants.
 * Run: node supabase/scripts/generate-seed.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { OFFICIAL_CATEGORIES, CAT } from './category-catalog.mjs';
import { buildCategoryUpsertSql } from './category-migration-sql.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'seed.sql');

const PRO_IMAGES = {
  '1': { avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop' },
  '2': { avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop' },
  '3': { avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop' },
  '4': { avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop' },
  '5': { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop' },
  '6': { avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1527515637462-cff94eecc458?w=800&h=600&fit=crop' },
  '7': { avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop' },
  '8': { avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop' },
  '9': { avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop' },
  '10': { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop' },
  '11': { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop' },
  '12': { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop' },
  '13': { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop' },
  '14': { avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop' },
  '15': { avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face', hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop' },
};

const GALLERY_EXTRA = {
  pulizie: ['https://images.unsplash.com/photo-1527515637462-cff94eecc458?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1563453392213-326a5d1dd51b?w=900&h=600&fit=crop'],
  idraulici: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=900&h=600&fit=crop'],
  elettricisti: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop'],
  giardinieri: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=900&h=600&fit=crop'],
  fabbri: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop'],
  imbianchini: ['https://images.unsplash.com/photo-1562259949-e8e7689d4713?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=600&fit=crop'],
  serramentisti: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop'],
  'tecnici-caldaie-condizionatori': ['https://images.unsplash.com/photo-1585771724944-230ac3de9884?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop'],
  'traslochi-sgomberi': ['https://images.unsplash.com/photo-1600518468881-ce588ea7c948?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop'],
  antennisti: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&h=600&fit=crop'],
  'montaggio-mobili': ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&h=600&fit=crop'],
  'tende-da-sole': ['https://images.unsplash.com/photo-1598928636138-d97944675141?w=900&h=600&fit=crop', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&h=600&fit=crop'],
};

const ZONES_BY_CAT = {
  pulizie: ['Centro', 'Isola', 'Porta Nuova', 'Navigli', 'Brera'],
  idraulici: ['Lambrate', 'Porta Romana', 'Loreto', 'Bicocca', 'Centro'],
  elettricisti: ['Centro', 'Porta Nuova', 'Isola', 'San Siro', 'Navigli'],
  giardinieri: ['Porta Romana', 'Navigli', 'San Siro', 'Brera', 'Lambrate'],
  fabbri: ['Centro', 'Lambrate', 'Isola', 'Porta Nuova', 'Bicocca'],
  imbianchini: ['Centro', 'Brera', 'Navigli', 'Porta Romana', 'Isola'],
  serramentisti: ['Centro', 'Porta Nuova', 'Lambrate', 'Bicocca', 'Navigli'],
  'tecnici-caldaie-condizionatori': ['Centro', 'Lambrate', 'Porta Romana', 'Loreto', 'Bicocca'],
  'traslochi-sgomberi': ['Centro', 'Lambrate', 'Isola', 'Porta Nuova', 'Bicocca'],
  antennisti: ['Centro', 'Porta Nuova', 'Lambrate', 'Isola', 'Navigli'],
  'montaggio-mobili': ['Centro', 'Lambrate', 'Isola', 'Porta Nuova', 'Bicocca'],
  'tende-da-sole': ['Porta Romana', 'Navigli', 'Brera', 'Centro', 'Isola'],
};

const WEEKLY_BOOKINGS = {
  'pul-deep': 1240, 'pul-office': 680, 'pul-post': 420, 'pul-glass': 890, 'pul-sani': 310,
  'idr-leak': 920, 'idr-tap': 640, 'idr-boiler': 380, 'idr-drain': 710, 'idr-install': 290,
  'ele-point': 760, 'ele-panel': 580, 'ele-led': 580, 'ele-smart': 210, 'ele-cert': 340, 'ele-urgent': 890,
  'gia-prune': 450, 'gia-maint': 620, 'gia-grass': 780, 'gia-terra': 390, 'gia-irr': 180,
  'mob-furniture': 1120, 'mob-small': 800,
  'fab-lock': 360, 'fab-iron': 180,
  'imb-paint': 420, 'imb-ext': 200,
  'ser-window': 290, 'ser-door': 360,
  'tcl-boiler': 380, 'tcl-ac': 520,
  'tra-move': 430, 'tra-clear': 310,
  'ant-tv': 250, 'ant-sat': 180,
  'ten-install': 200, 'ten-maint': 150,
};

const PROFESSIONAL_SERVICES = {
  pulizie: [
    { id: 'pul-deep', title: 'Pulizia profonda casa', icon: 'home-outline', description: 'Pavimenti, bagno, cucina e superfici', fromPrice: 45, packages: [
      { id: 'pul-deep-b', tier: 'base', title: 'Monolocale', description: 'Fino a 45 mq, 2 ore', price: 45, duration: '2 ore' },
      { id: 'pul-deep-s', tier: 'standard', title: 'Bilocale', description: 'Fino a 75 mq, dettagli e vetri', price: 75, duration: '3 ore' },
      { id: 'pul-deep-p', tier: 'premium', title: 'Trilocale+', description: 'Fino a 110 mq, pulizia completa', price: 110, duration: '5 ore' },
    ]},
    { id: 'pul-office', title: 'Pulizie ufficio', icon: 'business-outline', description: 'Open space, sale riunioni e reception', fromPrice: 60, packages: [
      { id: 'pul-office-b', tier: 'base', title: 'Piccolo ufficio', description: 'Fino a 60 mq', price: 60, duration: '2 ore' },
      { id: 'pul-office-s', tier: 'standard', title: 'Medio ufficio', description: 'Fino a 120 mq', price: 95, duration: '4 ore' },
    ]},
    { id: 'pul-post', title: 'Post-ristrutturazione', icon: 'construct-outline', description: 'Sgombero polvere, vetri e finiture', fromPrice: 90, packages: [
      { id: 'pul-post-b', tier: 'base', title: 'Standard', description: 'Appartamento fino a 70 mq', price: 90, duration: '4 ore' },
      { id: 'pul-post-p', tier: 'premium', title: 'Completo', description: 'Con sanificazione inclusa', price: 140, duration: '6 ore' },
    ]},
    { id: 'pul-glass', title: 'Lavaggio vetri', icon: 'sparkles-outline', description: 'Interni, esterni e infissi', fromPrice: 35, packages: [
      { id: 'pul-glass-b', tier: 'base', title: 'Fino a 8 vetri', description: 'Interni e telaio', price: 35, duration: '1.5 ore' },
      { id: 'pul-glass-s', tier: 'standard', title: 'Appartamento', description: 'Tutti i vetri casa', price: 55, duration: '2.5 ore' },
    ]},
    { id: 'pul-sani', title: 'Sanificazione', icon: 'shield-checkmark-outline', description: 'Trattamento antibatterico certificato', fromPrice: 55, packages: [
      { id: 'pul-sani-b', tier: 'base', title: 'Singola zona', description: 'Cucina o bagno', price: 55, duration: '1.5 ore' },
      { id: 'pul-sani-p', tier: 'premium', title: 'Intera casa', description: 'Sanificazione completa', price: 95, duration: '3 ore' },
    ]},
  ],
  idraulici: [
    { id: 'idr-leak', title: 'Perdite e tubature', icon: 'water-outline', description: 'Ricerca perdita e riparazione', fromPrice: 40, packages: [
      { id: 'idr-leak-b', tier: 'base', title: 'Riparazione semplice', description: 'Guarnizioni e rubinetti', price: 40, duration: '1 ora' },
      { id: 'idr-leak-s', tier: 'standard', title: 'Perdita occulta', description: 'Diagnosi + intervento', price: 85, duration: '2 ore' },
    ]},
    { id: 'idr-tap', title: 'Rubinetteria', icon: 'funnel-outline', description: 'Sostituzione e installazione', fromPrice: 50, packages: [
      { id: 'idr-tap-b', tier: 'base', title: 'Singolo rubinetto', description: 'Sostituzione e collaudo', price: 50, duration: '1 ora' },
      { id: 'idr-tap-s', tier: 'standard', title: 'Bagno completo', description: 'Lavabo, bidet e doccia', price: 120, duration: '3 ore' },
    ]},
    { id: 'idr-boiler', title: 'Caldaia e boiler', icon: 'flame-outline', description: 'Manutenzione e assistenza', fromPrice: 70, packages: [
      { id: 'idr-boiler-b', tier: 'base', title: 'Controllo annuale', description: 'Pulizia e verifica', price: 70, duration: '1.5 ore' },
      { id: 'idr-boiler-p', tier: 'premium', title: 'Manutenzione full', description: 'Ricambi base inclusi', price: 130, duration: '3 ore' },
    ]},
    { id: 'idr-drain', title: 'Scarichi otturati', icon: 'alert-circle-outline', description: 'Lavandini, docce e WC', fromPrice: 45, packages: [
      { id: 'idr-drain-b', tier: 'base', title: 'Singolo scarico', description: 'Spurgo manuale', price: 45, duration: '1 ora' },
      { id: 'idr-drain-s', tier: 'standard', title: 'Impianto bagno', description: 'Controllo completo', price: 75, duration: '2 ore' },
    ]},
    { id: 'idr-install', title: 'Installazioni', icon: 'build-outline', description: 'Lavatrice, lavastoviglie, sanitari', fromPrice: 65, packages: [
      { id: 'idr-install-b', tier: 'base', title: 'Elettrodomestico', description: 'Allaccio e collaudo', price: 65, duration: '1.5 ore' },
      { id: 'idr-install-p', tier: 'premium', title: 'Bagno nuovo', description: 'Sanitari e miscelatori', price: 180, duration: '4 ore' },
    ]},
  ],
  elettricisti: [
    { id: 'ele-point', title: 'Punto luce e prese', icon: 'flash-outline', description: 'Installazione e spostamento', fromPrice: 45, packages: [
      { id: 'ele-point-b', tier: 'base', title: 'Singolo punto', description: 'Luce o presa nuova', price: 45, duration: '1 ora' },
      { id: 'ele-point-s', tier: 'standard', title: 'Stanza intera', description: 'Fino a 4 punti', price: 120, duration: '3 ore' },
    ]},
    { id: 'ele-panel', title: 'Quadro elettrico', icon: 'apps-outline', description: 'Verifica, upgrade e messa a norma', fromPrice: 90, packages: [
      { id: 'ele-panel-b', tier: 'base', title: 'Controllo', description: 'Diagnosi e report', price: 90, duration: '2 ore' },
      { id: 'ele-panel-p', tier: 'premium', title: 'Adeguamento', description: 'Differenziale e magnetotermico', price: 220, duration: '5 ore' },
    ]},
    { id: 'ele-led', title: 'Illuminazione LED', icon: 'bulb-outline', description: 'Faretti, strip e sostituzioni', fromPrice: 55, packages: [
      { id: 'ele-led-b', tier: 'base', title: 'Fino a 6 punti', description: 'Sostituzione lampade', price: 55, duration: '1.5 ore' },
      { id: 'ele-led-s', tier: 'standard', title: 'Impianto zona', description: 'Cucina o soggiorno', price: 140, duration: '4 ore' },
    ]},
    { id: 'ele-smart', title: 'Domotica', icon: 'wifi-outline', description: 'Smart switch, tapparelle e sensori', fromPrice: 120, packages: [
      { id: 'ele-smart-b', tier: 'base', title: 'Starter kit', description: '3 dispositivi smart', price: 120, duration: '2 ore' },
      { id: 'ele-smart-p', tier: 'premium', title: 'Casa smart', description: 'Configurazione completa', price: 280, duration: '6 ore' },
    ]},
    { id: 'ele-cert', title: 'Certificazione impianto', icon: 'document-text-outline', description: 'DiCo e conformità DM 37/08', fromPrice: 110, packages: [
      { id: 'ele-cert-b', tier: 'base', title: 'Verifica', description: 'Sopralluogo e preventivo', price: 110, duration: '2 ore' },
      { id: 'ele-cert-p', tier: 'premium', title: 'Con dichiarazione', description: 'Rilascio documenti', price: 190, duration: '4 ore' },
    ]},
    { id: 'ele-urgent', title: 'Guasto urgente', icon: 'warning-outline', description: 'Blackout, corto circuito, salvavita', fromPrice: 60, packages: [
      { id: 'ele-urgent-b', tier: 'base', title: 'Intervento rapido', description: 'Entro 2 ore', price: 60, duration: '1 ora' },
      { id: 'ele-urgent-s', tier: 'standard', title: 'Diagnosi + riparo', description: 'In giornata', price: 95, duration: '2 ore' },
    ]},
  ],
  giardinieri: [
    { id: 'gia-prune', title: 'Potatura alberi', icon: 'leaf-outline', description: 'Siepi, alberi da frutto e ornamentali', fromPrice: 55, packages: [
      { id: 'gia-prune-b', tier: 'base', title: 'Siepe', description: 'Fino a 10 metri lineari', price: 55, duration: '2 ore' },
      { id: 'gia-prune-s', tier: 'standard', title: 'Albero medio', description: 'Potatura e smaltimento', price: 90, duration: '3 ore' },
    ]},
    { id: 'gia-maint', title: 'Manutenzione giardino', icon: 'flower-outline', description: 'Cura stagionale completa', fromPrice: 50, packages: [
      { id: 'gia-maint-b', tier: 'base', title: 'Fino a 100 mq', description: 'Sfalcio e pulizia', price: 50, duration: '2 ore' },
      { id: 'gia-maint-p', tier: 'premium', title: 'Fino a 250 mq', description: 'Manutenzione profonda', price: 95, duration: '4 ore' },
    ]},
    { id: 'gia-grass', title: 'Erba e siepi', icon: 'cut-outline', description: 'Taglio prato e rifiniture', fromPrice: 35, packages: [
      { id: 'gia-grass-b', tier: 'base', title: 'Prato piccolo', description: 'Fino a 80 mq', price: 35, duration: '1.5 ore' },
      { id: 'gia-grass-s', tier: 'standard', title: 'Prato + siepi', description: 'Giardino medio', price: 65, duration: '3 ore' },
    ]},
    { id: 'gia-terra', title: 'Terrazzi e balconi', icon: 'sunny-outline', description: 'Vasi, piante e pulizia verde', fromPrice: 40, packages: [
      { id: 'gia-terra-b', tier: 'base', title: 'Balcone', description: 'Fino a 15 mq', price: 40, duration: '1.5 ore' },
      { id: 'gia-terra-s', tier: 'standard', title: 'Terrazzo grande', description: 'Con irrigazione', price: 70, duration: '2.5 ore' },
    ]},
    { id: 'gia-irr', title: 'Irrigazione', icon: 'rainy-outline', description: 'Installazione e programmazione', fromPrice: 80, packages: [
      { id: 'gia-irr-b', tier: 'base', title: 'Controllo impianto', description: 'Taratura e test', price: 80, duration: '2 ore' },
      { id: 'gia-irr-p', tier: 'premium', title: 'Nuovo impianto', description: 'Fino a 200 mq', price: 220, duration: '6 ore' },
    ]},
  ],
  'montaggio-mobili': [
    { id: 'mob-furniture', title: 'Montaggio mobili', icon: 'cube-outline', description: 'IKEA, cucine e armadi', fromPrice: 35, packages: [
      { id: 'mob-furniture-b', tier: 'base', title: 'Singolo mobile', description: 'Comò, libreria, scrivania', price: 35, duration: '1.5 ore' },
      { id: 'mob-furniture-s', tier: 'standard', title: 'Camera completa', description: 'Fino a 4 mobili', price: 75, duration: '3 ore' },
    ]},
    { id: 'mob-small', title: 'Fissaggi e mensole', icon: 'construct-outline', description: 'Appendere quadri, mensole, TV', fromPrice: 30, packages: [
      { id: 'mob-small-b', tier: 'base', title: '1 ora lavoro', description: 'Lista interventi brevi', price: 30, duration: '1 ora' },
      { id: 'mob-small-s', tier: 'standard', title: '2 ore lavoro', description: 'Più attività insieme', price: 55, duration: '2 ore' },
    ]},
  ],
  fabbri: [
    { id: 'fab-lock', title: 'Aperture e serrature', icon: 'key-outline', description: 'Porte bloccate e sostituzione serrature', fromPrice: 50, packages: [
      { id: 'fab-lock-b', tier: 'base', title: 'Apertura porta', description: 'Intervento urgente', price: 50, duration: '1 ora' },
      { id: 'fab-lock-s', tier: 'standard', title: 'Sostituzione serratura', description: 'Con collaudo', price: 90, duration: '2 ore' },
    ]},
    { id: 'fab-iron', title: 'Lavori in ferro', icon: 'hammer-outline', description: 'Ringhiere, cancelli e strutture', fromPrice: 80, packages: [
      { id: 'fab-iron-b', tier: 'base', title: 'Riparazione', description: 'Singolo elemento', price: 80, duration: '2 ore' },
      { id: 'fab-iron-p', tier: 'premium', title: 'Realizzazione', description: 'Su misura', price: 180, duration: '4 ore' },
    ]},
  ],
  imbianchini: [
    { id: 'imb-paint', title: 'Tinteggiatura interni', icon: 'color-palette-outline', description: 'Pareti, soffitti e ritocchi', fromPrice: 70, packages: [
      { id: 'imb-paint-b', tier: 'base', title: 'Singola parete', description: 'Fino a 12 mq', price: 70, duration: '3 ore' },
      { id: 'imb-paint-p', tier: 'premium', title: 'Stanza intera', description: 'Fino a 15 mq', price: 150, duration: '6 ore' },
    ]},
    { id: 'imb-ext', title: 'Pittura esterni', icon: 'home-outline', description: 'Facciate e balconi', fromPrice: 120, packages: [
      { id: 'imb-ext-b', tier: 'base', title: 'Balcone', description: 'Fino a 20 mq', price: 120, duration: '4 ore' },
      { id: 'imb-ext-s', tier: 'standard', title: 'Facciata parziale', description: 'Fino a 40 mq', price: 220, duration: '8 ore' },
    ]},
  ],
  serramentisti: [
    { id: 'ser-window', title: 'Infissi e finestre', icon: 'albums-outline', description: 'Sostituzione e regolazione', fromPrice: 65, packages: [
      { id: 'ser-window-b', tier: 'base', title: 'Regolazione', description: 'Singolo infisso', price: 65, duration: '1.5 ore' },
      { id: 'ser-window-s', tier: 'standard', title: 'Sostituzione', description: 'Finestra standard', price: 180, duration: '4 ore' },
    ]},
    { id: 'ser-door', title: 'Porte e serramenti', icon: 'lock-closed-outline', description: 'Porte, maniglie e cerniere', fromPrice: 45, packages: [
      { id: 'ser-door-b', tier: 'base', title: 'Regolazione porta', description: 'Cerniere e chiudiporta', price: 45, duration: '1 ora' },
      { id: 'ser-door-s', tier: 'standard', title: 'Sostituzione serratura', description: 'Con collaudo', price: 80, duration: '2 ore' },
    ]},
  ],
  'tecnici-caldaie-condizionatori': [
    { id: 'tcl-boiler', title: 'Caldaia e riscaldamento', icon: 'flame-outline', description: 'Manutenzione e assistenza', fromPrice: 70, packages: [
      { id: 'tcl-boiler-b', tier: 'base', title: 'Controllo annuale', description: 'Pulizia e verifica', price: 70, duration: '1.5 ore' },
      { id: 'tcl-boiler-p', tier: 'premium', title: 'Manutenzione full', description: 'Ricambi base inclusi', price: 130, duration: '3 ore' },
    ]},
    { id: 'tcl-ac', title: 'Condizionatori', icon: 'snow-outline', description: 'Installazione e manutenzione', fromPrice: 80, packages: [
      { id: 'tcl-ac-b', tier: 'base', title: 'Pulizia split', description: 'Singola unità', price: 80, duration: '2 ore' },
      { id: 'tcl-ac-s', tier: 'standard', title: 'Installazione', description: 'Mono split', price: 250, duration: '4 ore' },
    ]},
  ],
  'traslochi-sgomberi': [
    { id: 'tra-move', title: 'Traslochi', icon: 'car-outline', description: 'Trasporto mobili e scatoloni', fromPrice: 120, packages: [
      { id: 'tra-move-b', tier: 'base', title: 'Monolocale', description: 'Fino a 30 mq', price: 120, duration: '4 ore' },
      { id: 'tra-move-s', tier: 'standard', title: 'Bilocale', description: 'Fino a 60 mq', price: 220, duration: '6 ore' },
    ]},
    { id: 'tra-clear', title: 'Sgomberi', icon: 'trash-outline', description: 'Svuotamento cantine e locali', fromPrice: 90, packages: [
      { id: 'tra-clear-b', tier: 'base', title: 'Piccolo locale', description: 'Fino a 15 mq', price: 90, duration: '3 ore' },
      { id: 'tra-clear-s', tier: 'standard', title: 'Cantina/garage', description: 'Fino a 30 mq', price: 160, duration: '5 ore' },
    ]},
  ],
  antennisti: [
    { id: 'ant-tv', title: 'Antenne TV', icon: 'radio-outline', description: 'Installazione e puntamento', fromPrice: 60, packages: [
      { id: 'ant-tv-b', tier: 'base', title: 'Puntamento', description: 'Segnale ottimizzato', price: 60, duration: '1.5 ore' },
      { id: 'ant-tv-s', tier: 'standard', title: 'Nuova antenna', description: 'Con installazione', price: 120, duration: '3 ore' },
    ]},
    { id: 'ant-sat', title: 'Parabole satellitari', icon: 'planet-outline', description: 'Installazione e configurazione', fromPrice: 90, packages: [
      { id: 'ant-sat-b', tier: 'base', title: 'Configurazione', description: 'Decoder e LNB', price: 90, duration: '2 ore' },
      { id: 'ant-sat-p', tier: 'premium', title: 'Installazione completa', description: 'Parabola + cavi', price: 180, duration: '4 ore' },
    ]},
  ],
  'tende-da-sole': [
    { id: 'ten-install', title: 'Installazione tende', icon: 'sunny-outline', description: 'Tende da sole e pergole', fromPrice: 85, packages: [
      { id: 'ten-install-b', tier: 'base', title: 'Balcone', description: 'Fino a 3 mq', price: 85, duration: '2 ore' },
      { id: 'ten-install-s', tier: 'standard', title: 'Terrazzo', description: 'Fino a 8 mq', price: 150, duration: '4 ore' },
    ]},
    { id: 'ten-maint', title: 'Manutenzione tende', icon: 'build-outline', description: 'Riparazione e sostituzione teli', fromPrice: 55, packages: [
      { id: 'ten-maint-b', tier: 'base', title: 'Regolazione', description: 'Meccanismo e guide', price: 55, duration: '1.5 ore' },
      { id: 'ten-maint-s', tier: 'standard', title: 'Sostituzione telo', description: 'Con materiali base', price: 110, duration: '3 ore' },
    ]},
  ],
};

const MOCK_PROFESSIONALS = [
  { id: '1', name: 'Laura Bianchi', categorySlug: 'pulizie', category: 'Pulizie', avatarColor: '#8B5CF6', rating: 4.9, reviewCount: 127, jobsCompleted: 340, pricePerHour: 25, distanceKm: 1.2, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Specializzata in pulizie domestiche e post-ristrutturazione. Uso prodotti eco-friendly e garantisco risultati impeccabili.', whyChoose: ['Prodotti eco-friendly certificati', 'Puntualità garantita al 100%', 'Assicurazione RC professionale', 'Oltre 340 lavori completati'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Pulizia standard appartamento fino a 60mq', price: 45, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Pulizia profonda con dettagli e vetri', price: 85, duration: '4 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Post-ristrutturazione completa + sanificazione', price: 120, duration: '5 ore' }], hasProApp: true, email: 'laura.bianchi@email.com', phone: '+39 333 456 7890', memberSince: 'Marzo 2023', earningsMonth: 2840, earningsWeek: 720, profileCompletion: 60, newClients: 14, responseRate: 96, profileViews: 1247 },
  { id: '2', name: 'Luca Bianchi', categorySlug: 'idraulici', category: 'Idraulico', avatarColor: '#0EA5E9', rating: 4.8, reviewCount: 95, jobsCompleted: 180, pricePerHour: 30, distanceKm: 1.2, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Idraulico con 15 anni di esperienza. Interventi rapidi per perdite, installazioni e manutenzione impianti.', whyChoose: ['Interventi rapidi e puntuali', 'Prezzi trasparenti senza sorprese', 'Materiali di qualità certificati', 'Assistenza post-intervento inclusa'], packages: [{ id: 'p1', tier: 'base', title: 'Intervento base', description: 'Diagnosi e riparazione perdite semplici', price: 40, duration: '1-2 ore' }, { id: 'p2', tier: 'standard', title: 'Intervento standard', description: 'Installazione rubinetteria e collaudo', price: 90, duration: '2-3 ore' }, { id: 'p3', tier: 'premium', title: 'Intervento premium', description: 'Manutenzione completa impianto e caldaia', price: 150, duration: '3-4 ore' }] },
  { id: '3', name: 'Anna Ferrari', categorySlug: 'elettricisti', category: 'Elettricista', avatarColor: '#F59E0B', rating: 5.0, reviewCount: 64, jobsCompleted: 180, pricePerHour: 45, distanceKm: 2.1, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Elettricista certificata. Impianti civili, illuminazione LED e domotica. Lavoro conforme alle normative.', whyChoose: ['Certificazione DM 37/08', 'Domotica e smart home', 'Garanzia 24 mesi sui lavori', 'Valutazione 5.0 stelle'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Installazione punto luce singolo', price: 55, duration: '1 ora' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Verifica e aggiornamento quadro elettrico', price: 180, duration: '4 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Configurazione domotica completa', price: 250, duration: '6 ore' }] },
  { id: '4', name: 'Paolo Russo', categorySlug: 'giardinieri', category: 'Giardiniere', avatarColor: '#10B981', rating: 4.7, reviewCount: 52, jobsCompleted: 145, pricePerHour: 30, distanceKm: 3.4, availableToday: false, verified: true, badges: { document: true, phone: true, professional: false }, bio: 'Giardiniere appassionato. Potature, manutenzione prati e progettazione spazi verdi.', whyChoose: ['Progettazione paesaggistica', 'Potatura certificata alberi', 'Manutenzione stagionale', 'Attrezzatura professionale'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Manutenzione giardino fino a 100mq', price: 70, duration: '3 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Potatura professionale alberi', price: 100, duration: '4 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Consulenza e impianto verde completo', price: 200, duration: '8 ore' }] },
  { id: '5', name: 'Luca Conti', categorySlug: 'montaggio-mobili', category: 'Montaggio mobili', avatarColor: '#6366F1', rating: 4.6, reviewCount: 98, jobsCompleted: 290, pricePerHour: 35, distanceKm: 1.8, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Specialista in montaggio mobili IKEA e cucine. Attrezzi professionali inclusi.', whyChoose: ['Disponibilità flessibile', 'Montaggio mobili IKEA e simili', 'Attrezzi professionali inclusi', '290 lavori completati'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Montaggio mobili singolo', price: 50, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Camera completa', price: 75, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Cucina completa', price: 150, duration: '6 ore' }] },
  { id: '6', name: 'Sofia Marino', categorySlug: 'pulizie', category: 'Pulizie', avatarColor: '#EC4899', rating: 4.8, reviewCount: 73, jobsCompleted: 195, pricePerHour: 22, distanceKm: 0.5, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Pulizie professionali per uffici e abitazioni. Puntualità e attenzione ai dettagli.', whyChoose: ['Specialista uffici e abitazioni', 'Prodotti ipoallergenici', 'Team di 2 persone su richiesta', 'Abbonamenti settimanali'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Pulizia ufficio fino a 80mq', price: 60, duration: '3 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Pulizia settimanale 4 sessioni', price: 160, duration: '8 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Sanificazione antibatterica completa', price: 95, duration: '3 ore' }] },
  { id: '7', name: 'Giulia Costa', categorySlug: 'pulizie', category: 'Pulizie', avatarColor: '#14B8A6', rating: 4.7, reviewCount: 89, jobsCompleted: 210, pricePerHour: 23, distanceKm: 2.3, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Esperta in pulizie profonde e sanificazione.', whyChoose: ['Prodotti ecologici', 'Flessibilità oraria'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Pulizia standard', price: 45, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Pulizia profonda', price: 75, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Sanificazione completa', price: 110, duration: '4 ore' }] },
  { id: '8', name: 'Marco De Luca', categorySlug: 'idraulici', category: 'Idraulico', avatarColor: '#0284C7', rating: 4.9, reviewCount: 112, jobsCompleted: 220, pricePerHour: 32, distanceKm: 0.9, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Specialista in perdite e installazioni bagno.', whyChoose: ['Interventi rapidi', 'Garanzia lavori'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Riparazione perdite', price: 45, duration: '1-2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Installazione sanitari', price: 95, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Rifacimento bagno', price: 180, duration: '6 ore' }] },
  { id: '9', name: 'Andrea Neri', categorySlug: 'idraulici', category: 'Idraulico', avatarColor: '#0369A1', rating: 4.6, reviewCount: 67, jobsCompleted: 150, pricePerHour: 28, distanceKm: 2.8, availableToday: false, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Manutenzione caldaie e impianti idraulici.', whyChoose: ['Certificato', 'Preventivo gratuito'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Controllo impianto', price: 50, duration: '1 ora' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Manutenzione caldaia', price: 120, duration: '2 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Sostituzione caldaia', price: 200, duration: '4 ore' }] },
  { id: '10', name: 'Roberto Galli', categorySlug: 'elettricisti', category: 'Elettricista', avatarColor: '#D97706', rating: 4.8, reviewCount: 88, jobsCompleted: 200, pricePerHour: 40, distanceKm: 1.5, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Impianti civili e industriali, illuminazione LED.', whyChoose: ['Certificato', 'Domotica'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Punto luce', price: 50, duration: '1 ora' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Quadro elettrico', price: 170, duration: '4 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Impianto completo', price: 280, duration: '8 ore' }] },
  { id: '11', name: 'Elena Vitale', categorySlug: 'elettricisti', category: 'Elettricista', avatarColor: '#F59E0B', rating: 4.7, reviewCount: 54, jobsCompleted: 130, pricePerHour: 42, distanceKm: 3.1, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Smart home e automazione domestica.', whyChoose: ['Esperta domotica', 'Puntualità'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Configurazione smart', price: 60, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Illuminazione LED', price: 140, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Sistema domotico', price: 320, duration: '8 ore' }] },
  { id: '12', name: 'Francesco Verde', categorySlug: 'giardinieri', category: 'Giardiniere', avatarColor: '#059669', rating: 4.8, reviewCount: 76, jobsCompleted: 190, pricePerHour: 28, distanceKm: 2.0, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Potature e manutenzione giardini residenziali.', whyChoose: ['Attrezzatura propria', 'Sopralluogo gratuito'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Taglio erba', price: 55, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Potatura siepi', price: 85, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Rifacimento giardino', price: 220, duration: '8 ore' }] },
  { id: '13', name: 'Chiara Bosco', categorySlug: 'giardinieri', category: 'Giardiniere', avatarColor: '#22C55E', rating: 4.9, reviewCount: 61, jobsCompleted: 165, pricePerHour: 32, distanceKm: 4.2, availableToday: false, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Progettazione e cura del verde ornamentale.', whyChoose: ['Design paesaggistico', 'Piante certificate'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Manutenzione mensile', price: 65, duration: '3 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Potatura alberi', price: 110, duration: '4 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Nuovo impianto verde', price: 250, duration: '10 ore' }] },
  { id: '14', name: 'Davide Moretti', categorySlug: 'montaggio-mobili', category: 'Montaggio mobili', avatarColor: '#64748B', rating: 4.7, reviewCount: 102, jobsCompleted: 260, pricePerHour: 32, distanceKm: 1.1, availableToday: true, verified: true, badges: { document: true, phone: true, professional: true }, bio: 'Montaggi mobili e fissaggi per casa e ufficio.', whyChoose: ['Multicompetente', 'Disponibile weekend'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Montaggio mobili', price: 45, duration: '2 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Camera completa', price: 75, duration: '3 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Cucina IKEA', price: 140, duration: '6 ore' }] },
  { id: '15', name: 'Simone Riva', categorySlug: 'imbianchini', category: 'Imbianchini', avatarColor: '#475569', rating: 4.5, reviewCount: 78, jobsCompleted: 175, pricePerHour: 30, distanceKm: 2.6, availableToday: true, verified: false, badges: { document: true, phone: true, professional: false }, bio: 'Imbianchino per interni ed esterni, tinteggiatura e ritocchi.', whyChoose: ['Prezzi chiari', 'Lavoro pulito'], packages: [{ id: 'p1', tier: 'base', title: 'Base', description: 'Singola parete', price: 70, duration: '3 ore' }, { id: 'p2', tier: 'standard', title: 'Standard', description: 'Stanza intera', price: 150, duration: '6 ore' }, { id: 'p3', tier: 'premium', title: 'Premium', description: 'Appartamento', price: 280, duration: '10 ore' }] },
];

const URGENT = { '1': 'Oggi', '2': 'Entro 1 ora', '3': 'Oggi', '5': 'Entro 2 ore' };
const NEW_FEATURED = new Set(['6', '3', '1', '2']);

const SAMPLE_REVIEWS = [
  { text: 'Servizio eccellente, molto professionale.', rating: 5 },
  { text: 'Puntuale e preciso, consigliatissimo.', rating: 5 },
  { text: 'Ottimo rapporto qualità-prezzo.', rating: 4 },
  { text: 'Lavoro accurato e area lasciata pulita.', rating: 5 },
  { text: 'Disponibile e competente.', rating: 4 },
];

const HOME_REVIEWS = [
  { id: 'r1', clientName: 'Giulia M.', rating: 5, text: 'Precisa, puntuale e professionale.', service: 'Pulizie domestiche', proId: '1' },
  { id: 'r2', clientName: 'Marco T.', rating: 5, text: "Intervento rapido, problema risolto in un'ora.", service: 'Idraulico', proId: '2' },
  { id: 'r3', clientName: 'Elena R.', rating: 5, text: 'Giardino impeccabile, consigli utili sulla manutenzione.', service: 'Giardinaggio', proId: '12' },
  { id: 'r4', clientName: 'Andrea P.', rating: 5, text: 'Montaggio perfetto e area lasciata pulita.', service: 'Montaggio mobili', proId: '5' },
];

/** Namespace UUID (solo cifre esadecimali 0-9, a-f — PostgreSQL non accetta g-z) */
const NS = {
  category: 'c1000001-0001-4000-8000-',
  service: 'd1000001-0001-4000-8000-',
  servicePkg: 'e1000001-0001-4000-8000-',
  customer: 'a1000001-0001-4000-8000-',
  professional: 'b1000001-0001-4000-8000-',
  proService: 'f1000001-0001-4000-8000-',
  proServicePkg: 'ab000001-0001-4000-8000-',
  portfolio: 'ac000001-0001-4000-8000-',
  conversation: 'ad000001-0001-4000-8000-',
  message: 'ae000001-0001-4000-8000-',
  bookingRequest: 'af000001-0001-4000-8000-',
  booking: 'b0000001-0001-4000-8000-',
  review: 'b9000001-0001-4000-8000-',
  payment: 'b2000001-0001-4000-8000-',
  refund: 'b3000001-0001-4000-8000-',
  supportTicket: 'b4000001-0001-4000-8000-',
  report: 'b5000001-0001-4000-8000-',
  homePopular: 'ba000002-0001-4000-8000-',
  homeOffer: 'b6000001-0001-4000-8000-',
  homeTile: 'b7000001-0001-4000-8000-',
  notification: 'b8000001-0001-4000-8000-',
};

function uuid(ns, n) {
  const id = `${ns}${String(n).padStart(12, '0')}`;
  assertValidUuid(id);
  return id;
}

function assertValidUuid(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`UUID non valido (solo esadecimale 0-9, a-f): ${id}`);
  }
}

function proUuid(id) {
  return uuid(NS.professional, id);
}

function custUuid(idx) {
  return uuid(NS.customer, idx);
}

/** Un solo Marco Rossi: legacy user-1 (fidati-app) e c1 (fidati-pro) → stesso UUID */
const CUSTOMERS = [
  {
    idx: 1,
    legacy_id: 'user-1',
    name: 'Marco Rossi',
    email: 'marco.rossi@email.com',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    avatar_color: '#3B82F6',
    member_since: 'Gennaio 2024',
    bookings_count: 12,
    completed_count: 8,
    rating: 4.9,
  },
  { idx: 2, legacy_id: 'c2', name: 'Giulia Verdi', email: 'giulia.verdi@email.com', image_url: null, avatar_color: '#8B5CF6', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 3, legacy_id: 'c3', name: 'Paolo Neri', email: null, image_url: null, avatar_color: '#0EA5E9', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 4, legacy_id: 'c4', name: 'Elena Costa', email: null, image_url: null, avatar_color: '#EC4899', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 5, legacy_id: 'c5', name: 'Sara Blu', email: null, image_url: null, avatar_color: '#14B8A6', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 6, legacy_id: 'c6', name: 'Luca Gialli', email: null, image_url: null, avatar_color: '#F59E0B', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 7, legacy_id: 'c7', name: 'Anna Ferrari', email: null, image_url: null, avatar_color: '#6366F1', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
  { idx: 8, legacy_id: 'c8', name: 'Roberto M.', email: null, image_url: null, avatar_color: '#64748B', member_since: null, bookings_count: 0, completed_count: 0, rating: null },
];

const CUSTOMER_LEGACY_TO_IDX = { 'user-1': 1, c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7, c8: 8 };

function customerId(legacyOrIdx) {
  if (typeof legacyOrIdx === 'number') return custUuid(legacyOrIdx);
  const idx = CUSTOMER_LEGACY_TO_IDX[legacyOrIdx];
  return custUuid(idx ?? 1);
}

function esc(s) {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

function jsonArr(arr) {
  return `'${JSON.stringify(arr).replace(/'/g, "''")}'::jsonb`;
}

// Build service UUID map
const serviceUuidMap = {};
let svcIdx = 1;
for (const slug of Object.keys(PROFESSIONAL_SERVICES)) {
  for (const svc of PROFESSIONAL_SERVICES[slug]) {
    serviceUuidMap[svc.id] = uuid(NS.service, svcIdx++);
  }
}

const pkgUuidMap = {};
let pkgIdx = 1;
for (const slug of Object.keys(PROFESSIONAL_SERVICES)) {
  for (const svc of PROFESSIONAL_SERVICES[slug]) {
    for (const pkg of svc.packages) {
      pkgUuidMap[pkg.id] = uuid(NS.servicePkg, pkgIdx++);
    }
  }
}

let lines = [];
lines.push(`-- =============================================================================
-- Fidati — Seed data from fidati-app & fidati-pro mocks (generated)
-- Run AFTER schema.sql. Idempotent: safe to re-run (ON CONFLICT).
-- Marco Rossi: legacy user-1 + mock c1 → un solo customer a100...001
-- =============================================================================
`);

lines.push(buildCategoryUpsertSql());
lines.push('\n');

// Services catalog
const svcRows = [];
let sort = 1;
for (const slug of Object.keys(PROFESSIONAL_SERVICES)) {
  let catSort = 1;
  for (const svc of PROFESSIONAL_SERVICES[slug]) {
    const sid = serviceUuidMap[svc.id];
    const wb = WEEKLY_BOOKINGS[svc.id] ?? 0;
    svcRows.push(`  ('${sid}', '${svc.id}', '${CAT[slug]}', ${esc(svc.title)}, ${esc(svc.icon)}, ${esc(svc.description)}, ${svc.fromPrice}, ${wb}, NULL, ${catSort++})`);
    sort++;
  }
}
lines.push(`INSERT INTO services (id, legacy_id, category_id, title, icon, description, from_price, weekly_bookings, image_url, sort_order) VALUES\n${svcRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Service packages
const spRows = [];
for (const slug of Object.keys(PROFESSIONAL_SERVICES)) {
  let pkgSort = 1;
  for (const svc of PROFESSIONAL_SERVICES[slug]) {
    for (const pkg of svc.packages) {
      spRows.push(`  ('${pkgUuidMap[pkg.id]}', '${pkg.id}', '${serviceUuidMap[svc.id]}', '${pkg.tier}', ${esc(pkg.title)}, ${esc(pkg.description)}, ${pkg.price}, ${esc(pkg.duration)}, ${pkgSort++})`);
    }
  }
}
lines.push(`INSERT INTO service_packages (id, legacy_id, service_id, tier, title, description, price, duration_label, sort_order) VALUES\n${spRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Customers — Marco Rossi unico (user-1 + c1 mock → stesso record)
const custRows = CUSTOMERS.map((c) => {
  const email = c.email ? esc(c.email) : 'NULL';
  const img = c.image_url ? esc(c.image_url) : 'NULL';
  const memberSince = c.member_since ? esc(c.member_since) : 'NULL';
  const rating = c.rating != null ? c.rating : 'NULL';
  return `  ('${custUuid(c.idx)}', '${c.legacy_id}', ${esc(c.name)}, ${email}, NULL, ${img}, ${esc(c.avatar_color)}, ${memberSince}, ${c.bookings_count}, ${c.completed_count}, ${rating})`;
});
lines.push(`INSERT INTO customers (id, legacy_id, name, email, phone, image_url, avatar_color, member_since, bookings_count, completed_count, rating) VALUES
${custRows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  legacy_id = EXCLUDED.legacy_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  image_url = EXCLUDED.image_url,
  avatar_color = EXCLUDED.avatar_color,
  member_since = EXCLUDED.member_since,
  bookings_count = EXCLUDED.bookings_count,
  completed_count = EXCLUDED.completed_count,
  rating = EXCLUDED.rating;
`);

// Professionals
const proRows = MOCK_PROFESSIONALS.map((p) => {
  const img = PRO_IMAGES[p.id];
  const pid = proUuid(p.id);
  const urgent = URGENT[p.id] ? esc(URGENT[p.id]) : 'NULL';
  const isNew = NEW_FEATURED.has(p.id);
  const hasPro = p.hasProApp ? 'true' : 'false';
  const email = p.email ? esc(p.email) : 'NULL';
  const phone = p.phone ? esc(p.phone) : 'NULL';
  const memberSince = p.memberSince ? esc(p.memberSince) : 'NULL';
  const earningsM = p.earningsMonth ?? 0;
  const earningsW = p.earningsWeek ?? 0;
  const profileC = p.profileCompletion ?? 0;
  const newClients = p.newClients ?? 0;
  const responseR = p.responseRate ?? 100;
  const profileV = p.profileViews ?? 0;
  const rating = p.id === '1' ? 4.92 : p.rating;
  const reviewCount = p.id === '1' ? 128 : p.reviewCount;
  const jobs = p.id === '1' ? 342 : p.jobsCompleted;
  return `  ('${pid}', '${p.id}', '${CAT[p.categorySlug]}', ${esc(p.name)}, ${esc(p.category)}, ${email}, ${phone},
   ${esc(img.avatar)}, ${esc(img.hero)}, ${esc(p.avatarColor)},
   ${esc(p.bio)}, ${jsonArr(p.whyChoose)},
   ${rating}, ${reviewCount}, ${jobs}, ${p.pricePerHour}, ${p.distanceKm}, ${p.availableToday}, ${p.verified},
   ${p.badges.document}, ${p.badges.phone}, ${p.badges.professional},
   ${memberSince}, ${earningsM}, ${earningsW}, ${profileC}, ${newClients}, ${responseR}, 'verified', ${profileV}, ${hasPro}, ${urgent}, ${isNew})`;
});

lines.push(`INSERT INTO professionals (
  id, legacy_id, category_id, name, category_label, email, phone,
  image_url, hero_image_url, avatar_color, bio, why_choose,
  rating, review_count, jobs_completed, price_per_hour, distance_km,
  available_today, verified, badge_document, badge_phone, badge_professional,
  member_since, earnings_this_month, earnings_this_week, profile_completion,
  new_clients_this_month, response_rate, account_status, profile_views, has_pro_app,
  urgent_badge, is_new_featured
) VALUES\n${proRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Zones per pro
const zoneRows = [];
for (const p of MOCK_PROFESSIONALS) {
  const zones = ZONES_BY_CAT[p.categorySlug];
  const pid = proUuid(p.id);
  const count = p.id === '1' ? 5 : 3;
  zones.slice(0, count).forEach((z, i) => {
    zoneRows.push(`  ('${pid}', ${esc(z)}, ${i + 1})`);
  });
}
lines.push(`INSERT INTO professional_zones (professional_id, zone_name, sort_order) VALUES\n${zoneRows.join(',\n')}\nON CONFLICT (professional_id, zone_name) DO NOTHING;\n`);

// Professional services (link to catalog)
const psRows = [];
let psIdx = 1;
for (const p of MOCK_PROFESSIONALS) {
  const catServices = PROFESSIONAL_SERVICES[p.categorySlug];
  const pid = proUuid(p.id);
  catServices.forEach((svc, i) => {
    const psid = uuid(NS.proService, psIdx++);
    const minPkg = svc.packages.reduce((m, pk) => Math.min(m, pk.price), Infinity);
    psRows.push(`  ('${psid}', '${p.id}-${svc.id}', '${pid}', '${serviceUuidMap[svc.id]}', ${esc(svc.title)}, ${minPkg}, ${esc(svc.packages[0].duration)}, ${i + 1})`);
  });
}
lines.push(`INSERT INTO professional_services (id, legacy_id, professional_id, catalog_service_id, title, price_from, duration_label, sort_order) VALUES\n${psRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Professional service packages from mock packages
const pspRows = [];
let pspIdx = 1;
for (const p of MOCK_PROFESSIONALS) {
  const pid = proUuid(p.id);
  p.packages.forEach((pkg, i) => {
    const pspid = uuid(NS.proServicePkg, pspIdx++);
    pspRows.push(`  ('${pspid}', '${p.id}-${pkg.id}', '${pid}', NULL, '${pkg.tier}', ${esc(pkg.title)}, ${esc(pkg.description)}, ${pkg.price}, ${esc(pkg.duration)}, ${i + 1})`);
  });
}
lines.push(`INSERT INTO professional_service_packages (id, legacy_id, professional_id, professional_service_id, tier, title, description, price, duration_label, sort_order) VALUES\n${pspRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Portfolio
const portRows = [];
let portIdx = 1;
for (const p of MOCK_PROFESSIONALS) {
  const pid = proUuid(p.id);
  const img = PRO_IMAGES[p.id];
  const extras = GALLERY_EXTRA[p.categorySlug];
  portRows.push(`  ('${uuid(NS.portfolio, portIdx++)}', '${p.id}-pf1', '${pid}', ${esc(`Lavoro ${p.category}`)}, ${esc(ZONES_BY_CAT[p.categorySlug][0])}, ${esc(p.category)}, ${esc(img.hero)}, NULL, NULL, 1)`);
  if (extras[0]) {
    portRows.push(`  ('${uuid(NS.portfolio, portIdx++)}', '${p.id}-pf2', '${pid}', ${esc('Dettaglio intervento')}, ${esc(ZONES_BY_CAT[p.categorySlug][1] ?? 'Milano')}, ${esc(p.category)}, ${esc(extras[0])}, NULL, NULL, 2)`);
  }
  if (p.id === '1') {
    portRows.push(`  ('${uuid(NS.portfolio, 1)}', 'p1', '${pid}', 'Cucina post-ristrutturazione', 'Centro · 85 mq', 'Post-cantiere',
   'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
   'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
   'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', 3)`);
  }
}
lines.push(`INSERT INTO professional_portfolio (id, legacy_id, professional_id, title, subtitle, category, cover_image, before_image, after_image, sort_order) VALUES\n${portRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Laura availability (fidati-pro)
lines.push(`INSERT INTO professional_availability (professional_id, day_of_week, short_label, day_label, time_ranges, status) VALUES
  ('${proUuid('1')}', 1, 'Lun', 'Lunedì', ARRAY['08:00–19:00'], 'partial'),
  ('${proUuid('1')}', 2, 'Mar', 'Martedì', ARRAY['08:00–19:00'], 'partial'),
  ('${proUuid('1')}', 3, 'Mer', 'Mercoledì', ARRAY['08:00–19:00'], 'partial'),
  ('${proUuid('1')}', 4, 'Gio', 'Giovedì', ARRAY['08:00–19:00'], 'full'),
  ('${proUuid('1')}', 5, 'Ven', 'Venerdì', ARRAY['08:00–19:00'], 'free'),
  ('${proUuid('1')}', 6, 'Sab', 'Sabato', ARRAY['09:00–14:00'], 'partial'),
  ('${proUuid('1')}', 0, 'Dom', 'Domenica', ARRAY[]::text[], 'off')
ON CONFLICT (professional_id, day_of_week) DO NOTHING;

INSERT INTO professional_availability_days (professional_id, date_key, availability, appointment_count) VALUES
  ('${proUuid('1')}', '2026-06-09', 'partial', 2),
  ('${proUuid('1')}', '2026-06-10', 'partial', 1),
  ('${proUuid('1')}', '2026-06-12', 'full', 1),
  ('${proUuid('1')}', '2026-06-15', 'off', 0)
ON CONFLICT (professional_id, date_key) DO NOTHING;

INSERT INTO professional_profile_steps (professional_id, step, completed_at) VALUES
  ('${proUuid('1')}', 'photo', now() - interval '30 days'),
  ('${proUuid('1')}', 'bio', now() - interval '25 days'),
  ('${proUuid('1')}', 'services', now() - interval '20 days')
ON CONFLICT (professional_id, step) DO NOTHING;
`);

// Home popular services
lines.push(`INSERT INTO home_popular_services (id, legacy_id, category_id, title, icon, rating, completed_jobs, avg_price, image_url, sort_order) VALUES
  ('${uuid(NS.homePopular, 1)}', 'ps1', '${CAT.pulizie}', 'Pulizie domestiche', 'sparkles-outline', 4.9, 2840, 25, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', 1),
  ('${uuid(NS.homePopular, 2)}', 'ps2', '${CAT.idraulici}', 'Idraulico', 'water-outline', 4.8, 1960, 45, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop', 2),
  ('${uuid(NS.homePopular, 3)}', 'ps3', '${CAT.elettricisti}', 'Elettricista', 'flash-outline', 4.9, 1720, 55, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop', 3),
  ('${uuid(NS.homePopular, 4)}', 'ps4', '${CAT.giardinieri}', 'Giardiniere', 'leaf-outline', 4.8, 980, 29, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', 4),
  ('${uuid(NS.homePopular, 5)}', 'ps5', '${CAT['montaggio-mobili']}', 'Montaggio mobili', 'cube-outline', 4.7, 1540, 35, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&fm=webp', 5)
ON CONFLICT (id) DO NOTHING;
`);

// Home offers
lines.push(`INSERT INTO home_offers (id, legacy_id, category_id, title, highlight, subtitle, sort_order) VALUES
  ('${uuid(NS.homeOffer, 1)}', 'o1', '${CAT.pulizie}', 'Prima pulizia', '-20%', 'Sui primi 2 interventi in app', 1),
  ('${uuid(NS.homeOffer, 2)}', 'o2', '${CAT.giardinieri}', 'Giardiniere', 'da 29€', 'Manutenzione base fino a 80 mq', 2),
  ('${uuid(NS.homeOffer, 3)}', 'o3', '${CAT.elettricisti}', 'Controllo elettrico', 'da 39€', 'Verifica impianto e sicurezza', 3),
  ('${uuid(NS.homeOffer, 4)}', 'o4', '${CAT.idraulici}', 'Idraulico express', '-15%', 'Prenotazione entro le 12:00', 4)
ON CONFLICT (id) DO NOTHING;
`);

// Home service tiles
const casaTiles = [
  ['c1', 'Pulizie domestiche', 'sparkles-outline', 'pulizie'],
  ['c2', "Perdite d'acqua", 'water-outline', 'idraulici'],
  ['c3', 'Scarichi otturati', 'funnel-outline', 'idraulici'],
  ['c4', 'Impianti luce', 'bulb-outline', 'elettricisti'],
  ['c5', 'Cura giardino', 'leaf-outline', 'giardinieri'],
  ['c6', 'Montaggio mobili', 'hammer-outline', 'montaggio-mobili'],
  ['c7', 'Imbiancatura', 'color-palette-outline', 'imbianchini'],
  ['c8', 'Serrature', 'key-outline', 'fabbri'],
  ['c9', 'Climatizzatori', 'snow-outline', 'tecnici-caldaie-condizionatori'],
  ['c10', 'Traslochi', 'car-outline', 'traslochi-sgomberi'],
];
const aziendaTiles = [
  ['a1', 'Pulizie uffici', 'business-outline', 'pulizie'],
  ['a2', 'Sanificazione', 'shield-checkmark-outline', 'pulizie'],
  ['a3', 'Videosorveglianza', 'videocam-outline', 'elettricisti'],
  ['a4', 'Antincendio', 'flame-outline', 'elettricisti'],
  ['a5', 'Impianti elettrici', 'flash-outline', 'elettricisti'],
  ['a6', 'Cablaggio rete', 'git-network-outline', 'elettricisti'],
  ['a7', 'Condizionatori', 'snow-outline', 'tecnici-caldaie-condizionatori'],
  ['a8', 'Facchinaggio', 'cube-outline', 'traslochi-sgomberi'],
  ['a9', 'Facility management', 'settings-outline', 'pulizie'],
  ['a10', 'Manutenzione impianti', 'build-outline', 'tecnici-caldaie-condizionatori'],
];
const tileRows = [];
let tileIdx = 1;
casaTiles.forEach(([lid, title, icon, slug], i) => {
  tileRows.push(`  ('${uuid(NS.homeTile, tileIdx++)}', '${lid}', 'casa', ${esc(title)}, '${icon}', '${slug}', ${i + 1})`);
});
aziendaTiles.forEach(([lid, title, icon, slug], i) => {
  tileRows.push(`  ('${uuid(NS.homeTile, tileIdx++)}', '${lid}', 'azienda', ${esc(title)}, '${icon}', '${slug}', ${i + 1})`);
});
lines.push(`INSERT INTO home_service_tiles (id, legacy_id, audience, title, icon, category_slug, sort_order) VALUES\n${tileRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Reviews: HOME_REVIEWS + 2 per pro
const revRows = [];
let revIdx = 1;
for (const hr of HOME_REVIEWS) {
  revRows.push(`  ('${uuid(NS.review, revIdx++)}', '${hr.id}', '${proUuid(hr.proId)}', NULL, ${hr.rating}, ${esc(hr.text)}, ${esc(hr.service)}, ${esc(hr.clientName)}, '2026-06-01')`);
}
for (const p of MOCK_PROFESSIONALS) {
  for (let i = 0; i < 2; i++) {
    const sample = SAMPLE_REVIEWS[(parseInt(p.id, 10) + i) % SAMPLE_REVIEWS.length];
    const custIdx = ((parseInt(p.id, 10) + i) % CUSTOMERS.length) + 1;
    revRows.push(`  ('${uuid(NS.review, revIdx++)}', '${p.id}-rev${i + 1}', '${proUuid(p.id)}', '${customerId(custIdx)}', ${sample.rating}, ${esc(sample.text)}, ${esc(p.category)}, NULL, '2026-05-${String(10 + parseInt(p.id, 10)).padStart(2, '0')}')`);
  }
}
// Laura fidati-pro reviews
revRows.push(`  ('${uuid(NS.review, 101)}', 'r1-pro', '${proUuid('1')}', '${customerId(1)}', 5, 'Puntualissima e molto accurata. Appartamento impeccabile.', 'Pulizia profonda', NULL, '2026-06-03')`);
revRows.push(`  ('${uuid(NS.review, 102)}', 'r2-pro', '${proUuid('1')}', '${customerId(2)}', 5, 'Professionalità top, consigliatissima per uffici.', 'Pulizia ufficio', NULL, '2026-05-28')`);
revRows.push(`  ('${uuid(NS.review, 103)}', 'r3-pro', '${proUuid('1')}', '${customerId(3)}', 4, 'Ottimo lavoro post-cantiere, tempi rispettati.', 'Post-ristrutturazione', NULL, '2026-05-20')`);

lines.push(`INSERT INTO reviews (id, legacy_id, professional_id, customer_id, rating, body, service_title, client_display_name, review_date) VALUES\n${revRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n`);

// Conversations, messages, requests, bookings (fidati-pro + fidati-app)
const conv = (n) => uuid(NS.conversation, n);
const msg = (n) => uuid(NS.message, n);
const req = (n) => uuid(NS.bookingRequest, n);
const book = (n) => uuid(NS.booking, n);
const pay = (n) => uuid(NS.payment, n);

lines.push(`INSERT INTO conversations (id, legacy_id, customer_id, professional_id, last_message, last_message_at, unread_customer, unread_professional, pending_deadline_at) VALUES
  ('${conv(1)}', 'm1', '${customerId(1)}', '${proUuid('1')}', 'Perfetto, ci vediamo martedì. Citofono Rossi.', '2026-06-09 10:32:00+02', 0, 2, NULL),
  ('${conv(2)}', 'm2', '${customerId(2)}', '${proUuid('1')}', 'Serve anche la pulizia dei vetri esterni.', '2026-06-08 18:00:00+02', 0, 0, NULL),
  ('${conv(3)}', 'msg-3', '${customerId(3)}', '${proUuid('1')}', 'Sono in ufficio, citofono Neri.', '2026-06-09 08:05:00+02', 0, 1, NULL),
  ('${conv(4)}', 'msg-4', '${customerId(4)}', '${proUuid('1')}', 'Grazie per la disponibilità!', '2026-06-07 16:00:00+02', 0, 0, NULL),
  ('${conv(5)}', 'm2-app', '${customerId(1)}', '${proUuid('2')}', 'Ho risolto la perdita, tutto a posto.', '2026-06-08 14:00:00+02', 0, 0, NULL),
  ('${conv(6)}', 'm3-app', '${customerId(1)}', '${proUuid('5')}', 'Porto gli attrezzi necessari.', '2026-06-06 09:00:00+02', 0, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  customer_id = EXCLUDED.customer_id,
  last_message = EXCLUDED.last_message,
  last_message_at = EXCLUDED.last_message_at,
  unread_customer = EXCLUDED.unread_customer,
  unread_professional = EXCLUDED.unread_professional;

INSERT INTO messages (id, legacy_id, conversation_id, sender, kind, body, sent_at) VALUES
  ('${msg(1)}', 'c1-1', '${conv(1)}', 'customer', 'text', 'Buongiorno, conferma che può venire martedì alle 10?', '2026-06-09 09:42:00+02'),
  ('${msg(2)}', 'c1-2', '${conv(1)}', 'professional', 'text', 'Buongiorno! Sì, confermo la disponibilità per le 10:00.', '2026-06-09 09:48:00+02'),
  ('${msg(3)}', 'c1-3', '${conv(1)}', 'customer', 'text', 'Perfetto, ci vediamo martedì. Citofono Rossi.', '2026-06-09 10:32:00+02'),
  ('${msg(4)}', 'c3-1', '${conv(3)}', 'professional', 'text', 'Buongiorno, sono in arrivo per le 8.', '2026-06-09 07:50:00+02'),
  ('${msg(5)}', 'c3-2', '${conv(3)}', 'customer', 'text', 'Sono in ufficio, citofono Neri.', '2026-06-09 08:05:00+02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_requests (id, legacy_id, customer_id, professional_id, conversation_id, service_title, category_label, scheduled_date, scheduled_time, price, address, zone, distance_km, note, status, client_verified, client_rating, response_deadline_at, online_payment_available) VALUES
  ('${req(1)}', 'req-1', '${customerId(1)}', '${proUuid('1')}', '${conv(1)}', 'Pulizia casa 80 mq', 'Pulizie', '2026-06-12', '10:00', 85, 'Via Roma 12, Milano', 'Centro', 1.2, 'Piano secondo, citofono Rossi. Attenzione al parquet.', 'pending', true, 4.8, now() + interval '52 minutes', true),
  ('${req(2)}', 'req-2', '${customerId(2)}', '${proUuid('1')}', '${conv(2)}', 'Pulizia post-ristrutturazione', 'Pulizie', '2026-06-14', '15:30', 150, 'Corso Garibaldi 45, Milano', 'Porta Nuova', 2.8, NULL, 'pending', true, 4.9, now() + interval '20 minutes', true),
  ('${req(3)}', 'req-3', '${customerId(4)}', '${proUuid('1')}', '${conv(4)}', 'Sanificazione ufficio', 'Pulizie', '2026-06-13', '09:00', 110, 'Via Melchiorre 8, Milano', 'Isola', 3.5, NULL, 'pending', false, 4.2, now() - interval '1 hour', false),
  ('${req(4)}', 'req-4', '${customerId(3)}', '${proUuid('1')}', '${conv(3)}', 'Pulizia ufficio settimanale', 'Pulizie', '2026-06-10', '08:00', 120, 'Viale Monza 88, Milano', 'Lambrate', 4.1, NULL, 'accepted', true, 5.0, NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, legacy_id, customer_id, professional_id, booking_request_id, service_title, category_label, scheduled_date, scheduled_time, end_time, status, appointment_status, price, address, zone, note) VALUES
  ('${book(1)}', 'b1', '${customerId(1)}', '${proUuid('1')}', NULL, 'Pulizia casa', 'Pulizie', '2024-06-12', '10:00', NULL, 'confirmed', NULL, 85, 'Via Roma 12, Milano', NULL, 'Piano secondo, citofono Bianchi.'),
  ('${book(2)}', 'b2', '${customerId(1)}', '${proUuid('2')}', NULL, 'Riparazione perdita', 'Idraulico', '2024-06-08', '14:30', NULL, 'incoming', NULL, 60, 'Corso Garibaldi 45, Milano', NULL, NULL),
  ('${book(3)}', 'b3', '${customerId(1)}', '${proUuid('5')}', NULL, 'Montaggio mobili', 'Montaggio mobili', '2024-05-28', '09:00', NULL, 'completed', NULL, 50, 'Viale Monza 88, Milano', NULL, NULL),
  ('${book(4)}', 'b4', '${customerId(1)}', '${proUuid('3')}', NULL, 'Punto luce', 'Elettricista', '2024-05-15', '11:00', NULL, 'completed', NULL, 55, 'Piazza Duomo 3, Milano', NULL, NULL),
  ('${book(5)}', 'apt-1', '${customerId(3)}', '${proUuid('1')}', '${req(4)}', 'Pulizia ufficio', 'Pulizie', '2026-06-09', '08:00', '11:00', 'confirmed', 'in_progress', 120, 'Viale Monza 88', 'Lambrate', NULL),
  ('${book(6)}', 'apt-2', '${customerId(5)}', '${proUuid('1')}', NULL, 'Pulizia profonda 60 mq', 'Pulizie', '2026-06-09', '14:00', '17:00', 'confirmed', 'upcoming', 95, 'Piazza Duomo 3', 'Centro', NULL),
  ('${book(7)}', 'apt-3', '${customerId(6)}', '${proUuid('1')}', NULL, 'Sanificazione', 'Pulizie', '2026-06-10', '11:00', '13:00', 'confirmed', 'upcoming', 110, 'Via Torino 22', 'Navigli', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, legacy_id, booking_id, customer_id, professional_id, amount, status, payment_method, provider, captured_at) VALUES
  ('${pay(1)}', 'pay-1', '${book(3)}', '${customerId(1)}', '${proUuid('5')}', 50, 'captured', 'card', 'stripe', '2024-05-28 10:00:00+02'),
  ('${pay(2)}', 'pay-2', '${book(4)}', '${customerId(1)}', '${proUuid('3')}', 55, 'captured', 'card', 'stripe', '2024-05-15 12:00:00+02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO refunds (id, legacy_id, payment_id, amount, status, reason, processed_at) VALUES
  ('${uuid(NS.refund, 1)}', 'ref-1', '${pay(1)}', 10, 'completed', 'Rimborso parziale per ritardo', '2024-05-29 09:00:00+02')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, customer_id, professional_id, channel, type, title, body) VALUES
  ('${uuid(NS.notification, 1)}', NULL, '${proUuid('1')}', 'in_app', 'new_request', 'Nuova richiesta', 'Marco Rossi ha inviato una richiesta per Pulizia casa 80 mq.'),
  ('${uuid(NS.notification, 2)}', NULL, '${proUuid('1')}', 'in_app', 'message', 'Nuovo messaggio', 'Giulia Verdi ti ha scritto.'),
  ('${uuid(NS.notification, 3)}', '${customerId(1)}', NULL, 'in_app', 'booking_confirmed', 'Prenotazione confermata', 'Laura Bianchi ha confermato il tuo appuntamento.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO support_tickets (id, legacy_id, customer_id, subject, body, status) VALUES
  ('${uuid(NS.supportTicket, 1)}', 'tkt-1', '${customerId(1)}', 'Modifica appuntamento', 'Vorrei spostare la pulizia di martedì al pomeriggio.', 'open')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, legacy_id, reporter_customer_id, target_type, target_id, reason, status) VALUES
  ('${uuid(NS.report, 1)}', 'rep-1', '${customerId(1)}', 'professional', '${proUuid('4')}', 'Comportamento inappropriato', 'open')
ON CONFLICT (id) DO NOTHING;
`);

const stats = {
  professionals: MOCK_PROFESSIONALS.length,
  categories: 12,
  services: Object.values(PROFESSIONAL_SERVICES).flat().length,
  reviews: revRows.length,
  addedPros: 10,
};
console.log('Generated seed stats:', stats);

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`Wrote ${OUT}`);
