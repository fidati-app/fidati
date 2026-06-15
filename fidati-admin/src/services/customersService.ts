import { supabase } from '@/lib/supabase';

export async function fetchCustomers(search = '') {
  let query = supabase
    .from('customers')
    .select('id, name, email, phone, bookings_count, completed_count, rating, member_since, created_at')
    .order('created_at', { ascending: false });

  if (search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function fetchCustomerDetail(customerId: string) {
  const [customerRes, requestsRes, reportsRes] = await Promise.all([
    supabase.from('customers').select('*').eq('id', customerId).maybeSingle(),
    supabase
      .from('booking_requests')
      .select('id, service_title, status, scheduled_date, price, zone, created_at, professionals(name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('reports')
      .select('id, reason, status, target_type, created_at')
      .eq('reporter_customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (customerRes.error) throw customerRes.error;
  if (requestsRes.error) throw requestsRes.error;
  if (reportsRes.error) throw reportsRes.error;

  return {
    customer: customerRes.data,
    requests: requestsRes.data ?? [],
    reports: reportsRes.data ?? [],
  };
}
