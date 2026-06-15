import {
  AgendaDayMeta,
  ProAppointment,
  ProChatMessage,
  ProMessage,
  ProProfile,
  ProRequest,
  TimeSlot,
  WeeklyAvailabilitySlot,
} from '@/types';

export const MOCK_PRO_PROFILE: ProProfile = {
  id: 'pro-1',
  name: 'Laura Bianchi',
  category: 'Pulizie domestiche e uffici',
  email: 'laura.bianchi@email.com',
  phone: '+39 333 456 7890',
  bio: 'Specialista in pulizie profonde, post-ristrutturazione e manutenzione uffici. Oltre 6 anni di esperienza a Milano e hinterland. Uso prodotti eco e attrezzatura professionale.',
  rating: 4.92,
  reviewCount: 128,
  jobsCompleted: 342,
  memberSince: 'Marzo 2023',
  earningsThisMonth: 2840,
  verified: true,
  availableToday: true,
  baseCity: 'Milano',
  serviceZones: ['Centro', 'Porta Nuova', 'Isola', 'Navigli', 'Lambrate'],
  services: [
    { id: 's1', title: 'Pulizia standard appartamento', priceFrom: 65, priceMax: null, quoteRequired: false, duration: '2–3 ore' },
    { id: 's2', title: 'Pulizia profonda', priceFrom: 95, priceMax: null, quoteRequired: false, duration: '3–4 ore' },
    { id: 's3', title: 'Post-ristrutturazione', priceFrom: 150, priceMax: null, quoteRequired: false, duration: '4–6 ore' },
    { id: 's4', title: 'Ufficio fino a 80 mq', priceFrom: 120, priceMax: null, quoteRequired: false, duration: '3 ore' },
  ],
  portfolio: [
    {
      id: 'p1',
      title: 'Cucina post-ristrutturazione',
      subtitle: 'Centro · 85 mq',
      category: 'Post-cantiere',
      coverImage:
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
      beforeImage:
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ca?w=800&q=80',
      ],
    },
    {
      id: 'p2',
      title: 'Ufficio open space',
      subtitle: 'Porta Nuova · 120 mq',
      category: 'Ufficio',
      coverImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
      ],
    },
    {
      id: 'p3',
      title: 'Bagno sanitizzato',
      subtitle: 'Isola · 12 mq',
      category: 'Sanificazione',
      coverImage:
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
      beforeImage:
        'https://images.unsplash.com/photo-1584622650116-993a426fbf0a?w=600&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80',
        'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&q=80',
      ],
    },
    {
      id: 'p4',
      title: 'Soggiorno premium',
      subtitle: 'Navigli · 45 mq',
      category: 'Pulizia profonda',
      coverImage:
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      ],
    },
  ],
  reviews: [
    {
      id: 'r1',
      clientName: 'Marco R.',
      rating: 5,
      date: '3 Giu 2026',
      text: 'Puntualissima e molto accurata. Appartamento impeccabile.',
      serviceTitle: 'Pulizia profonda',
    },
    {
      id: 'r2',
      clientName: 'Giulia V.',
      rating: 5,
      date: '28 Mag 2026',
      text: 'Professionalità top, consigliatissima per uffici.',
      serviceTitle: 'Pulizia ufficio',
    },
    {
      id: 'r3',
      clientName: 'Paolo N.',
      rating: 4,
      date: '20 Mag 2026',
      text: 'Ottimo lavoro post-cantiere, tempi rispettati.',
      serviceTitle: 'Post-ristrutturazione',
    },
  ],
  stats: {
    earningsThisWeek: 720,
    earningsThisMonth: 2840,
    profileCompletion: 86,
    rating: 4.92,
    reviewCount: 128,
    jobsCompleted: 342,
    newClientsThisMonth: 14,
    responseRate: 96,
    accountStatus: 'verified',
    profileViews: 1247,
  },
};

