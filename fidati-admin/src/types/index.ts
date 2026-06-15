export type AdminRole = 'super_admin' | 'review_team' | 'accounting_team' | 'support_team' | 'operator';

export type VerificationStatus =
  | 'unverified'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'changes_requested';

export interface AdminUser {
  id: string;
  authUserId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
}

export type ClientVisibilityStatus = 'visible' | 'hidden_changes' | 'pending_review';

export interface ProfessionalRow {
  id: string;
  name: string;
  category_label: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  base_city: string | null;
  verified: boolean;
  verification_status: VerificationStatus;
  verification_requested_at: string | null;
  verification_rejected_reason: string | null;
  account_status: string;
  client_visibility_status: ClientVisibilityStatus;
  client_visibility_reason: string | null;
  client_visibility_changed_at: string | null;
  has_pro_app: boolean;
  rating: number;
  review_count: number;
  jobs_completed: number;
  price_per_hour: number;
  created_at: string;
  service_categories?: { slug: string; name: string } | { slug: string; name: string }[] | null;
}

export interface VerificationQueueItem extends ProfessionalRow {
  verification_requested_at: string | null;
}

export interface AuditLogRow {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  admin_users?: { full_name: string; email: string } | null;
}

export interface DashboardStats {
  professionalsTotal: number;
  professionalsVerified: number;
  professionalsUnverified: number;
  pendingVerifications: number;
  rejectedVerifications: number;
  bannedProfessionals: number;
  customersTotal: number;
  requestsTotal: number;
  openRequests: number;
  completedRequests: number;
  openReports: number;
  paymentsTotal: number;
  revenueTotal: number;
  commissionEstimate: number;
  activeStaff: number;
}

export interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  customers?: { name?: string } | null;
  bookings?: { service_title?: string } | null;
}

export interface RefundRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  reason?: string | null;
}

export interface ConversationRow {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_customer?: number;
  unread_professional?: number;
  customers?: { name?: string; email?: string } | null;
  professionals?: { name?: string; category_label?: string } | null;
}

export interface MessageRow {
  id: string;
  body: string;
  sender: string;
  kind?: string;
  created_at: string;
  read_at?: string | null;
}

export interface ProfessionalPreview {
  id: string;
  name: string;
  category_label?: string;
  verification_status?: string;
  account_status?: string;
  base_city?: string | null;
  created_at?: string;
  verification_requested_at?: string | null;
}

export interface ReportPreview {
  id: string;
  reason: string;
  status: string;
  target_type?: string;
  created_at?: string;
}

export interface ServiceCategoryRow {
  id: string;
  slug: string;
  name: string;
  professional_count: number;
  is_active: boolean;
  sort_order: number;
  icon?: string;
}

export interface DefaultServiceRow {
  id: string;
  category_id: string;
  title: string;
  from_price: number;
  sort_order: number;
  is_active: boolean;
  service_categories?: { name: string; slug: string } | null;
}

export interface CityCatalogRow {
  id: string;
  name: string;
  province: string | null;
  region: string;
  istat_code?: string | null;
  slug?: string | null;
  label?: string;
  is_active: boolean;
  sort_order: number;
}

export interface ReportRow {
  id: string;
  legacy_id?: string | null;
  reason: string;
  details?: string | null;
  status: string;
  priority: string;
  target_type: string;
  target_id: string;
  created_at: string;
  updated_at?: string;
  reporter_customer_id?: string | null;
  reporter_professional_id?: string | null;
  assigned_admin_id?: string | null;
  customers?: { name?: string; email?: string; phone?: string } | null;
  professionals?: { name?: string; email?: string; phone?: string } | null;
  assigned_admin?: { id?: string; full_name?: string; email?: string } | null;
}

export interface ReportTicketEvent {
  id: string;
  event_type: string;
  previous_value?: string | null;
  new_value?: string | null;
  note?: string | null;
  created_at: string;
  admin_users?: { full_name?: string; email?: string } | null;
}

export interface BookingRequestRow {
  id: string;
  service_title: string;
  category_label?: string;
  status: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  price?: number | null;
  zone?: string | null;
  note?: string | null;
  is_urgent?: boolean;
  conversation_id?: string | null;
  created_at: string;
  updated_at?: string;
  customer_id?: string;
  professional_id?: string;
  customers?: { id?: string; name?: string; email?: string; phone?: string } | null;
  professionals?: { id?: string; name?: string; email?: string; phone?: string; category_label?: string } | null;
}
