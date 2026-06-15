import { safeSelect } from '@/lib/safeSupabase';
import type { PaymentRow, RefundRow } from '@/types';

export async function fetchPayments(): Promise<PaymentRow[]> {
  return safeSelect<PaymentRow>('payments', 'id, amount, status, created_at, bookings(service_title), customers(name)', {
    limit: 200,
    order: { column: 'created_at', ascending: false },
  });
}

export async function fetchRefunds(): Promise<RefundRow[]> {
  return safeSelect<RefundRow>('refunds', 'id, amount, status, created_at, reason', {
    limit: 100,
    order: { column: 'created_at', ascending: false },
  });
}
