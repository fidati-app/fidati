export const PROFILE_STEP_TOTAL = 5;

export type ProfileStepId = 'photo' | 'bio' | 'services' | 'portfolio' | 'zones';

export interface ProfileStep {
  id: ProfileStepId;
  title: string;
  subtitle: string;
  route: string;
  icon: 'camera-outline' | 'document-text-outline' | 'pricetag-outline' | 'images-outline' | 'map-outline';
}

export const PROFILE_STEPS: ProfileStep[] = [
  {
    id: 'photo',
    title: 'Foto profilo',
    subtitle: 'Aggiungi una foto professionale riconoscibile',
    route: '/profile/complete',
    icon: 'camera-outline',
  },
  {
    id: 'bio',
    title: 'Descrizione',
    subtitle: 'Racconta la tua esperienza e specializzazioni',
    route: '/profile/complete',
    icon: 'document-text-outline',
  },
  {
    id: 'services',
    title: 'Servizi e prezzi',
    subtitle: 'Definisci cosa offri e i tuoi listini',
    route: '/profile/services',
    icon: 'pricetag-outline',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    subtitle: 'Carica foto dei lavori svolti',
    route: '/profile/portfolio',
    icon: 'images-outline',
  },
  {
    id: 'zones',
    title: 'Zone servite',
    subtitle: 'Indica le aree in cui lavori',
    route: '/profile/zones',
    icon: 'map-outline',
  },
];

/** Passaggi già completati all'avvio (mock). */
export const INITIAL_COMPLETED_STEPS: ProfileStepId[] = ['photo', 'bio', 'services'];
