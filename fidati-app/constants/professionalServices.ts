import { CategoryIcon, CategorySlug, ServicePackage } from '@/types';

export interface ProfessionalServiceItem {
  id: string;
  title: string;
  icon: CategoryIcon;
  description: string;
  fromPrice: number;
  packages: ServicePackage[];
}

export const PROFESSIONAL_SERVICES: Record<CategorySlug, ProfessionalServiceItem[]> = {
  pulizie: [
    {
      id: 'pul-deep',
      title: 'Pulizia profonda casa',
      icon: 'home-outline',
      description: 'Pavimenti, bagno, cucina e superfici',
      fromPrice: 45,
      packages: [
        { id: 'pul-deep-b', tier: 'base', title: 'Monolocale', description: 'Fino a 45 mq, 2 ore', price: 45, duration: '2 ore' },
        { id: 'pul-deep-s', tier: 'standard', title: 'Bilocale', description: 'Fino a 75 mq, dettagli e vetri', price: 75, duration: '3 ore' },
        { id: 'pul-deep-p', tier: 'premium', title: 'Trilocale+', description: 'Fino a 110 mq, pulizia completa', price: 110, duration: '5 ore' },
      ],
    },
    {
      id: 'pul-office',
      title: 'Pulizie ufficio',
      icon: 'business-outline',
      description: 'Open space, sale riunioni e reception',
      fromPrice: 60,
      packages: [
        { id: 'pul-office-b', tier: 'base', title: 'Piccolo ufficio', description: 'Fino a 60 mq', price: 60, duration: '2 ore' },
        { id: 'pul-office-s', tier: 'standard', title: 'Medio ufficio', description: 'Fino a 120 mq', price: 95, duration: '4 ore' },
      ],
    },
    {
      id: 'pul-post',
      title: 'Post-ristrutturazione',
      icon: 'construct-outline',
      description: 'Sgombero polvere, vetri e finiture',
      fromPrice: 90,
      packages: [
        { id: 'pul-post-b', tier: 'base', title: 'Standard', description: 'Appartamento fino a 70 mq', price: 90, duration: '4 ore' },
        { id: 'pul-post-p', tier: 'premium', title: 'Completo', description: 'Con sanificazione inclusa', price: 140, duration: '6 ore' },
      ],
    },
    {
      id: 'pul-glass',
      title: 'Lavaggio vetri',
      icon: 'sparkles-outline',
      description: 'Interni, esterni e infissi',
      fromPrice: 35,
      packages: [
        { id: 'pul-glass-b', tier: 'base', title: 'Fino a 8 vetri', description: 'Interni e telaio', price: 35, duration: '1.5 ore' },
        { id: 'pul-glass-s', tier: 'standard', title: 'Appartamento', description: 'Tutti i vetri casa', price: 55, duration: '2.5 ore' },
      ],
    },
    {
      id: 'pul-sani',
      title: 'Sanificazione',
      icon: 'shield-checkmark-outline',
      description: 'Trattamento antibatterico certificato',
      fromPrice: 55,
      packages: [
        { id: 'pul-sani-b', tier: 'base', title: 'Singola zona', description: 'Cucina o bagno', price: 55, duration: '1.5 ore' },
        { id: 'pul-sani-p', tier: 'premium', title: 'Intera casa', description: 'Sanificazione completa', price: 95, duration: '3 ore' },
      ],
    },
  ],
  idraulici: [
    {
      id: 'idr-leak',
      title: 'Perdite e tubature',
      icon: 'water-outline',
      description: 'Ricerca perdita e riparazione',
      fromPrice: 40,
      packages: [
        { id: 'idr-leak-b', tier: 'base', title: 'Riparazione semplice', description: 'Guarnizioni e rubinetti', price: 40, duration: '1 ora' },
        { id: 'idr-leak-s', tier: 'standard', title: 'Perdita occulta', description: 'Diagnosi + intervento', price: 85, duration: '2 ore' },
      ],
    },
    {
      id: 'idr-tap',
      title: 'Rubinetteria',
      icon: 'funnel-outline',
      description: 'Sostituzione e installazione',
      fromPrice: 50,
      packages: [
        { id: 'idr-tap-b', tier: 'base', title: 'Singolo rubinetto', description: 'Sostituzione e collaudo', price: 50, duration: '1 ora' },
        { id: 'idr-tap-s', tier: 'standard', title: 'Bagno completo', description: 'Lavabo, bidet e doccia', price: 120, duration: '3 ore' },
      ],
    },
    {
      id: 'idr-boiler',
      title: 'Caldaia e boiler',
      icon: 'flame-outline',
      description: 'Manutenzione e assistenza',
      fromPrice: 70,
      packages: [
        { id: 'idr-boiler-b', tier: 'base', title: 'Controllo annuale', description: 'Pulizia e verifica', price: 70, duration: '1.5 ore' },
        { id: 'idr-boiler-p', tier: 'premium', title: 'Manutenzione full', description: 'Ricambi base inclusi', price: 130, duration: '3 ore' },
      ],
    },
    {
      id: 'idr-drain',
      title: 'Scarichi otturati',
      icon: 'alert-circle-outline',
      description: 'Lavandini, docce e WC',
      fromPrice: 45,
      packages: [
        { id: 'idr-drain-b', tier: 'base', title: 'Singolo scarico', description: 'Spurgo manuale', price: 45, duration: '1 ora' },
        { id: 'idr-drain-s', tier: 'standard', title: 'Impianto bagno', description: 'Controllo completo', price: 75, duration: '2 ore' },
      ],
    },
    {
      id: 'idr-install',
      title: 'Installazioni',
      icon: 'build-outline',
      description: 'Lavatrice, lavastoviglie, sanitari',
      fromPrice: 65,
      packages: [
        { id: 'idr-install-b', tier: 'base', title: 'Elettrodomestico', description: 'Allaccio e collaudo', price: 65, duration: '1.5 ore' },
        { id: 'idr-install-p', tier: 'premium', title: 'Bagno nuovo', description: 'Sanitari e miscelatori', price: 180, duration: '4 ore' },
      ],
    },
  ],
  elettricisti: [
    {
      id: 'ele-point',
      title: 'Punto luce e prese',
      icon: 'flash-outline',
      description: 'Installazione e spostamento',
      fromPrice: 45,
      packages: [
        { id: 'ele-point-b', tier: 'base', title: 'Singolo punto', description: 'Luce o presa nuova', price: 45, duration: '1 ora' },
        { id: 'ele-point-s', tier: 'standard', title: 'Stanza intera', description: 'Fino a 4 punti', price: 120, duration: '3 ore' },
      ],
    },
    {
      id: 'ele-panel',
      title: 'Quadro elettrico',
      icon: 'apps-outline',
      description: 'Verifica, upgrade e messa a norma',
      fromPrice: 90,
      packages: [
        { id: 'ele-panel-b', tier: 'base', title: 'Controllo', description: 'Diagnosi e report', price: 90, duration: '2 ore' },
        { id: 'ele-panel-p', tier: 'premium', title: 'Adeguamento', description: 'Differenziale e magnetotermico', price: 220, duration: '5 ore' },
      ],
    },
    {
      id: 'ele-led',
      title: 'Illuminazione LED',
      icon: 'bulb-outline',
      description: 'Faretti, strip e sostituzioni',
      fromPrice: 55,
      packages: [
        { id: 'ele-led-b', tier: 'base', title: 'Fino a 6 punti', description: 'Sostituzione lampade', price: 55, duration: '1.5 ore' },
        { id: 'ele-led-s', tier: 'standard', title: 'Impianto zona', description: 'Cucina o soggiorno', price: 140, duration: '4 ore' },
      ],
    },
    {
      id: 'ele-smart',
      title: 'Domotica',
      icon: 'wifi-outline',
      description: 'Smart switch, tapparelle e sensori',
      fromPrice: 120,
      packages: [
        { id: 'ele-smart-b', tier: 'base', title: 'Starter kit', description: '3 dispositivi smart', price: 120, duration: '2 ore' },
        { id: 'ele-smart-p', tier: 'premium', title: 'Casa smart', description: 'Configurazione completa', price: 280, duration: '6 ore' },
      ],
    },
    {
      id: 'ele-cert',
      title: 'Certificazione impianto',
      icon: 'document-text-outline',
      description: 'DiCo e conformità DM 37/08',
      fromPrice: 110,
      packages: [
        { id: 'ele-cert-b', tier: 'base', title: 'Verifica', description: 'Sopralluogo e preventivo', price: 110, duration: '2 ore' },
        { id: 'ele-cert-p', tier: 'premium', title: 'Con dichiarazione', description: 'Rilascio documenti', price: 190, duration: '4 ore' },
      ],
    },
    {
      id: 'ele-urgent',
      title: 'Guasto urgente',
      icon: 'warning-outline',
      description: 'Blackout, corto circuito, salvavita',
      fromPrice: 60,
      packages: [
        { id: 'ele-urgent-b', tier: 'base', title: 'Intervento rapido', description: 'Entro 2 ore', price: 60, duration: '1 ora' },
        { id: 'ele-urgent-s', tier: 'standard', title: 'Diagnosi + riparo', description: 'In giornata', price: 95, duration: '2 ore' },
      ],
    },
  ],
  giardinieri: [
    {
      id: 'gia-prune',
      title: 'Potatura alberi',
      icon: 'leaf-outline',
      description: 'Siepi, alberi da frutto e ornamentali',
      fromPrice: 55,
      packages: [
        { id: 'gia-prune-b', tier: 'base', title: 'Siepe', description: 'Fino a 10 metri lineari', price: 55, duration: '2 ore' },
        { id: 'gia-prune-s', tier: 'standard', title: 'Albero medio', description: 'Potatura e smaltimento', price: 90, duration: '3 ore' },
      ],
    },
    {
      id: 'gia-maint',
      title: 'Manutenzione giardino',
      icon: 'flower-outline',
      description: 'Cura stagionale completa',
      fromPrice: 50,
      packages: [
        { id: 'gia-maint-b', tier: 'base', title: 'Fino a 100 mq', description: 'Sfalcio e pulizia', price: 50, duration: '2 ore' },
        { id: 'gia-maint-p', tier: 'premium', title: 'Fino a 250 mq', description: 'Manutenzione profonda', price: 95, duration: '4 ore' },
      ],
    },
    {
      id: 'gia-grass',
      title: 'Erba e siepi',
      icon: 'cut-outline',
      description: 'Taglio prato e rifiniture',
      fromPrice: 35,
      packages: [
        { id: 'gia-grass-b', tier: 'base', title: 'Prato piccolo', description: 'Fino a 80 mq', price: 35, duration: '1.5 ore' },
        { id: 'gia-grass-s', tier: 'standard', title: 'Prato + siepi', description: 'Giardino medio', price: 65, duration: '3 ore' },
      ],
    },
    {
      id: 'gia-terra',
      title: 'Terrazzi e balconi',
      icon: 'sunny-outline',
      description: 'Vasi, piante e pulizia verde',
      fromPrice: 40,
      packages: [
        { id: 'gia-terra-b', tier: 'base', title: 'Balcone', description: 'Fino a 15 mq', price: 40, duration: '1.5 ore' },
        { id: 'gia-terra-s', tier: 'standard', title: 'Terrazzo grande', description: 'Con irrigazione', price: 70, duration: '2.5 ore' },
      ],
    },
    {
      id: 'gia-irr',
      title: 'Irrigazione',
      icon: 'rainy-outline',
      description: 'Installazione e programmazione',
      fromPrice: 80,
      packages: [
        { id: 'gia-irr-b', tier: 'base', title: 'Controllo impianto', description: 'Taratura e test', price: 80, duration: '2 ore' },
        { id: 'gia-irr-p', tier: 'premium', title: 'Nuovo impianto', description: 'Fino a 200 mq', price: 220, duration: '6 ore' },
      ],
    },
  ],
  tuttofare: [
    {
      id: 'tut-furniture',
      title: 'Montaggio mobili',
      icon: 'cube-outline',
      description: 'IKEA, cucine e armadi',
      fromPrice: 35,
      packages: [
        { id: 'tut-furniture-b', tier: 'base', title: 'Singolo mobile', description: 'Comò, libreria, scrivania', price: 35, duration: '1.5 ore' },
        { id: 'tut-furniture-s', tier: 'standard', title: 'Camera completa', description: 'Fino a 4 mobili', price: 75, duration: '3 ore' },
      ],
    },
    {
      id: 'tut-fix',
      title: 'Riparazioni casa',
      icon: 'hammer-outline',
      description: 'Tapparelle, serrature, piccoli guasti',
      fromPrice: 40,
      packages: [
        { id: 'tut-fix-b', tier: 'base', title: 'Intervento singolo', description: 'Una riparazione', price: 40, duration: '1 ora' },
        { id: 'tut-fix-s', tier: 'standard', title: 'Pacchetto 3 interventi', description: 'Nella stessa visita', price: 95, duration: '3 ore' },
      ],
    },
    {
      id: 'tut-small',
      title: 'Piccoli lavori',
      icon: 'construct-outline',
      description: 'Appendere quadri, mensole, tende',
      fromPrice: 30,
      packages: [
        { id: 'tut-small-b', tier: 'base', title: '1 ora lavoro', description: 'Lista interventi brevi', price: 30, duration: '1 ora' },
        { id: 'tut-small-s', tier: 'standard', title: '2 ore lavoro', description: 'Più attività insieme', price: 55, duration: '2 ore' },
      ],
    },
    {
      id: 'tut-paint',
      title: 'Tinteggiatura',
      icon: 'color-palette-outline',
      description: 'Pareti, soffitti e ritocchi',
      fromPrice: 70,
      packages: [
        { id: 'tut-paint-b', tier: 'base', title: 'Singola parete', description: 'Fino a 12 mq', price: 70, duration: '3 ore' },
        { id: 'tut-paint-p', tier: 'premium', title: 'Stanza intera', description: 'Fino a 15 mq', price: 150, duration: '6 ore' },
      ],
    },
    {
      id: 'tut-door',
      title: 'Serramenti',
      icon: 'lock-closed-outline',
      description: 'Porte, maniglie e cerniere',
      fromPrice: 45,
      packages: [
        { id: 'tut-door-b', tier: 'base', title: 'Regolazione porta', description: 'Cerniere e chiudiporta', price: 45, duration: '1 ora' },
        { id: 'tut-door-s', tier: 'standard', title: 'Sostituzione serratura', description: 'Con collaudo', price: 80, duration: '2 ore' },
      ],
    },
  ],
};

export function getProfessionalServices(categorySlug: CategorySlug): ProfessionalServiceItem[] {
  return PROFESSIONAL_SERVICES[categorySlug];
}

export function findServicePackage(
  categorySlug: CategorySlug,
  packageId: string,
): ServicePackage | undefined {
  for (const service of PROFESSIONAL_SERVICES[categorySlug]) {
    const match = service.packages.find((pkg) => pkg.id === packageId);
    if (match) return match;
  }
  return undefined;
}
