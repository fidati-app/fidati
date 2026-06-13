import type {
  AccountStatus,
  AppointmentStatus,
  BookingStatus,
  DayAvailability,
  MessageKind,
  MessageSender,
  NotificationChannel,
  PackageTier,
  PaymentStatus,
  ProfileStepId,
  RefundStatus,
  ReportStatus,
  ReportTargetType,
  RequestStatus,
  TicketStatus,
} from './enums';

/** Campi comuni Supabase */
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory extends Timestamps {
  id: string;
  legacy_id: string | null;
  slug: string;
  name: string;
  icon: string;
  description: string;
  professional_count: number;
  home_count: number;
  sort_order: number;
  image_url: string | null;
  is_active: boolean;
}

export interface Service extends Timestamps {
  id: string;
  legacy_id: string | null;
  category_id: string;
  title: string;
  icon: string;
  description: string;
  from_price: number;
  weekly_bookings: number;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ServicePackage extends Timestamps {
  id: string;
  legacy_id: string | null;
  service_id: string;
  tier: PackageTier;
  title: string;
  description: string;
  price: number;
  duration_label: string;
  sort_order: number;
}

export interface Customer extends Timestamps {
  id: string;
  auth_user_id: string | null;
  legacy_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  avatar_color: string;
  member_since: string | null;
  bookings_count: number;
  completed_count: number;
  rating: number | null;
}

export interface Professional extends Timestamps {
  id: string;
  auth_user_id: string | null;
  legacy_id: string | null;
  category_id: string;
  name: string;
  category_label: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  avatar_color: string;
  bio: string;
  why_choose: string[];
  rating: number;
  review_count: number;
  jobs_completed: number;
  price_per_hour: number;
  distance_km: number | null;
  available_today: boolean;
  verified: boolean;
  badge_document: boolean;
  badge_phone: boolean;
  badge_professional: boolean;
  member_since: string | null;
  earnings_this_month: number;
  earnings_this_week: number;
  profile_completion: number;
  new_clients_this_month: number;
  response_rate: number;
  account_status: AccountStatus;
  profile_views: number;
  has_pro_app: boolean;
  urgent_badge: string | null;
  is_new_featured: boolean;
}

export interface ProfessionalZone {
  id: string;
  professional_id: string;
  zone_name: string;
  sort_order: number;
  created_at: string;
}

export interface ProfessionalService extends Timestamps {
  id: string;
  legacy_id: string | null;
  professional_id: string;
  catalog_service_id: string | null;
  title: string;
  price_from: number;
  duration_label: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProfessionalServicePackage extends Timestamps {
  id: string;
  legacy_id: string | null;
  professional_id: string;
  professional_service_id: string | null;
  tier: PackageTier;
  title: string;
  description: string;
  price: number;
  duration_label: string;
  sort_order: number;
}

export interface ProfessionalPortfolioItem extends Timestamps {
  id: string;
  legacy_id: string | null;
  professional_id: string;
  title: string;
  subtitle: string;
  category: string;
  cover_image: string;
  before_image: string | null;
  after_image: string | null;
  sort_order: number;
}

export interface ProfessionalPortfolioImage {
  id: string;
  portfolio_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProfessionalAvailability extends Timestamps {
  id: string;
  professional_id: string;
  day_of_week: number;
  short_label: string;
  day_label: string;
  time_ranges: string[];
  status: DayAvailability;
}

export interface ProfessionalAvailabilityDay extends Timestamps {
  id: string;
  professional_id: string;
  date_key: string;
  availability: DayAvailability;
  appointment_count: number;
}

export interface ProfessionalProfileStep {
  id: string;
  professional_id: string;
  step: ProfileStepId;
  completed_at: string | null;
  created_at: string;
}

export interface BookingRequest extends Timestamps {
  id: string;
  legacy_id: string | null;
  customer_id: string;
  professional_id: string;
  conversation_id: string | null;
  service_title: string;
  category_label: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  price: number;
  address: string;
  zone: string | null;
  distance_km: number | null;
  note: string | null;
  status: RequestStatus;
  client_verified: boolean;
  client_rating: number | null;
  response_deadline_at: string | null;
  online_payment_available: boolean;
  package_title: string | null;
  photos: string[];
}

export interface Booking extends Timestamps {
  id: string;
  legacy_id: string | null;
  customer_id: string;
  professional_id: string;
  booking_request_id: string | null;
  professional_service_id: string | null;
  service_title: string;
  category_label: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  end_time: string | null;
  status: BookingStatus;
  appointment_status: AppointmentStatus | null;
  price: number;
  address: string | null;
  zone: string | null;
  note: string | null;
}

export interface Conversation extends Timestamps {
  id: string;
  legacy_id: string | null;
  customer_id: string;
  professional_id: string;
  last_message: string;
  last_message_at: string;
  unread_customer: number;
  unread_professional: number;
  pending_deadline_at: string | null;
}

export interface Message {
  id: string;
  legacy_id: string | null;
  conversation_id: string;
  sender: MessageSender;
  kind: MessageKind;
  body: string;
  image_url: string | null;
  booking_request_id: string | null;
  sent_at: string;
  created_at: string;
}

export interface Review extends Timestamps {
  id: string;
  legacy_id: string | null;
  professional_id: string;
  customer_id: string | null;
  booking_id: string | null;
  rating: number;
  body: string;
  service_title: string | null;
  client_display_name: string | null;
  review_date: string | null;
  is_published: boolean;
}

export interface HomePopularService extends Timestamps {
  id: string;
  legacy_id: string | null;
  category_id: string;
  title: string;
  icon: string;
  rating: number;
  completed_jobs: number;
  avg_price: number;
  image_url: string | null;
  sort_order: number;
}

export interface HomeOffer extends Timestamps {
  id: string;
  legacy_id: string | null;
  category_id: string | null;
  title: string;
  highlight: string;
  subtitle: string;
  sort_order: number;
}

export interface HomeServiceTile extends Timestamps {
  id: string;
  legacy_id: string | null;
  audience: 'casa' | 'azienda';
  title: string;
  icon: string;
  category_slug: string;
  sort_order: number;
}

export interface Payment extends Timestamps {
  id: string;
  legacy_id: string | null;
  booking_id: string;
  customer_id: string;
  professional_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  provider: string | null;
  provider_ref: string | null;
  authorized_at: string | null;
  captured_at: string | null;
}

export interface Refund extends Timestamps {
  id: string;
  legacy_id: string | null;
  payment_id: string;
  amount: number;
  status: RefundStatus;
  reason: string | null;
  processed_at: string | null;
}

export interface Notification {
  id: string;
  customer_id: string | null;
  professional_id: string | null;
  channel: NotificationChannel;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface SupportTicket extends Timestamps {
  id: string;
  legacy_id: string | null;
  customer_id: string | null;
  professional_id: string | null;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: string;
  resolved_at: string | null;
}

export interface Report extends Timestamps {
  id: string;
  legacy_id: string | null;
  reporter_customer_id: string | null;
  reporter_professional_id: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
}

/** Schema Database tipizzato per Supabase client (futuro) */
export interface Database {
  public: {
    Tables: {
      service_categories: { Row: ServiceCategory; Insert: Partial<ServiceCategory>; Update: Partial<ServiceCategory> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      service_packages: { Row: ServicePackage; Insert: Partial<ServicePackage>; Update: Partial<ServicePackage> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      professionals: { Row: Professional; Insert: Partial<Professional>; Update: Partial<Professional> };
      professional_zones: { Row: ProfessionalZone; Insert: Partial<ProfessionalZone>; Update: Partial<ProfessionalZone> };
      professional_services: { Row: ProfessionalService; Insert: Partial<ProfessionalService>; Update: Partial<ProfessionalService> };
      professional_service_packages: { Row: ProfessionalServicePackage; Insert: Partial<ProfessionalServicePackage>; Update: Partial<ProfessionalServicePackage> };
      professional_portfolio: { Row: ProfessionalPortfolioItem; Insert: Partial<ProfessionalPortfolioItem>; Update: Partial<ProfessionalPortfolioItem> };
      professional_portfolio_images: { Row: ProfessionalPortfolioImage; Insert: Partial<ProfessionalPortfolioImage>; Update: Partial<ProfessionalPortfolioImage> };
      professional_availability: { Row: ProfessionalAvailability; Insert: Partial<ProfessionalAvailability>; Update: Partial<ProfessionalAvailability> };
      professional_availability_days: { Row: ProfessionalAvailabilityDay; Insert: Partial<ProfessionalAvailabilityDay>; Update: Partial<ProfessionalAvailabilityDay> };
      professional_profile_steps: { Row: ProfessionalProfileStep; Insert: Partial<ProfessionalProfileStep>; Update: Partial<ProfessionalProfileStep> };
      booking_requests: { Row: BookingRequest; Insert: Partial<BookingRequest>; Update: Partial<BookingRequest> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      conversations: { Row: Conversation; Insert: Partial<Conversation>; Update: Partial<Conversation> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      refunds: { Row: Refund; Insert: Partial<Refund>; Update: Partial<Refund> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      support_tickets: { Row: SupportTicket; Insert: Partial<SupportTicket>; Update: Partial<SupportTicket> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      home_popular_services: { Row: HomePopularService; Insert: Partial<HomePopularService>; Update: Partial<HomePopularService> };
      home_offers: { Row: HomeOffer; Insert: Partial<HomeOffer>; Update: Partial<HomeOffer> };
      home_service_tiles: { Row: HomeServiceTile; Insert: Partial<HomeServiceTile>; Update: Partial<HomeServiceTile> };
    };
  };
}
