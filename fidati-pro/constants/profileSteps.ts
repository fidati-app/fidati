export const PROFILE_STEP_TOTAL = 5;

export type ProfileStepId =
  | 'photo'
  | 'documents'
  | 'portfolio'
  | 'availability'
  | 'urgent_jobs';

export type ProfileStepIcon =
  | 'camera-outline'
  | 'id-card-outline'
  | 'images-outline'
  | 'calendar-outline'
  | 'flash-outline';

export interface ProfileStep {
  id: ProfileStepId;
  title: string;
  subtitle: string;
  route: string;
  icon: ProfileStepIcon;
}

export const PROFILE_STEPS: ProfileStep[] = [
  {
    id: 'photo',
    title: 'Foto profilo',
    subtitle: 'Aggiungi una foto professionale riconoscibile',
    route: '/profile/photo',
    icon: 'camera-outline',
  },
  {
    id: 'documents',
    title: 'Documento + selfie',
    subtitle: 'Carica documento d’identità e selfie di verifica',
    route: '/profile/documents',
    icon: 'id-card-outline',
  },
  {
    id: 'portfolio',
    title: 'Foto lavori',
    subtitle: 'Carica almeno 1 foto reale di un tuo lavoro (max 6)',
    route: '/profile/portfolio',
    icon: 'images-outline',
  },
  {
    id: 'availability',
    title: 'Disponibilità',
    subtitle: 'Imposta giorni e orari in cui lavori',
    route: '/profile/availability',
    icon: 'calendar-outline',
  },
  {
    id: 'urgent_jobs',
    title: 'Lavori urgenti',
    subtitle: 'Scegli se accettare richieste urgenti nella tua zona',
    route: '/profile/urgent-jobs',
    icon: 'flash-outline',
  },
];

export const INITIAL_COMPLETED_STEPS: ProfileStepId[] = [];
