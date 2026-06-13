import { Ionicons } from '@expo/vector-icons';

export type ServiceCity =
  | 'Barletta'
  | 'Andria'
  | 'Trani'
  | 'Bisceglie'
  | 'Margherita di Savoia';

export type CategorySlug =
  | 'elettricisti'
  | 'idraulici'
  | 'fabbri'
  | 'giardinieri'
  | 'pulizie'
  | 'imbianchini'
  | 'serramentisti'
  | 'caldaie'
  | 'condizionatori'
  | 'traslochi-sgomberi'
  | 'antennisti'
  | 'montaggio-mobili'
  | 'tende-da-sole';

export type CategoryIcon = keyof typeof Ionicons.glyphMap;

export interface ItalianMunicipality {
  name: string;
  province: string;
  region: string;
  istatCode: string;
  latitude?: number;
  longitude?: number;
  /** Abitanti (Censimento ISTAT 2011) — usato per ordinare i suggerimenti di ricerca */
  population?: number;
}

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
  /** Sede operativa principale */
  city: ServiceCity;
  /** Comuni in cui opera */
  serviceAreas: ServiceCity[];
  /** Badge urgenza da Supabase (es. "Oggi") */
  urgentBadge?: string | null;
  /** In evidenza come nuovo professionista */
  isNewFeatured?: boolean;
  /** Data iscrizione (Supabase `created_at`) */
  createdAt?: string;
  /** Data verifica, se disponibile in futuro */
  verifiedAt?: string;
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
