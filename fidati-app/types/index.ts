import { Ionicons } from '@expo/vector-icons';

export type CategorySlug =
  | 'pulizie'
  | 'idraulici'
  | 'elettricisti'
  | 'giardinieri'
  | 'tuttofare';

export type CategoryIcon = keyof typeof Ionicons.glyphMap;

export type PackageTier = 'base' | 'standard' | 'premium';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  icon: CategoryIcon;
  description: string;
  professionalCount: number;
  /** Conteggio mostrato in home (marketplace) */
  homeCount: number;
}

export interface ServicePackage {
  id: string;
  tier: PackageTier;
  title: string;
  description: string;
  price: number;
  duration: string;
}

export interface Professional {
  id: string;
  name: string;
  categorySlug: CategorySlug;
  category: string;
  imageUrl: string;
  heroImageUrl: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  pricePerHour: number;
  distanceKm: number;
  availableToday: boolean;
  verified: boolean;
  badges: {
    document: boolean;
    phone: boolean;
    professional: boolean;
  };
  bio: string;
  whyChoose: string[];
  packages: ServicePackage[];
}

export type BookingStatus = 'confirmed' | 'incoming' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalImageUrl: string;
  category: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  address?: string;
  note?: string;
}

export interface Message {
  id: string;
  professionalId: string;
  professionalName: string;
  imageUrl: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  pendingDeadline?: number;
}

export type ChatSender = 'user' | 'professional' | 'system';

export type ChatMessageKind = 'text' | 'booking_request' | 'system';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  kind: ChatMessageKind;
  text: string;
  timestamp: string;
  imageUri?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  avatarColor: string;
  memberSince: string;
  stats: {
    bookings: number;
    completed: number;
    rating: number;
  };
}