export const MOCK_REQUESTS: ProRequest[] = [
  {
    id: 'req-1',
    clientName: 'Marco Rossi',
    serviceTitle: 'Pulizia casa 80 mq',
    category: 'Pulizie',
    date: '12 Giu 2026',
    time: '10:00',
    price: 85,
    address: 'Via Roma 12, Milano',
    zone: 'Centro',
    distanceKm: 1.2,
    note: 'Piano secondo, citofono Rossi. Attenzione al parquet.',
    status: 'pending',
    createdAt: '09:14',
    minutesAgo: 8,
    clientVerified: true,
    clientRating: 4.8,
    responseDeadlineMinutes: 52,
    onlinePaymentAvailable: true,
  },
  {
    id: 'req-2',
    clientName: 'Giulia Verdi',
    serviceTitle: 'Pulizia post-ristrutturazione',
    category: 'Pulizie',
    date: '14 Giu 2026',
    time: '15:30',
    price: 150,
    address: 'Corso Garibaldi 45, Milano',
    zone: 'Porta Nuova',
    distanceKm: 2.8,
    status: 'pending',
    createdAt: '08:42',
    minutesAgo: 40,
    clientVerified: true,
    clientRating: 4.9,
    responseDeadlineMinutes: 20,
    onlinePaymentAvailable: true,
  },
  {
    id: 'req-3',
    clientName: 'Elena Costa',
    serviceTitle: 'Sanificazione ufficio',
    category: 'Pulizie',
    date: '13 Giu 2026',
    time: '09:00',
    price: 110,
    address: 'Via Melchiorre 8, Milano',
    zone: 'Isola',
    distanceKm: 3.5,
    status: 'pending',
    createdAt: '07:55',
    minutesAgo: 87,
    clientVerified: false,
    clientRating: 4.2,
    responseDeadlineMinutes: 0,
    onlinePaymentAvailable: false,
  },
  {
    id: 'req-4',
    clientName: 'Paolo Neri',
    serviceTitle: 'Pulizia ufficio settimanale',
    category: 'Pulizie',
    date: '10 Giu 2026',
    time: '08:00',
    price: 120,
    address: 'Viale Monza 88, Milano',
    zone: 'Lambrate',
    distanceKm: 4.1,
    status: 'accepted',
    createdAt: '08 Giu',
    minutesAgo: 0,
    clientVerified: true,
    clientRating: 5.0,
    responseDeadlineMinutes: 0,
    onlinePaymentAvailable: true,
  },
];

export const MOCK_APPOINTMENTS: ProAppointment[] = [
  {
    id: 'apt-1',
    clientName: 'Paolo Neri',
    serviceTitle: 'Pulizia ufficio',
    date: 'Oggi',
    dateKey: '2026-06-09',
    time: '08:00',
    endTime: '11:00',
    address: 'Viale Monza 88',
    zone: 'Lambrate',
    status: 'in_progress',
  },
  {
    id: 'apt-2',
    clientName: 'Sara Blu',
    serviceTitle: 'Pulizia profonda 60 mq',
    date: 'Oggi',
    dateKey: '2026-06-09',
    time: '14:00',
    endTime: '17:00',
    address: 'Piazza Duomo 3',
    zone: 'Centro',
    status: 'upcoming',
  },
  {
    id: 'apt-3',
    clientName: 'Luca Gialli',
    serviceTitle: 'Sanificazione',
    date: 'Domani',
    dateKey: '2026-06-10',
    time: '11:00',
    endTime: '13:00',
    address: 'Via Torino 22',
    zone: 'Navigli',
    status: 'upcoming',
  },
  {
    id: 'apt-4',
    clientName: 'Anna Ferrari',
    serviceTitle: 'Pulizia standard',
    date: '11 Giu',
    dateKey: '2026-06-11',
    time: '10:00',
    endTime: '12:30',
    address: 'Via Padova 15',
    zone: 'Lambrate',
    status: 'upcoming',
  },
  {
    id: 'apt-5',
    clientName: 'Roberto M.',
    serviceTitle: 'Post-ristrutturazione',
    date: '12 Giu',
    dateKey: '2026-06-12',
    time: '09:00',
    endTime: '14:00',
    address: 'Corso Buenos Aires 33',
    zone: 'Porta Venezia',
    status: 'upcoming',
  },
];

export const AGENDA_DAYS: AgendaDayMeta[] = [
  { key: '2026-06-09', label: 'Lun', day: '9', isToday: true, availability: 'partial', appointmentCount: 2 },
  { key: '2026-06-10', label: 'Mar', day: '10', isToday: false, availability: 'partial', appointmentCount: 1 },
  { key: '2026-06-11', label: 'Mer', day: '11', isToday: false, availability: 'partial', appointmentCount: 1 },
  { key: '2026-06-12', label: 'Gio', day: '12', isToday: false, availability: 'full', appointmentCount: 1 },
  { key: '2026-06-13', label: 'Ven', day: '13', isToday: false, availability: 'free', appointmentCount: 0 },
  { key: '2026-06-14', label: 'Sab', day: '14', isToday: false, availability: 'partial', appointmentCount: 0 },
  { key: '2026-06-15', label: 'Dom', day: '15', isToday: false, availability: 'off', appointmentCount: 0 },
];

export const WEEKLY_AVAILABILITY: WeeklyAvailabilitySlot[] = [
  { day: 'Lunedì', shortLabel: 'Lun', ranges: ['08:00–19:00'], status: 'partial' },
  { day: 'Martedì', shortLabel: 'Mar', ranges: ['08:00–19:00'], status: 'partial' },
  { day: 'Mercoledì', shortLabel: 'Mer', ranges: ['08:00–19:00'], status: 'partial' },
  { day: 'Giovedì', shortLabel: 'Gio', ranges: ['08:00–19:00'], status: 'full' },
  { day: 'Venerdì', shortLabel: 'Ven', ranges: ['08:00–19:00'], status: 'free' },
  { day: 'Sabato', shortLabel: 'Sab', ranges: ['09:00–14:00'], status: 'partial' },
  { day: 'Domenica', shortLabel: 'Dom', ranges: [], status: 'off' },
];

