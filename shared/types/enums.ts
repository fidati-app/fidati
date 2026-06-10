/** Tipi enum allineati a supabase/schema.sql */

export type PackageTier = 'base' | 'standard' | 'premium';

export type BookingStatus = 'incoming' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export type AppointmentStatus = 'upcoming' | 'in_progress' | 'done';

export type DayAvailability = 'free' | 'partial' | 'full' | 'off';

export type MessageSender = 'customer' | 'professional' | 'system';

export type MessageKind = 'text' | 'booking_request' | 'system';

export type AccountStatus = 'verified' | 'in_review' | 'unverified';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export type ReportTargetType = 'professional' | 'customer' | 'booking' | 'review' | 'message';

export type ProfileStepId = 'photo' | 'bio' | 'services' | 'portfolio' | 'zones';

export type CategorySlug =
  | 'pulizie'
  | 'idraulici'
  | 'elettricisti'
  | 'giardinieri'
  | 'tuttofare';
