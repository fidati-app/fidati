export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';
export type AccountStatus = 'verified' | 'in_review' | 'unverified';
export type DayAvailability = 'free' | 'partial' | 'full' | 'off';

export interface ProRequest {
  id: string;
  clientName: string;
  serviceTitle: string;
  category: string;
  date: string;
  time: string;
  price: number;
  address: string;
  zone: string;
  distanceKm: number;
  note?: string;
  status: RequestStatus;
  createdAt: string;
  minutesAgo: number;
  clientVerified: boolean;
  clientRating: number;
  responseDeadlineMinutes: number;
  onlinePaymentAvailable: boolean;
}

export interface ProAppointment {
  id: string;
  clientName: string;
  serviceTitle: string;
  date: string;
  dateKey: string;
  time: string;
  endTime: string;
  address: string;
  zone: string;
  status: 'upcoming' | 'in_progress' | 'done';
}

export interface ProMessage {
  id: string;
  clientId: string;
  clientName: string;
  avatarColor: string;
  imageUrl?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface ProChatMessage {
  id: string;
  sender: 'client' | 'pro';
  text: string;
  timestamp: string;
}

export interface ProService {
  id: string;
  title: string;
  priceFrom: number;
  duration: string;
}

export interface ProReview {
  id: string;
  clientName: string;
  rating: number;
  date: string;
  text: string;
  serviceTitle: string;
}

export interface ProPortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  coverImage: string;
  beforeImage?: string;
  afterImage?: string;
  images: string[];
}

export interface ProDashboardStats {
  earningsThisWeek: number;
  earningsThisMonth: number;
  profileCompletion: number;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  newClientsThisMonth: number;
  responseRate: number;
  accountStatus: AccountStatus;
  profileViews: number;
}

export interface ProProfile {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  bio: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  memberSince: string;
  earningsThisMonth: number;
  verified: boolean;
  availableToday: boolean;
  baseCity: string | null;
  serviceZones: string[];
  services: ProService[];
  portfolio: ProPortfolioItem[];
  reviews: ProReview[];
  stats: ProDashboardStats;
}

/** Profilo professionista collegato all'account auth (Supabase). */
export interface MyProfessional {
  id: string;
  legacyId: string | null;
  authUserId: string;
  name: string;
  category: string;
  categorySlug: string | null;
  email: string | null;
  phone: string | null;
  bio: string;
  imageUrl: string | null;
  heroImageUrl: string | null;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  pricePerHour: number;
  verified: boolean;
  availableToday: boolean;
  baseCity: string | null;
  serviceAreas: string[];
  serviceZones: string[];
  memberSince: string | null;
  earningsThisMonth: number;
  earningsThisWeek: number;
  profileCompletion: number;
  newClientsThisMonth: number;
  responseRate: number;
  accountStatus: AccountStatus;
  profileViews: number;
  services: ProService[];
  stats: ProDashboardStats;
}

export type MyProfessionalStatus = 'idle' | 'loading' | 'ready' | 'not_found' | 'error';

export interface AgendaDayMeta {
  key: string;
  label: string;
  day: string;
  isToday: boolean;
  availability: DayAvailability;
  appointmentCount: number;
}

export interface TimeSlot {
  hour: string;
  status: 'free' | 'booked' | 'busy';
  appointmentId?: string;
  label?: string;
}

export interface WeeklyAvailabilitySlot {
  day: string;
  shortLabel: string;
  ranges: string[];
  status: DayAvailability;
}