export const MOCK_MESSAGES: ProMessage[] = [
  {
    id: 'msg-1',
    clientId: 'c1',
    clientName: 'Marco Rossi',
    avatarColor: '#3B82F6',
    lastMessage: 'Conferma che può venire martedì alle 10?',
    timestamp: '10:32',
    unread: 2,
  },
  {
    id: 'msg-2',
    clientId: 'c2',
    clientName: 'Giulia Verdi',
    avatarColor: '#8B5CF6',
    lastMessage: 'Serve anche la pulizia dei vetri esterni.',
    timestamp: 'Ieri',
    unread: 0,
  },
  {
    id: 'msg-3',
    clientId: 'c3',
    clientName: 'Paolo Neri',
    avatarColor: '#0EA5E9',
    lastMessage: 'Sono in ufficio, citofono Neri.',
    timestamp: '08:05',
    unread: 1,
  },
  {
    id: 'msg-4',
    clientId: 'c4',
    clientName: 'Elena Costa',
    avatarColor: '#EC4899',
    lastMessage: 'Grazie per la disponibilità!',
    timestamp: 'Lun',
    unread: 0,
  },
];

const CHAT_THREADS: Record<string, ProChatMessage[]> = {
  c1: [
    { id: '1', sender: 'client', text: 'Buongiorno, conferma che può venire martedì alle 10?', timestamp: '09:42' },
    { id: '2', sender: 'pro', text: 'Buongiorno! Sì, confermo la disponibilità per le 10:00.', timestamp: '09:48' },
    { id: '3', sender: 'client', text: 'Perfetto, ci vediamo martedì. Citofono Rossi.', timestamp: '10:32' },
  ],
  c2: [
    { id: '1', sender: 'client', text: 'Buonasera, avrei bisogno di una pulizia post-cantiere.', timestamp: '18:20' },
    { id: '2', sender: 'pro', text: 'Certo, posso passare giovedì pomeriggio. Le va bene?', timestamp: '18:35' },
    { id: '3', sender: 'client', text: 'Serve anche la pulizia dei vetri esterni.', timestamp: 'Ieri' },
  ],
  c3: [
    { id: '1', sender: 'pro', text: 'Buongiorno, sono in arrivo per le 8.', timestamp: '07:50' },
    { id: '2', sender: 'client', text: 'Sono in ufficio, citofono Neri.', timestamp: '08:05' },
  ],
  c4: [
    { id: '1', sender: 'pro', text: 'Grazie a lei, a presto!', timestamp: '16:10' },
    { id: '2', sender: 'client', text: 'Grazie per la disponibilità!', timestamp: 'Lun' },
  ],
};

export function getRequestById(id: string) {
  return MOCK_REQUESTS.find((request) => request.id === id);
}

export function getMessageByClientId(clientId: string) {
  return MOCK_MESSAGES.find((message) => message.clientId === clientId);
}

export function getChatMessagesForClient(clientId: string): ProChatMessage[] {
  return CHAT_THREADS[clientId] ?? [];
}

export function getAppointmentsForDay(dateKey: string) {
  return MOCK_APPOINTMENTS.filter((apt) => apt.dateKey === dateKey);
}

function hourToNum(value: string): number {
  return parseInt(value.split(':')[0] ?? '0', 10);
}

function isHourInAppointment(hour: string, start: string, end: string): boolean {
  const h = hourToNum(hour);
  const s = hourToNum(start);
  const e = hourToNum(end);
  return h >= s && h < e;
}

export function getTimeSlotsForDay(dateKey: string): TimeSlot[] {
  const appointments = getAppointmentsForDay(dateKey);
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  const dayMeta = AGENDA_DAYS.find((d) => d.key === dateKey);

  return hours.map((hour) => {
    if (dayMeta?.availability === 'off') {
      return { hour, status: 'busy' as const, label: 'Non disponibile' };
    }

    const apt = appointments.find((a) => isHourInAppointment(hour, a.time, a.endTime));
    if (apt) {
      return {
        hour,
        status: apt.status === 'in_progress' ? 'busy' : 'booked',
        appointmentId: apt.id,
        label: apt.serviceTitle,
      };
    }

    return { hour, status: 'free' as const };
  });
}

export function getTodayStats() {
  const todayKey = '2026-06-09';
  const requestsToday = MOCK_REQUESTS.filter((r) => r.status === 'pending' || r.createdAt.includes(':')).length;
  const appointmentsToday = MOCK_APPOINTMENTS.filter((a) => a.dateKey === todayKey).length;
  const pendingCount = MOCK_REQUESTS.filter((r) => r.status === 'pending').length;
  return { requestsToday, appointmentsToday, pendingCount };
}

export function formatMinutesAgo(minutes: number): string {
  if (minutes < 1) return 'Adesso';
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h fa`;
}

export function formatResponseCountdown(minutes: number): string {
  if (minutes <= 0) return 'Scaduto';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
