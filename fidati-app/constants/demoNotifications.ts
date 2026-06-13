import { CategoryIcon } from '@/types';

/** Notifica demo — struttura pronta per futuro fetch Supabase. */
export interface DemoNotification {
  id: string;
  icon: CategoryIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'n1',
    icon: 'person-add-outline',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Nuovo professionista disponibile a Barletta',
    body: 'Un elettricista verificato opera ora anche nella tua zona.',
    timeLabel: 'Ora',
    read: false,
  },
  {
    id: 'n2',
    icon: 'location-outline',
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.12)',
    title: 'La tua zona è stata aggiornata',
    body: 'I risultati in Home riflettono la città selezionata.',
    timeLabel: '5 min fa',
    read: false,
  },
  {
    id: 'n3',
    icon: 'shield-checkmark-outline',
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Garanzia Fidati attiva sui servizi selezionati',
    body: 'Prenota con copertura verifica, recensioni e pagamenti protetti.',
    timeLabel: 'Oggi',
    read: false,
  },
  {
    id: 'n4',
    icon: 'calendar-outline',
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    title: 'Promemoria: scegli un servizio',
    body: 'Seleziona una categoria per ricevere assistenza nella tua città.',
    timeLabel: 'Oggi',
    read: true,
  },
];
