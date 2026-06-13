import { PROFESSIONAL_IMAGES, USER_IMAGE } from '@/constants/images';
import { MOCK_ZONE_PROFESSIONALS } from '@/data/professionals';
import { Booking, Message, Professional, User } from '@/types';

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Marco Rossi',
  email: 'marco.rossi@email.com',
  imageUrl: USER_IMAGE,
  avatarColor: '#3B82F6',
  memberSince: 'Gennaio 2024',
  stats: { bookings: 12, completed: 8, rating: 4.9 },
};

export const MOCK_PROFESSIONALS: Professional[] = MOCK_ZONE_PROFESSIONALS;

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    professionalId: '1',
    professionalName: 'Laura Bianchi',
    professionalImageUrl: PROFESSIONAL_IMAGES['1'].avatar,
    category: 'Pulizie',
    serviceTitle: 'Pulizia casa',
    date: '12 Giu 2024',
    time: '10:00',
    status: 'confirmed',
    price: 85,
    address: 'Via Roma 12, Milano',
    note: 'Piano secondo, citofono Bianchi. Attenzione al parquet in soggiorno.',
  },
  {
    id: 'b2',
    professionalId: '2',
    professionalName: 'Luca Bianchi',
    professionalImageUrl: PROFESSIONAL_IMAGES['2'].avatar,
    category: 'Idraulico',
    serviceTitle: 'Riparazione perdita',
    date: '8 Giu 2024',
    time: '14:30',
    status: 'incoming',
    price: 60,
    address: 'Corso Garibaldi 45, Milano',
    note: 'Perdita sotto il lavello della cucina.',
  },
  {
    id: 'b3',
    professionalId: '5',
    professionalName: 'Luca Conti',
    professionalImageUrl: PROFESSIONAL_IMAGES['5'].avatar,
    category: 'Montaggio mobili',
    serviceTitle: 'Montaggio mobili',
    date: '28 Mag 2024',
    time: '09:00',
    status: 'completed',
    price: 50,
    address: 'Viale Monza 88, Milano',
  },
  {
    id: 'b4',
    professionalId: '3',
    professionalName: 'Anna Ferrari',
    professionalImageUrl: PROFESSIONAL_IMAGES['3'].avatar,
    category: 'Elettricista',
    serviceTitle: 'Punto luce',
    date: '15 Mag 2024',
    time: '11:00',
    status: 'completed',
    price: 55,
    address: 'Piazza Duomo 3, Milano',
  },
];

export function getBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((booking) => booking.id === id);
}

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    professionalId: '1',
    professionalName: 'Laura Bianchi',
    imageUrl: PROFESSIONAL_IMAGES['1'].avatar,
    avatarColor: '#8B5CF6',
    lastMessage: 'Perfetto, ci vediamo martedì alle 10!',
    timestamp: '10:32',
    unread: 2,
  },
  {
    id: 'm2',
    professionalId: '2',
    professionalName: 'Luca Bianchi',
    imageUrl: PROFESSIONAL_IMAGES['2'].avatar,
    avatarColor: '#0EA5E9',
    lastMessage: 'Ho risolto la perdita, tutto a posto.',
    timestamp: 'Ieri',
    unread: 0,
  },
  {
    id: 'm3',
    professionalId: '5',
    professionalName: 'Luca Conti',
    imageUrl: PROFESSIONAL_IMAGES['5'].avatar,
    avatarColor: '#6366F1',
    lastMessage: 'Porto gli attrezzi necessari.',
    timestamp: 'Lun',
    unread: 0,
  },
];

export function getProfessionalById(id: string): Professional | undefined {
  return MOCK_PROFESSIONALS.find((p) => p.id === id);
}

export function getProfessionalsByCategory(slug: string): Professional[] {
  return MOCK_PROFESSIONALS.filter((p) => p.categorySlug === slug);
}

export function getTopProfessionalsByCategory(slug: string, limit = 4): Professional[] {
  return getProfessionalsByCategory(slug)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getSoonAvailableByCategory(slug: string, limit = 6): Professional[] {
  const inCategory = getProfessionalsByCategory(slug);
  const available = inCategory
    .filter((p) => p.availableToday)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (available.length >= limit) {
    return available.slice(0, limit);
  }

  const rest = inCategory
    .filter((p) => !p.availableToday)
    .sort((a, b) => b.rating - a.rating);

  return [...available, ...rest].slice(0, limit);
}

export function getAvailableToday(): Professional[] {
  return MOCK_PROFESSIONALS.filter((p) => p.availableToday);
}

export function getRecommendedProfessionals(): Professional[] {
  return [...MOCK_PROFESSIONALS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
}
