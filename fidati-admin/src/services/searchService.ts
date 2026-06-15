import { safeSelect } from '@/lib/safeSupabase';
import { supabase } from '@/lib/supabase';

export interface SearchResultItem {
  id: string;
  group: string;
  label: string;
  sub?: string;
  path: string;
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const results: SearchResultItem[] = [];
  const ilike = `%${q}%`;

  const [pros, customers, requests, reports, categories] = await Promise.all([
    safeSelect<{ id: string; name: string; email: string | null; category_label: string }>(
      'professionals',
      'id, name, email, category_label',
      { limit: 8 },
    ).then((rows) =>
      rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(q.toLowerCase()) ||
          r.email?.toLowerCase().includes(q.toLowerCase()) ||
          r.category_label?.toLowerCase().includes(q.toLowerCase()),
      ),
    ),
    safeSelect<{ id: string; name: string; email: string | null }>('customers', 'id, name, email', { limit: 8 }).then(
      (rows) =>
        rows.filter(
          (r) =>
            r.name?.toLowerCase().includes(q.toLowerCase()) ||
            (r.email?.toLowerCase().includes(q.toLowerCase()) ?? false),
        ),
    ),
    safeSelect<{ id: string; service_title: string; zone: string | null }>(
      'booking_requests',
      'id, service_title, zone',
      { limit: 8 },
    ).then((rows) =>
      rows.filter(
        (r) =>
          r.service_title?.toLowerCase().includes(q.toLowerCase()) ||
          (r.zone?.toLowerCase().includes(q.toLowerCase()) ?? false),
      ),
    ),
    safeSelect<{ id: string; reason: string }>('reports', 'id, reason', { limit: 5 }).then((rows) =>
      rows.filter((r) => r.reason?.toLowerCase().includes(q.toLowerCase())),
    ),
    safeSelect<{ id: string; name: string; slug: string }>('service_categories', 'id, name, slug', { limit: 5 }).then(
      (rows) =>
        rows.filter(
          (r) =>
            r.name?.toLowerCase().includes(q.toLowerCase()) ||
            r.slug?.toLowerCase().includes(q.toLowerCase()),
        ),
    ),
  ]);

  for (const p of pros) {
    results.push({
      id: p.id,
      group: 'Professionisti',
      label: p.name,
      sub: p.category_label,
      path: `/professionals/${p.id}`,
    });
  }
  for (const c of customers) {
    results.push({ id: c.id, group: 'Clienti', label: c.name, sub: c.email ?? undefined, path: `/customers/${c.id}` });
  }
  for (const r of requests) {
    results.push({
      id: r.id,
      group: 'Richieste',
      label: r.service_title,
      sub: r.zone ?? undefined,
      path: '/requests',
    });
  }
  for (const r of reports) {
    results.push({ id: r.id, group: 'Segnalazioni', label: r.reason.slice(0, 60), path: '/reports' });
  }
  for (const c of categories) {
    results.push({ id: c.id, group: 'Impostazioni', label: c.name, sub: c.slug, path: '/settings' });
  }

  // Chat/messaggi
  try {
    const { data: messages } = await supabase
      .from('messages')
      .select('id, body, conversation_id')
      .ilike('body', ilike)
      .limit(5);
    for (const m of messages ?? []) {
      results.push({
        id: m.id,
        group: 'Chat',
        label: (m.body as string).slice(0, 80),
        path: `/chats/${m.conversation_id}`,
      });
    }
  } catch {
    /* ignore */
  }

  return results.slice(0, 25);
}
