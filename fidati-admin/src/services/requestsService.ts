import { supabase } from '@/lib/supabase';
import type { BookingRequestRow } from '@/types';

export type RequestFilters = {
  search?: string;
  status?: string;
  category?: string;
  city?: string;
  customer?: string;
  professional?: string;
  urgent?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function fetchBookingRequests(filters: RequestFilters = {}) {
  let query = supabase
    .from('booking_requests')
    .select(
      'id, service_title, category_label, status, scheduled_date, scheduled_time, price, zone, note, created_at, customers(name, email), professionals(name, category_label)',
    )
    .order('created_at', { ascending: false });

  const { search = '', status = 'all', category = '', city = '', dateFrom = '', dateTo = '', minPrice = 0, maxPrice = 0 } = filters;

  if (status !== 'all') query = query.eq('status', status);
  if (category.trim()) query = query.ilike('category_label', `%${category.trim()}%`);
  if (city.trim()) query = query.ilike('zone', `%${city.trim()}%`);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (minPrice > 0) query = query.gte('price', minPrice);
  if (maxPrice > 0) query = query.lte('price', maxPrice);
  if (search.trim()) {
    query = query.or(`service_title.ilike.%${search.trim()}%,zone.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query.limit(300);
  if (error) throw error;

  let rows = (data ?? []) as BookingRequestRow[];
  if (filters.customer?.trim()) {
    const q = filters.customer.toLowerCase();
    rows = rows.filter((r) => r.customers?.name?.toLowerCase().includes(q) || r.customers?.email?.toLowerCase().includes(q));
  }
  if (filters.professional?.trim()) {
    const q = filters.professional.toLowerCase();
    rows = rows.filter((r) => r.professionals?.name?.toLowerCase().includes(q));
  }
  return rows;
}

export async function fetchBookingRequestById(id: string) {
  const { data, error } = await supabase
    .from('booking_requests')
    .select(
      'id, service_title, category_label, status, scheduled_date, scheduled_time, price, zone, note, created_at, updated_at, customer_id, professional_id, conversation_id, customers(id, name, email, phone), professionals(id, name, email, phone, category_label)',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as BookingRequestRow | null;
}

export async function fetchRequestPayments(requestId: string) {
  const { data: bookings } = await supabase.from('bookings').select('id').eq('booking_request_id', requestId);
  if (!bookings?.length) return [];
  const ids = bookings.map((b) => b.id as string);
  const { data, error } = await supabase
    .from('payments')
    .select('id, amount, status, created_at')
    .in('booking_id', ids)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function fetchRequestConversation(requestId: string) {
  const { data: req } = await supabase.from('booking_requests').select('conversation_id').eq('id', requestId).maybeSingle();
  if (!req?.conversation_id) return null;
  const { data, error } = await supabase
    .from('conversations')
    .select('id, last_message, last_message_at')
    .eq('id', req.conversation_id)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function fetchRequestNotes(requestId: string) {
  const { data, error } = await supabase
    .from('admin_notes')
    .select('id, body, created_at, admin_users(full_name)')
    .eq('target_type', 'booking_request')
    .eq('target_id', requestId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function fetchRequestAuditLogs(requestId: string) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, action, metadata, created_at, admin_users(full_name, role)')
    .eq('target_type', 'booking_request')
    .eq('target_id', requestId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** @deprecated */
export async function fetchBookings(search = '') {
  let query = supabase
    .from('bookings')
    .select(
      'id, service_title, status, appointment_status, scheduled_date, scheduled_time, price, zone, created_at, customers(name), professionals(name)',
    )
    .order('created_at', { ascending: false });
  if (search.trim()) query = query.ilike('service_title', `%${search.trim()}%`);
  const { data, error } = await query.limit(200);
  if (error) throw error;
  return data ?? [];
}
