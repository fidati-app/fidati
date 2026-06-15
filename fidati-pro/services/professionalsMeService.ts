import { devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { AccountStatus, ClientVisibilityStatus, MyProfessional, ProDashboardStats, ProProfile, ProService, VerificationStatus } from '@/types';

interface ServiceRow {
  id: string;
  legacy_id: string | null;
  service_slug: string | null;
  title: string;
  price_from: number;
  price_max: number | null;
  quote_required: boolean | null;
  duration_label: string;
  sort_order: number;
}

interface ZoneRow {
  zone_name: string;
  sort_order: number;
}

interface MyProfessionalRow {
  id: string;
  legacy_id: string | null;
  auth_user_id: string | null;
  name: string;
  account_kind: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  category_label: string;
  category_slug: string | null;
  email: string | null;
  phone: string | null;
  bio: string;
  image_url: string | null;
  hero_image_url: string | null;
  avatar_color: string;
  rating: number;
  review_count: number;
  jobs_completed: number;
  price_per_hour: number;
  verified: boolean;
  available_today: boolean;
  base_city: string | null;
  service_areas: string[] | null;
  member_since: string | null;
  earnings_this_month: number;
  earnings_this_week: number;
  profile_completion: number;
  new_clients_this_month: number;
  response_rate: number;
  account_status: string;
  profile_views: number;
  verification_status: string | null;
  verification_requested_at: string | null;
  verification_rejected_reason: string | null;
  client_visibility_status: string | null;
  client_visibility_reason: string | null;
  client_visibility_changed_at: string | null;
  professional_services?: ServiceRow[] | null;
  professional_zones?: ZoneRow[] | null;
}

const MY_PROFESSIONAL_SELECT = `
  id,
  legacy_id,
  auth_user_id,
  name,
  account_kind,
  first_name,
  last_name,
  company_name,
  category_label,
  category_slug,
  email,
  phone,
  bio,
  image_url,
  hero_image_url,
  avatar_color,
  rating,
  review_count,
  jobs_completed,
  price_per_hour,
  verified,
  available_today,
  base_city,
  service_areas,
  member_since,
  earnings_this_month,
  earnings_this_week,
  profile_completion,
  new_clients_this_month,
  response_rate,
  account_status,
  profile_views,
  verification_status,
  verification_requested_at,
  verification_rejected_reason,
  client_visibility_status,
  client_visibility_reason,
  client_visibility_changed_at,
  professional_services (
    id,
    legacy_id,
    service_slug,
    title,
    price_from,
    price_max,
    quote_required,
    duration_label,
    sort_order
  ),
  professional_zones (
    zone_name,
    sort_order
  )
`;

function mapClientVisibilityStatus(value: string | null | undefined): ClientVisibilityStatus {
  if (value === 'hidden_changes' || value === 'pending_review') return value;
  return 'visible';
}

function mapVerificationStatus(value: string | null | undefined): VerificationStatus {
  if (
    value === 'pending_review' ||
    value === 'verified' ||
    value === 'rejected' ||
    value === 'changes_requested'
  ) {
    return value;
  }
  return 'unverified';
}

function mapAccountStatus(value: string | null | undefined): AccountStatus {
  if (value === 'verified' || value === 'in_review' || value === 'unverified') {
    return value;
  }
  return 'unverified';
}

function mapAccountKind(value: string | null | undefined): import('@/types').ProfessionalAccountKind {
  return value === 'company' ? 'company' : 'individual';
}

function mapServices(rows: ServiceRow[] | null | undefined): ProService[] {
  const seen = new Set<string>();

  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((row) => {
      const key = row.service_slug ?? row.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({
      id: row.legacy_id ?? row.id,
      title: row.title,
      priceFrom: Number(row.price_from),
      priceMax: row.price_max != null ? Number(row.price_max) : null,
      quoteRequired: Boolean(row.quote_required),
      duration: row.duration_label,
    }));
}

function mapServiceZones(row: MyProfessionalRow): string[] {
  const fromZones = (row.professional_zones ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((zone) => zone.zone_name.trim())
    .filter(Boolean);

  if (fromZones.length > 0) {
    return fromZones;
  }

  return (row.service_areas ?? []).map((area) => area.trim()).filter(Boolean);
}

function buildStats(row: MyProfessionalRow): ProDashboardStats {
  return {
    earningsThisWeek: Number(row.earnings_this_week ?? 0),
    earningsThisMonth: Number(row.earnings_this_month ?? 0),
    profileCompletion: row.profile_completion ?? 0,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    jobsCompleted: row.jobs_completed ?? 0,
    newClientsThisMonth: row.new_clients_this_month ?? 0,
    responseRate: row.response_rate ?? 100,
    accountStatus: mapAccountStatus(row.account_status),
    profileViews: row.profile_views ?? 0,
  };
}

function mapMyProfessionalRow(row: MyProfessionalRow): MyProfessional {
  const serviceZones = mapServiceZones(row);
  const serviceAreas = (row.service_areas ?? serviceZones).map((area) => area.trim()).filter(Boolean);
  const stats = buildStats(row);

  return {
    id: row.id,
    legacyId: row.legacy_id,
    authUserId: row.auth_user_id ?? '',
    accountKind: mapAccountKind(row.account_kind),
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    name: row.name,
    category: row.category_label,
    categorySlug: row.category_slug,
    email: row.email,
    phone: row.phone,
    bio: row.bio ?? '',
    imageUrl: row.image_url,
    heroImageUrl: row.hero_image_url,
    avatarColor: row.avatar_color,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    jobsCompleted: row.jobs_completed ?? 0,
    pricePerHour: Number(row.price_per_hour ?? 0),
    verified: row.verified,
    availableToday: row.available_today,
    baseCity: row.base_city,
    serviceAreas,
    serviceZones,
    memberSince: row.member_since,
    earningsThisMonth: Number(row.earnings_this_month ?? 0),
    earningsThisWeek: Number(row.earnings_this_week ?? 0),
    profileCompletion: row.profile_completion ?? 0,
    newClientsThisMonth: row.new_clients_this_month ?? 0,
    responseRate: row.response_rate ?? 100,
    accountStatus: mapAccountStatus(row.account_status),
    profileViews: row.profile_views ?? 0,
    verificationStatus: mapVerificationStatus(row.verification_status),
    verificationRequestedAt: row.verification_requested_at,
    verificationRejectedReason: row.verification_rejected_reason,
    clientVisibilityStatus: mapClientVisibilityStatus(row.client_visibility_status),
    clientVisibilityReason: row.client_visibility_reason,
    clientVisibilityChangedAt: row.client_visibility_changed_at,
    services: mapServices(row.professional_services ?? undefined),
    stats,
  };
}

export async function fetchMyProfessionalByAuthUserId(
  authUserId: string,
): Promise<MyProfessional | null> {
  const { data, error } = await supabase
    .from('professionals')
    .select(MY_PROFESSIONAL_SELECT)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    devLogSupabaseError('fetchMyProfessional', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapMyProfessionalRow(data as MyProfessionalRow);
}

export function myProfessionalToProProfile(professional: MyProfessional): ProProfile {
  return {
    id: professional.legacyId ?? professional.id,
    name: professional.name,
    category: professional.category,
    email: professional.email ?? '',
    phone: professional.phone ?? '',
    bio: professional.bio,
    rating: professional.rating,
    reviewCount: professional.reviewCount,
    jobsCompleted: professional.jobsCompleted,
    memberSince: professional.memberSince ?? '—',
    earningsThisMonth: professional.earningsThisMonth,
    verified: professional.verified,
    availableToday: professional.availableToday,
    baseCity: professional.baseCity,
    serviceZones: professional.serviceZones,
    services: professional.services,
    portfolio: [],
    reviews: [],
    stats: professional.stats,
  };
}
